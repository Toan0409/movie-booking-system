package com.cinema.movie_booking.seeder;

import com.cinema.movie_booking.dto.tmdb.TmdbCastDTO;
import com.cinema.movie_booking.dto.tmdb.TmdbCreditsDTO;
import com.cinema.movie_booking.dto.tmdb.TmdbCrewDTO;
import com.cinema.movie_booking.dto.tmdb.TmdbGenreDTO;
import com.cinema.movie_booking.dto.tmdb.TmdbMovieDTO;
import com.cinema.movie_booking.dto.tmdb.TmdbPersonDTO;
import com.cinema.movie_booking.entity.Actor;
import com.cinema.movie_booking.entity.Director;
import com.cinema.movie_booking.entity.Genre;
import com.cinema.movie_booking.entity.Movie;
import com.cinema.movie_booking.repository.ActorRepository;
import com.cinema.movie_booking.repository.DirectorRepository;
import com.cinema.movie_booking.repository.GenreRepository;
import com.cinema.movie_booking.repository.MovieRepository;
import com.cinema.movie_booking.service.TmdbApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

/**
 * Service responsible for transactional movie seeding operations.
 *
 * Extracted from DataSeeder to fix the Spring @Transactional self-invocation problem.
 * When @Transactional methods are called within the same class (self-invocation),
 * Spring's AOP proxy is bypassed and transactions are NOT applied.
 * By moving these methods to a separate @Service bean, Spring's proxy correctly
 * wraps each method in a transaction.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MovieSeederService {

    private final GenreRepository genreRepository;
    private final DirectorRepository directorRepository;
    private final ActorRepository actorRepository;
    private final MovieRepository movieRepository;
    private final TmdbApiService tmdbApiService;

    private static final String[] AGE_RATINGS = {"G", "PG", "PG-13", "R"};
    private static final Random RNG = new Random();

    // =========================================================================
    // Movie + Director + Actor (all within a single transaction per movie)
    // =========================================================================

    /**
     * Process and save a single movie along with its director and actors.
     *
     * All DB operations (director save, actor saves, movie save, join-table inserts)
     * run inside ONE transaction. This ensures:
     * - Director and Actor entities remain MANAGED (not detached) when Movie is saved
     * - Hibernate can correctly insert rows into the movie_actor join table
     * - If anything fails, the entire movie (+ its director/actors) is rolled back
     *
     * @param listDTO  the movie DTO from the TMDB list endpoint
     * @param genreMap map of TMDB genre ID → local Genre entity
     * @return true if the movie was saved, false if it already exists
     */
    @Transactional
    public boolean processAndSaveMovie(TmdbMovieDTO listDTO, Map<Integer, Genre> genreMap) {
        if (movieRepository.existsByTitleAndIsDeletedFalse(listDTO.getTitle())) {
            return false;
        }

        // Fetch additional details from TMDB (outside transaction is fine — read-only HTTP calls)
        TmdbMovieDTO detail = tmdbApiService.fetchMovieDetail(listDTO.getId());
        tmdbApiService.sleepSafe(200);
        TmdbCreditsDTO credits = tmdbApiService.fetchMovieCredits(listDTO.getId());
        tmdbApiService.sleepSafe(200);
        String trailerUrl = tmdbApiService.fetchTrailerUrl(listDTO.getId());
        tmdbApiService.sleepSafe(200);

        // Resolve related entities — all within this transaction → entities stay MANAGED
        Genre genre = resolveGenre(listDTO, detail, genreMap);
        Director director = resolveDirector(credits);
        List<Actor> actors = resolveActors(credits);

        // Determine showing status
        LocalDate releaseDate = SeederUtils.parseDate(listDTO.getReleaseDate());
        LocalDate today = LocalDate.now();
        boolean isNowShowing = releaseDate != null
                && !releaseDate.isAfter(today)
                && releaseDate.isAfter(today.minusMonths(3));
        boolean isComingSoon = releaseDate != null && releaseDate.isAfter(today);

        int runtime = (detail != null && detail.getRuntime() != null && detail.getRuntime() > 0)
                ? detail.getRuntime() : SeederUtils.randomRuntime();

        Movie movie = Movie.builder()
                .title(listDTO.getTitle())
                .originalTitle(listDTO.getOriginalTitle())
                .description(listDTO.getOverview())
                .duration(runtime)
                .posterUrl(tmdbApiService.getImageUrl(listDTO.getPosterPath()))
                .trailerUrl(trailerUrl)
                .releaseDate(releaseDate)
                .endDate(releaseDate != null ? releaseDate.plusDays(60) : null)
                .rating(listDTO.getVoteAverage())
                .ageRating(AGE_RATINGS[RNG.nextInt(AGE_RATINGS.length)])
                .isNowShowing(isNowShowing)
                .isComingSoon(isComingSoon)
                .isFeatured(isNowShowing)
                .isDeleted(false)
                .genre(genre)
                .director(director)
                .actors(actors)
                .build();

        movieRepository.save(movie);
        log.info("[Movie] Saved: '{}' ({}min, nowShowing={}).", movie.getTitle(), runtime, isNowShowing);
        return true;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Genre resolution
    // ─────────────────────────────────────────────────────────────────────────

    private Genre resolveGenre(TmdbMovieDTO list, TmdbMovieDTO detail, Map<Integer, Genre> map) {
        if (list.getGenreIds() != null && !list.getGenreIds().isEmpty()) {
            Genre g = map.get(list.getGenreIds().get(0));
            if (g != null) return g;
        }
        if (detail != null && detail.getGenres() != null && !detail.getGenres().isEmpty()) {
            return genreRepository.findByNameIgnoreCase(detail.getGenres().get(0).getName()).orElse(null);
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Director resolution (called within the same transaction as processAndSaveMovie)
    // ─────────────────────────────────────────────────────────────────────────

    private Director resolveDirector(TmdbCreditsDTO credits) {
        if (credits == null || credits.getCrew() == null) return null;
        return credits.getCrew().stream()
                .filter(c -> "Director".equals(c.getJob()))
                .findFirst()
                .map(this::findOrCreateDirector)
                .orElse(null);
    }

    /**
     * Find an existing director by name or create a new one.
     * Called within the transaction of processAndSaveMovie → entity stays MANAGED.
     */
    private Director findOrCreateDirector(TmdbCrewDTO crew) {
        Optional<Director> existing = directorRepository.findByName(crew.getName());
        if (existing.isPresent()) return existing.get();

        TmdbPersonDTO p = tmdbApiService.fetchPersonDetail(crew.getId());
        tmdbApiService.sleepSafe(200);

        Director d = Director.builder()
                .name(crew.getName())
                .biography(p != null ? SeederUtils.truncate(p.getBiography(), 2000) : null)
                .birthDate(p != null ? SeederUtils.parseDate(p.getBirthday()) : null)
                .nationality(p != null ? SeederUtils.extractNationality(p.getPlaceOfBirth()) : null)
                .imageUrl(tmdbApiService.getImageUrl(crew.getProfilePath()))
                .build();
        Director saved = directorRepository.save(d);
        log.debug("[Director] Created: '{}'.", saved.getName());
        return saved;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Actor resolution (called within the same transaction as processAndSaveMovie)
    // ─────────────────────────────────────────────────────────────────────────

    private List<Actor> resolveActors(TmdbCreditsDTO credits) {
        if (credits == null || credits.getCast() == null) return Collections.emptyList();
        List<Actor> result = new ArrayList<>();
        credits.getCast().stream()
                .filter(c -> c.getOrder() != null)
                .sorted(Comparator.comparingInt(TmdbCastDTO::getOrder))
                .limit(5)
                .forEach(c -> {
                    try {
                        Actor a = findOrCreateActor(c);
                        if (a != null) result.add(a);
                        tmdbApiService.sleepSafe(150);
                    } catch (Exception e) {
                        log.warn("[Actor] Error for '{}': {}", c.getName(), e.getMessage());
                    }
                });
        return result;
    }

    /**
     * Find an existing actor by name or create a new one.
     * Called within the transaction of processAndSaveMovie → entity stays MANAGED.
     */
    private Actor findOrCreateActor(TmdbCastDTO cast) {
        Optional<Actor> existing = actorRepository.findByName(cast.getName());
        if (existing.isPresent()) return existing.get();

        TmdbPersonDTO p = tmdbApiService.fetchPersonDetail(cast.getId());
        tmdbApiService.sleepSafe(150);

        Actor a = Actor.builder()
                .name(cast.getName())
                .biography(p != null ? SeederUtils.truncate(p.getBiography(), 2000) : null)
                .birthDate(p != null ? SeederUtils.parseDate(p.getBirthday()) : null)
                .nationality(p != null ? SeederUtils.extractNationality(p.getPlaceOfBirth()) : null)
                .imageUrl(tmdbApiService.getImageUrl(cast.getProfilePath()))
                .build();
        Actor saved = actorRepository.save(a);
        log.debug("[Actor] Created: '{}'.", saved.getName());
        return saved;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Genre map builder (used by DataSeeder before calling processAndSaveMovie)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Build a map of TMDB genre ID → local Genre entity.
     * Used by DataSeeder to pass into processAndSaveMovie.
     */
    @Transactional(readOnly = true)
    public java.util.Map<Integer, Genre> buildTmdbGenreMap() {
        java.util.Map<Integer, Genre> map = new java.util.HashMap<>();
        for (TmdbGenreDTO dto : tmdbApiService.fetchGenres()) {
            genreRepository.findByNameIgnoreCase(dto.getName())
                    .ifPresent(g -> map.put(dto.getId(), g));
        }
        return map;
    }
}

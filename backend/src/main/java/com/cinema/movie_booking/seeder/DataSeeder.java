package com.cinema.movie_booking.seeder;

import com.cinema.movie_booking.dto.tmdb.TmdbGenreDTO;
import com.cinema.movie_booking.dto.tmdb.TmdbMovieDTO;
import com.cinema.movie_booking.entity.Cinema;
import com.cinema.movie_booking.entity.Genre;
import com.cinema.movie_booking.entity.Movie;
import com.cinema.movie_booking.entity.Seat;
import com.cinema.movie_booking.entity.SeatType;
import com.cinema.movie_booking.entity.Showtime;
import com.cinema.movie_booking.entity.Theater;
import com.cinema.movie_booking.enums.TheaterType;
import com.cinema.movie_booking.repository.CinemaRepository;
import com.cinema.movie_booking.repository.GenreRepository;
import com.cinema.movie_booking.repository.MovieRepository;
import com.cinema.movie_booking.repository.SeatRepository;
import com.cinema.movie_booking.repository.SeatTypeRepository;
import com.cinema.movie_booking.repository.ShowtimeRepository;
import com.cinema.movie_booking.repository.TheaterRepository;
import com.cinema.movie_booking.service.TmdbApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * DataSeeder seeds the database automatically on startup.
 *
 * Order:
 * 1. SeatType
 * 2. Genre (TMDB)
 * 3. Director (TMDB credits)
 * 4. Actor (TMDB credits)
 * 5. Movie (TMDB now_playing + popular) ← delegated to MovieSeederService
 * 6. Cinema (Vietnamese cinemas)
 * 7. Theater (auto-generated per cinema)
 * 8. Seat (auto-generated per theater)
 * 9. Showtime (auto-generated per movie x theater)
 *
 * NOTE: Movie/Director/Actor seeding is delegated to MovieSeederService to
 * avoid
 * the Spring @Transactional self-invocation problem (proxy bypass).
 *
 * Idempotent: safe to run multiple times.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    private final SeatTypeRepository seatTypeRepository;
    private final GenreRepository genreRepository;
    private final MovieRepository movieRepository;
    private final CinemaRepository cinemaRepository;
    private final TheaterRepository theaterRepository;
    private final SeatRepository seatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final TmdbApiService tmdbApiService;
    // Handles @Transactional movie/director/actor operations via Spring proxy
    // (avoids self-invocation)
    private final MovieSeederService movieSeederService;

    private static final Random RNG = new Random();

    // =========================================================================
    // Entry Point
    // =========================================================================

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("[Seeder] Seeding DISABLED — skipping.");
            return;
        }
        log.info("[Seeder] ===== Starting Data Seeder =====");
        try {
            seedSeatTypes();
            seedGenres();
            seedMoviesWithActorsAndDirectors();
            seedCinemasTheatersAndSeats();
            seedShowtimes();
        } catch (Exception ex) {
            log.error("[Seeder] Fatal error: {}", ex.getMessage(), ex);
        }
        log.info("[Seeder] ===== Data Seeder Complete =====");
    }

    // =========================================================================
    // 1. SeatType
    // =========================================================================

    @Transactional
    public void seedSeatTypes() {
        if (seatTypeRepository.count() > 0) {
            log.info("[SeatType] Already seeded. Skipping.");
            return;
        }
        seatTypeRepository.saveAll(List.of(
                buildSeatType("NORMAL", "Standard seat", 1.0),
                buildSeatType("VIP", "VIP seat — wider", 1.5),
                buildSeatType("COUPLE", "Couple seat — double", 2.0)));
        log.info("[SeatType] Seeded 3 seat types.");
    }

    private SeatType buildSeatType(String name, String desc, double multiplier) {
        return SeatType.builder().name(name).description(desc).priceMultiplier(multiplier).build();
    }

    // =========================================================================
    // 2. Genre
    // =========================================================================

    @Transactional
    public void seedGenres() {
        log.info("[Genre] Fetching genres from TMDB...");
        List<TmdbGenreDTO> list = tmdbApiService.fetchGenres();
        if (list.isEmpty()) {
            log.warn("[Genre] TMDB returned empty. Using fallback.");
            seedFallbackGenres();
            return;
        }
        int n = 0;
        for (TmdbGenreDTO dto : list) {
            if (!genreRepository.existsByNameIgnoreCaseAndIsDeletedFalse(dto.getName())) {
                genreRepository.save(Genre.builder()
                        .name(dto.getName())
                        .description("Genre: " + dto.getName())
                        .isDeleted(false).build());
                n++;
            }
        }
        log.info("[Genre] Seeded {} new genres (TMDB total: {}).", n, list.size());
    }

    private void seedFallbackGenres() {
        List<String> names = List.of("Action", "Comedy", "Drama", "Horror", "Romance",
                "Science Fiction", "Thriller", "Animation", "Adventure", "Fantasy",
                "Crime", "Documentary", "Family", "History", "Music");
        int n = 0;
        for (String name : names) {
            if (!genreRepository.existsByNameIgnoreCaseAndIsDeletedFalse(name)) {
                genreRepository.save(Genre.builder().name(name)
                        .description("Genre: " + name).isDeleted(false).build());
                n++;
            }
        }
        log.info("[Genre] Seeded {} fallback genres.", n);
    }

    // =========================================================================
    // 3-5. Movie + Director + Actor
    // =========================================================================

    public void seedMoviesWithActorsAndDirectors() {
        if (movieRepository.countByIsDeletedFalse() > 0) {
            log.info("[Movie] Already seeded. Skipping.");
            return;
        }
        log.info("[Movie] Fetching from TMDB...");

        List<TmdbMovieDTO> nowPlaying = tmdbApiService.fetchNowPlayingMovies(5);
        List<TmdbMovieDTO> popular = tmdbApiService.fetchPopularMovies(1);

        Map<Long, TmdbMovieDTO> deduped = new LinkedHashMap<>();
        nowPlaying.forEach(m -> deduped.put(m.getId(), m));
        popular.forEach(m -> deduped.putIfAbsent(m.getId(), m));

        List<TmdbMovieDTO> movies = new ArrayList<>(deduped.values());
        if (movies.size() > 70)
            movies = movies.subList(0, 70);

        // Build genre map via MovieSeederService (goes through Spring proxy →
        // @Transactional works)
        Map<Integer, Genre> genreMap = movieSeederService.buildTmdbGenreMap();

        int saved = 0;
        for (TmdbMovieDTO dto : movies) {
            try {
                // Delegate to MovieSeederService — called via Spring proxy → @Transactional
                // works
                // Director, Actor, Movie all saved in ONE transaction → no detached entity
                // issue
                if (movieSeederService.processAndSaveMovie(dto, genreMap))
                    saved++;
                tmdbApiService.sleepSafe(300);
            } catch (Exception e) {
                log.error("[Movie] Error processing '{}': {}", dto.getTitle(), e.getMessage());
            }
        }
        log.info("[Movie] Seeded {} movies.", saved);
    }

    // =========================================================================
    // 6-8. Cinema + Theater + Seat
    // =========================================================================

    @Transactional
    public void seedCinemasTheatersAndSeats() {
        if (cinemaRepository.count() > 0) {
            log.info("[Cinema] Already seeded. Skipping.");
            return;
        }
        log.info("[Cinema] Seeding cinemas, theaters, and seats...");
        for (CinemaData data : buildCinemaData()) {
            if (cinemaRepository.existsByName(data.name))
                continue;
            Cinema cinema = cinemaRepository.save(Cinema.builder()
                    .name(data.name).address(data.address)
                    .city(data.city).district(data.district)
                    .phone(data.phone).email(data.email)
                    .description("Cinema: " + data.name)
                    .isActive(true).build());
            log.info("[Cinema] Created: '{}' ({}).", cinema.getName(), cinema.getCity());
            seedTheatersForCinema(cinema);
        }
        log.info("[Cinema] Cinema seeding complete.");
    }

    private void seedTheatersForCinema(Cinema cinema) {
        List<TheaterConfig> cfgs = List.of(
                new TheaterConfig("Phong 1 - Standard", TheaterType.STANDARD, 10, 10),
                new TheaterConfig("Phong 2 - VIP", TheaterType.VIP, 8, 8),
                new TheaterConfig("Phong 3 - IMAX", TheaterType.IMAX, 12, 12));
        for (TheaterConfig cfg : cfgs) {
            Theater t = theaterRepository.save(Theater.builder()
                    .name(cfg.name).theaterType(cfg.type)
                    .rowsCount(cfg.rows).seatsPerRow(cfg.seatsPerRow)
                    .totalSeats(cfg.rows * cfg.seatsPerRow)
                    .isActive(true).cinema(cinema).build());
            log.info("[Theater] Created: '{}' ({} seats).", t.getName(), t.getTotalSeats());
            seedSeatsForTheater(t, cfg);
        }
    }

    private void seedSeatsForTheater(Theater theater, TheaterConfig cfg) {
        if (seatRepository.existsByTheater_TheaterId(theater.getTheaterId()))
            return;

        SeatType normal = seatTypeRepository.findByName("NORMAL")
                .orElseThrow(() -> new IllegalStateException("SeatType NORMAL missing"));
        SeatType vip = seatTypeRepository.findByName("VIP")
                .orElseThrow(() -> new IllegalStateException("SeatType VIP missing"));
        SeatType couple = seatTypeRepository.findByName("COUPLE")
                .orElseThrow(() -> new IllegalStateException("SeatType COUPLE missing"));

        List<Seat> seats = new ArrayList<>();
        for (int r = 0; r < cfg.rows; r++) {
            String row = String.valueOf((char) ('A' + r));
            boolean isLastRow = (r == cfg.rows - 1);
            boolean isCouple = (cfg.type == TheaterType.VIP && isLastRow);
            SeatType st = isCouple ? couple : rowSeatType(cfg.type, r, cfg.rows, normal, vip);
            for (int n = 1; n <= cfg.seatsPerRow; n++) {
                seats.add(Seat.builder()
                        .seatRow(row).seatNumber(n).seatCode(row + n)
                        .isAvailable(true).isCoupleSeat(isCouple)
                        .theater(theater).seatType(st).build());
            }
        }
        seatRepository.saveAll(seats);
        log.info("[Seat] Generated {} seats for '{}'.", seats.size(), theater.getName());
    }

    private SeatType rowSeatType(TheaterType type, int rowIdx, int totalRows,
            SeatType normal, SeatType vip) {
        return switch (type) {
            case VIP -> vip;
            case STANDARD, IMAX -> (rowIdx >= totalRows - 2) ? vip : normal;
            default -> normal;
        };
    }

    // =========================================================================
    // 9. Showtime
    // =========================================================================

    @Transactional
    public void seedShowtimes() {
        if (showtimeRepository.count() > 0) {
            log.info("[Showtime] Already seeded. Skipping.");
            return;
        }
        List<Movie> nowShowing = movieRepository.findByIsNowShowingTrueAndIsDeletedFalse();
        List<Movie> comingSoon = movieRepository.findByIsComingSoonTrueAndIsDeletedFalse();
        List<Theater> theaters = theaterRepository.findAll();

        if ((nowShowing.isEmpty() && comingSoon.isEmpty()) || theaters.isEmpty()) {
            log.warn("[Showtime] No movies or theaters found. Skipping.");
            return;
        }
        log.info("[Showtime] Generating showtimes ({} now-showing, {} coming-soon, {} theaters)...",
                nowShowing.size(), comingSoon.size(), theaters.size());

        List<Showtime> showtimes = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Movie movie : nowShowing) {
            List<Theater> assigned = SeederUtils.pickRandom(theaters, 3);
            for (Theater theater : assigned) {
                double price = SeederUtils.basePriceFor(theater.getTheaterType());
                for (int day = 0; day < 7; day++) {
                    LocalDate date = today.plusDays(day);
                    for (LocalTime slot : SeederUtils.pickRandomSlots(3)) {
                        showtimes.add(buildShowtime(movie, theater, date, slot, price));
                    }
                }
            }
        }

        for (Movie movie : comingSoon) {
            if (movie.getReleaseDate() == null)
                continue;
            List<Theater> assigned = SeederUtils.pickRandom(theaters, 2);
            for (Theater theater : assigned) {
                double price = SeederUtils.basePriceFor(theater.getTheaterType());
                for (int day = 0; day < 5; day++) {
                    LocalDate date = movie.getReleaseDate().plusDays(day);
                    for (LocalTime slot : SeederUtils.pickRandomSlots(2)) {
                        showtimes.add(buildShowtime(movie, theater, date, slot, price));
                    }
                }
            }
        }

        showtimeRepository.saveAll(showtimes);
        log.info("[Showtime] Generated {} showtimes.", showtimes.size());
    }

    private Showtime buildShowtime(Movie movie, Theater theater,
            LocalDate date, LocalTime slot, double price) {
        LocalDateTime start = LocalDateTime.of(date, slot);
        int dur = (movie.getDuration() != null && movie.getDuration() > 0)
                ? movie.getDuration() + 15
                : 120;
        return Showtime.builder()
                .movie(movie).theater(theater)
                .startTime(start).endTime(start.plusMinutes(dur))
                .price(price).isActive(true).build();
    }

    // =========================================================================
    // Static Cinema Data
    // =========================================================================

    private List<CinemaData> buildCinemaData() {
        return List.of(
                new CinemaData("CGV Vincom Center Ba Trieu",
                        "191 Ba Trieu, Hai Ba Trung", "Ha Noi", "Hai Ba Trung",
                        "024 3974 3333", "cgv.batrieu@cgv.vn"),
                new CinemaData("CGV Aeon Mall Long Bien",
                        "27 Co Linh, Long Bien", "Ha Noi", "Long Bien",
                        "024 3974 3334", "cgv.longbien@cgv.vn"),
                new CinemaData("CGV Vincom Dong Khoi",
                        "72 Le Thanh Ton, Ben Nghe, Quan 1", "Ho Chi Minh", "Quan 1",
                        "028 3822 3333", "cgv.dongkhoi@cgv.vn"),
                new CinemaData("Lotte Cinema Cantavil",
                        "Cantavil An Phu, Quan 2", "Ho Chi Minh", "Quan 2",
                        "028 3740 5555", "lotte.cantavil@lotte.vn"),
                new CinemaData("BHD Star Cineplex Da Nang",
                        "255 Hung Vuong, Hai Chau", "Da Nang", "Hai Chau",
                        "0236 3888 999", "bhd.danang@bhd.vn"));
    }
}

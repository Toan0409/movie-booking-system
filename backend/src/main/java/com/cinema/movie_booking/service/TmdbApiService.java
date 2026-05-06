package com.cinema.movie_booking.service;

import com.cinema.movie_booking.dto.tmdb.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Service responsible for calling TMDB (The Movie Database) public API.
 *
 * Endpoints used:
 * - GET /genre/movie/list → fetch all movie genres
 * - GET /movie/now_playing → fetch currently showing movies
 * - GET /movie/popular → fetch popular movies
 * - GET /movie/{id} → fetch movie detail (runtime, genres)
 * - GET /movie/{id}/credits → fetch cast & crew
 * - GET /movie/{id}/videos → fetch trailers
 * - GET /person/{id} → fetch person biography & birthdate
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TmdbApiService {

    private final RestTemplate restTemplate;

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Value("${tmdb.api.base-url}")
    private String baseUrl;

    @Value("${tmdb.image.base-url}")
    private String imageBaseUrl;

    // ─────────────────────────────────────────────────────────────────────────
    // Genre
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetch all movie genres from TMDB.
     */
    public List<TmdbGenreDTO> fetchGenres() {
        String url = buildUrl("/genre/movie/list", "language=en-US");
        try {
            TmdbGenreListDTO response = restTemplate.getForObject(url, TmdbGenreListDTO.class);
            if (response != null && response.getGenres() != null) {
                log.debug("[TMDB] Fetched {} genres.", response.getGenres().size());
                return response.getGenres();
            }
        } catch (Exception e) {
            log.error("[TMDB] Failed to fetch genres: {}", e.getMessage());
        }
        return Collections.emptyList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Movie Lists
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetch now-playing movies from TMDB (multiple pages).
     *
     * @param pages number of pages to fetch (20 movies per page)
     */
    public List<TmdbMovieDTO> fetchNowPlayingMovies(int pages) {
        return fetchMovieList("/movie/now_playing", pages);
    }

    /**
     * Fetch popular movies from TMDB (multiple pages).
     *
     * @param pages number of pages to fetch (20 movies per page)
     */
    public List<TmdbMovieDTO> fetchPopularMovies(int pages) {
        return fetchMovieList("/movie/popular", pages);
    }

    private List<TmdbMovieDTO> fetchMovieList(String endpoint, int pages) {
        List<TmdbMovieDTO> movies = new ArrayList<>();
        for (int page = 1; page <= pages; page++) {
            String url = buildUrl(endpoint, "language=en-US&page=" + page);
            try {
                TmdbMovieListDTO response = restTemplate.getForObject(url, TmdbMovieListDTO.class);
                if (response != null && response.getResults() != null) {
                    movies.addAll(response.getResults());
                    log.debug("[TMDB] Fetched page {}/{} from '{}' ({} movies).",
                            page, pages, endpoint, response.getResults().size());
                }
                sleepSafe(250);
            } catch (Exception e) {
                log.error("[TMDB] Failed to fetch '{}' page {}: {}", endpoint, page, e.getMessage());
            }
        }
        return movies;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Movie Detail
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetch full movie detail by TMDB movie ID.
     * Returns runtime, genres (full objects), tagline, status.
     */
    public TmdbMovieDTO fetchMovieDetail(Long movieId) {
        String url = buildUrl("/movie/" + movieId, "language=en-US");
        try {
            TmdbMovieDTO detail = restTemplate.getForObject(url, TmdbMovieDTO.class);
            log.debug("[TMDB] Fetched detail for movie id={}.", movieId);
            return detail;
        } catch (Exception e) {
            log.error("[TMDB] Failed to fetch movie detail id={}: {}", movieId, e.getMessage());
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Credits
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetch cast and crew for a movie.
     */
    public TmdbCreditsDTO fetchMovieCredits(Long movieId) {
        String url = buildUrl("/movie/" + movieId + "/credits", "language=en-US");
        try {
            TmdbCreditsDTO credits = restTemplate.getForObject(url, TmdbCreditsDTO.class);
            log.debug("[TMDB] Fetched credits for movie id={}.", movieId);
            return credits;
        } catch (Exception e) {
            log.error("[TMDB] Failed to fetch credits for movie id={}: {}", movieId, e.getMessage());
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Videos / Trailers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetch the YouTube trailer URL for a movie.
     * Returns null if no trailer is found.
     */
    public String fetchTrailerUrl(Long movieId) {
        String url = buildUrl("/movie/" + movieId + "/videos", "language=en-US");
        try {
            TmdbVideoListDTO response = restTemplate.getForObject(url, TmdbVideoListDTO.class);
            if (response != null && response.getResults() != null) {
                // Prefer official trailers, then any trailer
                return response.getResults().stream()
                        .filter(v -> "YouTube".equals(v.getSite()) && "Trailer".equals(v.getType()))
                        .sorted((a, b) -> {
                            // Official trailers first
                            boolean aOfficial = Boolean.TRUE.equals(a.getOfficial());
                            boolean bOfficial = Boolean.TRUE.equals(b.getOfficial());
                            return Boolean.compare(bOfficial, aOfficial);
                        })
                        .findFirst()
                        .map(v -> "https://www.youtube.com/watch?v=" + v.getKey())
                        .orElse(null);
            }
        } catch (Exception e) {
            log.error("[TMDB] Failed to fetch videos for movie id={}: {}", movieId, e.getMessage());
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Person Detail
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetch person (actor/director) detail by TMDB person ID.
     */
    public TmdbPersonDTO fetchPersonDetail(Long personId) {
        String url = buildUrl("/person/" + personId, "language=en-US");
        try {
            TmdbPersonDTO person = restTemplate.getForObject(url, TmdbPersonDTO.class);
            log.debug("[TMDB] Fetched person detail id={}.", personId);
            return person;
        } catch (Exception e) {
            log.error("[TMDB] Failed to fetch person id={}: {}", personId, e.getMessage());
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Build a full TMDB API URL with api_key injected.
     */
    public String buildUrl(String path, String extraParams) {
        StringBuilder sb = new StringBuilder(baseUrl).append(path).append("?api_key=").append(apiKey);
        if (extraParams != null && !extraParams.isEmpty()) {
            sb.append("&").append(extraParams);
        }
        return sb.toString();
    }

/**
     * Convert a TMDB poster/profile path to a full image URL.
     * Returns null if path is null or empty.
     */
    public String getImageUrl(String path) {
        if (path == null || path.isBlank()) return null;
        return imageBaseUrl + path;
    }

    /**
     * Sleep without throwing checked exception (for rate-limiting between API calls).
     */
    public void sleepSafe(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

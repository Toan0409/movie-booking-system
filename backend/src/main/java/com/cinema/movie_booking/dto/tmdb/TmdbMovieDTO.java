package com.cinema.movie_booking.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO mapping a movie object from TMDB API.
 * Used for both list responses (genre_ids) and detail responses (genres, runtime).
 *
 * List endpoint:  GET /3/movie/now_playing, /3/movie/popular
 * Detail endpoint: GET /3/movie/{id}
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbMovieDTO {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("title")
    private String title;

    @JsonProperty("original_title")
    private String originalTitle;

    @JsonProperty("overview")
    private String overview;

    @JsonProperty("poster_path")
    private String posterPath;

    @JsonProperty("release_date")
    private String releaseDate;

    @JsonProperty("vote_average")
    private Double voteAverage;

    /** Present in list responses — array of genre IDs */
    @JsonProperty("genre_ids")
    private List<Integer> genreIds;

    /** Present in detail response — full genre objects */
    @JsonProperty("genres")
    private List<TmdbGenreDTO> genres;

    /** Present only in detail response */
    @JsonProperty("runtime")
    private Integer runtime;

    /** Present only in detail response */
    @JsonProperty("tagline")
    private String tagline;

    /** Present only in detail response */
    @JsonProperty("status")
    private String status;
}

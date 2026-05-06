package com.cinema.movie_booking.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO mapping the video list response from TMDB API.
 * Endpoint: GET /3/movie/{id}/videos
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbVideoListDTO {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("results")
    private List<TmdbVideoDTO> results;
}

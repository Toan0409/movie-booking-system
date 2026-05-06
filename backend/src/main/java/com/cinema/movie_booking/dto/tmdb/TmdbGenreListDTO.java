package com.cinema.movie_booking.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO mapping the TMDB genre list response.
 * Endpoint: GET /3/genre/movie/list
 * Example: {"genres": [{"id": 28, "name": "Action"}, ...]}
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbGenreListDTO {

    @JsonProperty("genres")
    private List<TmdbGenreDTO> genres;
}

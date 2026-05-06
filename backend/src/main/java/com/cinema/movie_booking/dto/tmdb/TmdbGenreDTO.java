package com.cinema.movie_booking.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO mapping a single genre object from TMDB API.
 * Example: {"id": 28, "name": "Action"}
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbGenreDTO {

    @JsonProperty("id")
    private Integer id;

    @JsonProperty("name")
    private String name;
}

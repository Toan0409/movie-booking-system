package com.cinema.movie_booking.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO mapping a single cast member from TMDB credits response.
 * Part of: GET /3/movie/{id}/credits → cast[]
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbCastDTO {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("character")
    private String character;

    @JsonProperty("profile_path")
    private String profilePath;

    /** Cast order — lower = more prominent role */
    @JsonProperty("order")
    private Integer order;

    @JsonProperty("known_for_department")
    private String knownForDepartment;
}

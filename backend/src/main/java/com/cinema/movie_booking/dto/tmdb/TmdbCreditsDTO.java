package com.cinema.movie_booking.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO mapping the full credits response from TMDB API.
 * Endpoint: GET /3/movie/{id}/credits
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbCreditsDTO {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("cast")
    private List<TmdbCastDTO> cast;

    @JsonProperty("crew")
    private List<TmdbCrewDTO> crew;
}

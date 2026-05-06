package com.cinema.movie_booking.dto.showtime;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for showtime
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ShowtimeResponseDTO {

    private Long showtimeId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime showDate;
    private Double price;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private MovieInfo movie;
    private TheaterInfo theater;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MovieInfo {
        private Long movieId;
        private String title;
        private String posterUrl;
        private Integer duration;
        private String ageRating;
    }

    /**
     * Nested DTO for theater info
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TheaterInfo {
        private Long theaterId;
        private String name;
        private String theaterType;
        private Integer totalSeats;
    }
}

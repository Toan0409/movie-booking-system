package com.cinema.movie_booking.dto.showtime;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Request DTO for creating/updating showtime
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowtimeRequestDTO {

    @NotNull(message = "Movie ID không được để trống")
    private Long movieId;

    @NotNull(message = "Theater ID không được để trống")
    private Long theaterId;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalDateTime startTime;

    @NotNull(message = "Giá vé không được để trống")
    private Double price;

    private LocalDateTime endTime;
}

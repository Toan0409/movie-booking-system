package com.cinema.movie_booking.dto.theater;

import com.cinema.movie_booking.enums.TheaterType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TheaterResponseDTO {
    private Long theaterId;
    private String name;
    private Integer totalSeats;

    private Integer rowsCount;

    private Integer seatsPerRow;

    private TheaterType theaterType;

    private Boolean isActive;

    private Long cinemaId;
    private String cinemaName;
}

package com.cinema.movie_booking.dto.theater;

import com.cinema.movie_booking.enums.TheaterType;

import lombok.Data;

@Data
public class TheaterRequestDTO {
    private String name;
    private Integer rowsCount;
    private Integer seatsPerRow;
    private TheaterType theaterType;
    private Long cinemaId;

}
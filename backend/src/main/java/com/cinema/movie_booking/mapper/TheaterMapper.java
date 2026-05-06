package com.cinema.movie_booking.mapper;

import com.cinema.movie_booking.dto.theater.TheaterRequestDTO;
import com.cinema.movie_booking.dto.theater.TheaterResponseDTO;
import com.cinema.movie_booking.entity.Cinema;
import com.cinema.movie_booking.entity.Theater;

public class TheaterMapper {
    public static TheaterResponseDTO toDTO(Theater theater) {
        return TheaterResponseDTO.builder()
                .theaterId(theater.getTheaterId())
                .name(theater.getName())
                .rowsCount(theater.getRowsCount())
                .totalSeats(theater.getTotalSeats())
                .seatsPerRow(theater.getSeatsPerRow())
                .theaterType(theater.getTheaterType())
                .isActive(theater.getIsActive())
                .cinemaId(theater.getCinema().getCinemaId())
                .cinemaName(theater.getCinema().getName())
                .build();
    }

    public static Theater toEntity(TheaterRequestDTO theaterRequestDTO, Cinema cinema) {
        return Theater.builder()
                .name(theaterRequestDTO.getName())
                .rowsCount(theaterRequestDTO.getRowsCount())
                .seatsPerRow(theaterRequestDTO.getSeatsPerRow())
                .totalSeats(theaterRequestDTO.getRowsCount() * theaterRequestDTO.getSeatsPerRow())
                .theaterType(theaterRequestDTO.getTheaterType())
                .cinema(Cinema.builder().cinemaId(theaterRequestDTO.getCinemaId()).build())
                .isActive(true)
                .build();
    }

}

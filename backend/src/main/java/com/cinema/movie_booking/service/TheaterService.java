package com.cinema.movie_booking.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.cinema.movie_booking.dto.theater.TheaterRequestDTO;
import com.cinema.movie_booking.dto.theater.TheaterResponseDTO;

public interface TheaterService {
    Page<TheaterResponseDTO> getAll( Pageable pageable);

    TheaterResponseDTO getById(Long id);

    TheaterResponseDTO create(TheaterRequestDTO request);

    TheaterResponseDTO update(Long id, TheaterRequestDTO request);

    void delete(Long id);

    TheaterResponseDTO restore(Long id);

    Page<TheaterResponseDTO> getByIsActiveTrue(Pageable pageable);
}

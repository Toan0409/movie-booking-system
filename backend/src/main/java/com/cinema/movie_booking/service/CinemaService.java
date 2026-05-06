package com.cinema.movie_booking.service;

import java.util.List;

import com.cinema.movie_booking.dto.cinema.CinemaRequestDTO;
import com.cinema.movie_booking.dto.cinema.CinemaResponseDTO;

public interface CinemaService {
    CinemaResponseDTO createCinema(CinemaRequestDTO requestDTO);

    CinemaResponseDTO getCinemaById(Long cinemaId);

    List<CinemaResponseDTO> getAllCinemas();

    CinemaResponseDTO updateCinema(Long cinemaId, CinemaRequestDTO requestDTO);

    void deleteCinema(Long cinemaId);

    List<CinemaResponseDTO> searchCinemasByName(String keyword);

    List<CinemaResponseDTO> getCinemasByCity(String city);

    List<CinemaResponseDTO> getActiveCinemas();

    CinemaResponseDTO restoreCinema(Long cinemaId);
}

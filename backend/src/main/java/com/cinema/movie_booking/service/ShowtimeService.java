package com.cinema.movie_booking.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.cinema.movie_booking.dto.showtime.ShowtimeRequestDTO;
import com.cinema.movie_booking.dto.showtime.ShowtimeResponseDTO;

import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for Showtime management
 */
public interface ShowtimeService {

    /**
     * Create a new showtime
     */
    ShowtimeResponseDTO create(ShowtimeRequestDTO request);

    /**
     * Update an existing showtime
     */
    ShowtimeResponseDTO update(Long id, ShowtimeRequestDTO request);

    /**
     * Get showtime by ID
     */
    ShowtimeResponseDTO getById(Long id);

    /**
     * Get all showtimes with pagination
     */
    Page<ShowtimeResponseDTO> getAll(Pageable pageable);

    /**
     * Get all active showtimes with pagination
     */
    Page<ShowtimeResponseDTO> getActiveShowtimes(Pageable pageable);

    /**
     * Get showtimes by movie ID
     */
    List<ShowtimeResponseDTO> getByMovieId(Long movieId);

    /**
     * Get showtimes by theater ID
     */
    List<ShowtimeResponseDTO> getByTheaterId(Long theaterId);

    /**
     * Get showtimes by date
     */
    List<ShowtimeResponseDTO> getByDate(LocalDate date);

    /**
     * Get showtimes by movie and date
     */
    List<ShowtimeResponseDTO> getByMovieAndDate(Long movieId, LocalDate date);

    /**
     * Deactivate a showtime (soft delete)
     */
    void deactivate(Long id);

    /**
     * Activate a showtime
     */
    ShowtimeResponseDTO activate(Long id);
}

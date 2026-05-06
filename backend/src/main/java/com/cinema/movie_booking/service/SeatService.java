package com.cinema.movie_booking.service;

import com.cinema.movie_booking.dto.seat.SeatAvailabilityDTO;
import com.cinema.movie_booking.dto.seat.SeatResponseDTO;
import com.cinema.movie_booking.entity.SeatType;

import java.util.List;

/**
 * Service interface for seat management operations
 */
public interface SeatService {

    /**
     * Get all seats for a specific theater
     * 
     * @param theaterId the theater ID
     * @return list of seat response DTOs
     */
    List<SeatResponseDTO> getSeatsByTheater(Long theaterId);

    /**
     * Get seat availability for a specific showtime
     * Returns all seats in the theater with their availability status
     * 
     * @param showtimeId the showtime ID
     * @return list of seat availability DTOs
     */
    List<SeatAvailabilityDTO> getSeatAvailability(Long showtimeId);

    /**
     * Update seat type for a specific seat
     * 
     * @param seatId   the seat ID
     * @param seatType the new seat type
     * @return updated seat response DTO
     */
    SeatResponseDTO updateSeatType(Long seatId, SeatType seatType);

    /**
     * Disable a seat (make it unavailable)
     * 
     * @param seatId the seat ID
     */
    void disableSeat(Long seatId);

    /**
     * Enable a seat (make it available)
     * 
     * @param seatId the seat ID
     */
    void enableSeat(Long seatId);

    /**
     * Regenerate all seats for a theater
     * Deletes old seats and creates new ones based on theater configuration
     * 
     * @param theaterId the theater ID
     */
    void regenerateSeats(Long theaterId);

    /**
     * Check if a seat is available for booking in a specific showtime
     * 
     * @param showtimeId the showtime ID
     * @param seatId     the seat ID
     * @return true if seat is available, false otherwise
     */
    boolean isSeatAvailable(Long showtimeId, Long seatId);

    /**
     * Get a single seat by ID
     * 
     * @param seatId the seat ID
     * @return seat response DTO
     */
    SeatResponseDTO getSeatById(Long seatId);
}

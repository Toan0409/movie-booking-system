package com.cinema.movie_booking.dto.seat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for seat availability response
 * Shows seat availability status for a specific showtime
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatAvailabilityDTO {

    /**
     * Unique identifier of the seat
     */
    private Long seatId;

    /**
     * Unique seat label (e.g., "A1", "B5")
     */
    private String seatLabel;

    /**
     * Row label (A, B, C, etc.)
     */
    private String seatRow;

    /**
     * Seat number within the row
     */
    private Integer seatNumber;

    /**
     * Seat type (STANDARD, VIP, COUPLE)
     */
    private String seatType;

    /**
     * Price multiplier for this seat type
     */
    private Double priceMultiplier;

    /**
     * Seat availability status:
     * - AVAILABLE: Seat is not booked for this showtime
     * - RESERVED: Seat is reserved (PENDING booking)
     * - OCCUPIED: Seat is booked (PAID booking)
     */
    private String status;

    /**
     * Whether the seat is a couple seat
     */
    private Boolean isCoupleSeat;
}

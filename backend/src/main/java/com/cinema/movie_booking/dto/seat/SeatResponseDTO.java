package com.cinema.movie_booking.dto.seat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for seat response
 * Returns seat information including ID, theater, label, type, and status
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatResponseDTO {

    /**
     * Unique identifier of the seat
     */
    private Long seatId;

    /**
     * ID of the theater this seat belongs to
     */
    private Long theaterId;

    /**
     * Name of the theater
     */
    private String theaterName;

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
     * Whether the seat is currently available
     */
    private Boolean isAvailable;

    /**
     * Whether the seat is a couple seat
     */
    private Boolean isCoupleSeat;

    /**
     * Whether the seat is active (for admin management)
     */
    private Boolean isActive;
}

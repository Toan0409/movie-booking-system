package com.cinema.movie_booking.dto.seat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for seat creation/update requests
 * Used by admin to create or update seat information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatRequestDTO {

    /**
     * ID of the theater this seat belongs to
     */
    @NotNull(message = "Theater ID is required")
    private Long theaterId;

    /**
     * Row label (A, B, C, etc.)
     */
    @NotBlank(message = "Row label is required")
    private String rowLabel;

    /**
     * Seat number within the row
     */
    @NotNull(message = "Số ghế là bắt buộc")
    @Positive(message = "Vị trí ghế phải là số dương")
    private Integer seatNumber;

    /**
     * Seat type ID (STANDARD, VIP, COUPLE)
     */
    @NotNull(message = "Seat type is required")
    private Long seatTypeId;

    /**
     * Whether the seat is active/available
     */
    @Builder.Default
    private Boolean isActive = true;
}

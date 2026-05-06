package com.cinema.movie_booking.controller.client;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.seat.SeatAvailabilityDTO;
import com.cinema.movie_booking.service.SeatService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Client controller for seat availability operations
 * Base path: /api/seats
 */
@RestController
@RequestMapping("/api/seats")
@AllArgsConstructor
public class SeatController {

    private final SeatService seatService;

    /**
     * Get seat availability for a specific showtime
     * This endpoint is used by clients to see which seats are available for booking
     * GET /api/seats/showtimes/{showtimeId}/availability
     * 
     * @param showtimeId the showtime ID
     * @return list of seats with their availability status
     */
    @GetMapping("/showtimes/{showtimeId}/availability")
    public ResponseEntity<ApiResponse<List<SeatAvailabilityDTO>>> getSeatAvailability(@PathVariable Long showtimeId) {
        List<SeatAvailabilityDTO> availability = seatService.getSeatAvailability(showtimeId);
        return ResponseEntity.ok(ApiResponse.success(availability, "Lấy thông tin ghế thành công"));
    }
}

package com.cinema.movie_booking.controller.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.booking.BookingResponseDTO;
import com.cinema.movie_booking.dto.booking.UpdateBookingStatusRequestDTO;
import com.cinema.movie_booking.mapper.BookingMapper;
import com.cinema.movie_booking.repository.BookingRepository;
import com.cinema.movie_booking.service.BookingStatusService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Validated
public class BookingAdminController {

        private final BookingRepository bookingRepository;
        private final BookingStatusService bookingStatusService;

        /**
         * GET /api/admin/bookings
         * Lay danh sach tat ca booking
         */
        @GetMapping
        public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getAllBookings() {

                List<BookingResponseDTO> bookings = bookingRepository.findAll()
                                .stream()
                                .map(BookingMapper::toBookingResponseDTO)
                                .toList();

                return ResponseEntity.ok(
                                ApiResponse.success(bookings, "Lay danh sach dat ve thanh cong"));
        }

        /**
         * PATCH /api/admin/bookings/{id}/status
         * Cap nhat trang thai cua mot booking.
         *
         * Request body: { "status": "PAID", "paymentMethod": "MOMO", "note": "..." }
         *
         * Cac chuyen trang thai hop le:
         * PENDING -> PAID | CANCELLED | FAILED
         * FAILED -> CANCELLED
         */
        @PatchMapping("/{id}/status")
        public ResponseEntity<ApiResponse<BookingResponseDTO>> updateBookingStatus(
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateBookingStatusRequestDTO request,
                        @AuthenticationPrincipal UserDetails userDetails) {

                String changedBy = (userDetails != null) ? userDetails.getUsername() : "ADMIN";

                BookingResponseDTO response = bookingStatusService.updateBookingStatus(id, request, changedBy);

                return ResponseEntity.ok(ApiResponse.success(response, "Cap nhat trang thai booking thanh cong"));
        }

}

package com.cinema.movie_booking.dto.booking;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

import com.cinema.movie_booking.dto.bookingdetail.BookingDetailResponseDTO;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDTO {

    private Long bookingId;

    private String bookingCode;

    private String status;

    private Integer quantity;

    private Double totalAmount;

    private Double discountAmount;

    private Double finalAmount;

    private LocalDateTime bookingDate;

    private LocalDateTime expiryDate;

    private String notes;

    // ===== Thông tin liên quan =====

    private Long userId;
    private String userName;

    private Long showtimeId;

    private Long movieId;
    private String movieTitle;

    private LocalDateTime startTime;

    // ===== Danh sách ghế =====
    private List<BookingDetailResponseDTO> bookingDetails;

    private Long theaterId;
    private String theaterName;
}
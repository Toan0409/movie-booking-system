package com.cinema.movie_booking.service;

import com.cinema.movie_booking.dto.booking.BookingResponseDTO;
import com.cinema.movie_booking.dto.booking.UpdateBookingStatusRequestDTO;

import java.util.List;

/**
 * Service xu ly logic cap nhat trang thai Booking.
 * Tach biet khoi BookingService de tuan thu Single Responsibility Principle.
 */
public interface BookingStatusService {

    /**
     * Cap nhat trang thai cua mot Booking.
     *
     * @param bookingId ID cua booking can cap nhat
     * @param request   DTO chua trang thai moi, phuong thuc thanh toan, ghi chu
     * @param changedBy Username cua nguoi thuc hien thay doi (admin)
     * @return BookingResponseDTO sau khi cap nhat
     */
    BookingResponseDTO updateBookingStatus(Long bookingId,
            UpdateBookingStatusRequestDTO request,
            String changedBy);

    

    /**
     * Tu dong huy cac Booking het han (status = PENDING va expiryDate da qua).
     * Duoc goi boi Scheduled task.
     */
    void autoExpireBookings();
}

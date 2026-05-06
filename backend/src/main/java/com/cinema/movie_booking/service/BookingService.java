package com.cinema.movie_booking.service;

import java.util.List;

import com.cinema.movie_booking.dto.booking.BookingRequestDTO;
import com.cinema.movie_booking.dto.booking.BookingResponseDTO;

public interface BookingService {
    BookingResponseDTO createBooking(Long userId, BookingRequestDTO request);

    BookingResponseDTO getBookingByCode(String bookingCode);

    List<BookingResponseDTO> getUserBookings(Long userId);

    void cancelBooking(String bookingCode);

}

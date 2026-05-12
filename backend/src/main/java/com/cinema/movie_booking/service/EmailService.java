package com.cinema.movie_booking.service;

import com.cinema.movie_booking.dto.email.BookingEmailData;

public interface EmailService {
    void sendBookingConfirmationEmail(BookingEmailData data);
}

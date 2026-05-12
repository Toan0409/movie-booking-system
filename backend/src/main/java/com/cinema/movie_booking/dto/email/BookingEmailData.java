package com.cinema.movie_booking.dto.email;

import java.util.List;

public record BookingEmailData(
        String toEmail,
        String userName,
        String bookingCode,
        String movieTitle,
        String cinemaName,
        String theaterName,
        String startTime,
        String endTime,
        double totalAmount,
        double discountAmount,
        double finalAmount,
        List<TicketRow> tickets
) {
    public record TicketRow(String seatCode, String ticketCode, double price) {}
}

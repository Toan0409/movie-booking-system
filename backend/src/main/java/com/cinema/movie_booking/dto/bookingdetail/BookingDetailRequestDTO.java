package com.cinema.movie_booking.dto.bookingdetail;

import lombok.Data;

@Data
public class BookingDetailRequestDTO {
    private Long seatId;
    private Double price;
}

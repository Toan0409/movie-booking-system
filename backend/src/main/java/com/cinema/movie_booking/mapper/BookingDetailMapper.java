package com.cinema.movie_booking.mapper;

import com.cinema.movie_booking.dto.bookingdetail.BookingDetailResponseDTO;
import com.cinema.movie_booking.entity.BookingDetail;

public class BookingDetailMapper {
    public static BookingDetailResponseDTO toBookingDetailDTO(BookingDetail detail) {
        return BookingDetailResponseDTO.builder()
                .bookingDetailId(detail.getBookingDetailId())
                .seatId(detail.getSeat().getSeatId())
                .seatLabel(detail.getSeat().getSeatCode())
                .unitPrice(detail.getUnitPrice())
                .quantity(detail.getQuantity())
                .subtotal(detail.getSubtotal())
                .build();
    }
}

package com.cinema.movie_booking.mapper;

import com.cinema.movie_booking.dto.booking.BookingResponseDTO;
import com.cinema.movie_booking.entity.Booking;

public class BookingMapper {

        public static BookingResponseDTO toBookingResponseDTO(Booking booking) {

                return BookingResponseDTO.builder()
                                .bookingId(booking.getBookingId())
                                .bookingCode(booking.getBookingCode())
                                .status(booking.getStatus())
                                .quantity(booking.getQuantity())
                                .totalAmount(booking.getTotalAmount())
                                .discountAmount(booking.getDiscountAmount())
                                .finalAmount(booking.getFinalAmount())
                                .bookingDate(booking.getBookingDate())
                                .expiryDate(booking.getExpiryDate())
                                .notes(booking.getNotes())

                                // user
                                .userId(booking.getUser().getUserId())
                                .userName(booking.getUser().getFullName())

                                .theaterId(booking.getShowtime().getTheater().getTheaterId())
                                .theaterName(booking.getShowtime().getTheater().getName())

                                // showtime + movie
                                .showtimeId(booking.getShowtime().getShowtimeId())
                                .movieId(booking.getShowtime().getMovie().getMovieId())
                                .movieTitle(booking.getShowtime().getMovie().getTitle())
                                .startTime(booking.getShowtime().getStartTime())

                                // booking details
                                .bookingDetails(
                                                booking.getBookingDetails() == null ? null
                                                                : booking.getBookingDetails().stream()
                                                                                .map(BookingDetailMapper::toBookingDetailDTO)
                                                                                .toList())

                                .build();
        }

}

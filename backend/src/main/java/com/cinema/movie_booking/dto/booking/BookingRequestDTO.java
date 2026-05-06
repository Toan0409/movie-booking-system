package com.cinema.movie_booking.dto.booking;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingRequestDTO {
    private Long showtimeId;
    private List<Long> seatIds;
    private Long promoCodeId;
    private String notes;
}

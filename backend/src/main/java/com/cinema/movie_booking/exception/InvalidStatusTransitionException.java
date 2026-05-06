package com.cinema.movie_booking.exception;

import com.cinema.movie_booking.enums.BookingStatus;

/**
 * Exception nem ra khi chuyen trang thai Booking khong hop le.
 * Vi du: PAID -> PENDING, CANCELLED -> PAID, v.v.
 */
public class InvalidStatusTransitionException extends RuntimeException {

    private final BookingStatus fromStatus;
    private final BookingStatus toStatus;

    public InvalidStatusTransitionException(BookingStatus fromStatus, BookingStatus toStatus) {
        super(String.format(
                "Khong the chuyen trang thai tu [%s] sang [%s]. Cac trang thai hop le tu [%s]: %s",
                fromStatus,
                toStatus,
                fromStatus,
                fromStatus.getAllowedNextStatuses().isEmpty()
                        ? "khong co (trang thai cuoi)"
                        : fromStatus.getAllowedNextStatuses().toString()));
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
    }

    public BookingStatus getFromStatus() {
        return fromStatus;
    }

    public BookingStatus getToStatus() {
        return toStatus;
    }
}

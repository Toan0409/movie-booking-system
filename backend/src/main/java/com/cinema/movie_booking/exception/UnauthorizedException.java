package com.cinema.movie_booking.exception;

/**
 * Exception ném ra khi xác thực thất bại (sai username/password hoặc token
 * không hợp lệ)
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}

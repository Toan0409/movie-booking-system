package com.cinema.movie_booking.service;

import com.cinema.movie_booking.dto.auth.AuthResponseDTO;
import com.cinema.movie_booking.dto.auth.LoginRequestDTO;
import com.cinema.movie_booking.dto.auth.RegisterRequestDTO;
import com.cinema.movie_booking.dto.user.UserResponseDTO;

/**
 * Service interface cho chức năng xác thực (Đăng ký / Đăng nhập)
 */
public interface AuthService {

    /**
     * Đăng ký tài khoản mới
     *
     * @param request thông tin đăng ký (username, email, password)
     * @return thông tin user vừa tạo
     */
    UserResponseDTO register(RegisterRequestDTO request);

    /**
     * Đăng nhập và sinh JWT token
     *
     * @param request thông tin đăng nhập (usernameOrEmail, password)
     * @return accessToken + thông tin user
     */
    AuthResponseDTO login(LoginRequestDTO request);
}

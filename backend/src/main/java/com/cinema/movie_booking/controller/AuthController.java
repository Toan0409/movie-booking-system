package com.cinema.movie_booking.controller;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.auth.AuthResponseDTO;
import com.cinema.movie_booking.dto.auth.LoginRequestDTO;
import com.cinema.movie_booking.dto.auth.RegisterRequestDTO;
import com.cinema.movie_booking.dto.user.UserResponseDTO;
import com.cinema.movie_booking.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller xử lý các API xác thực: Đăng ký và Đăng nhập
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "API đăng ký và đăng nhập")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * API Đăng ký tài khoản mới
     * POST /api/auth/register
     *
     * @param request thông tin đăng ký (username, email, password)
     * @return thông tin user vừa tạo
     */
    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản", description = "Tạo tài khoản mới với role CUSTOMER")
    public ResponseEntity<ApiResponse<UserResponseDTO>> register(
            @Valid @RequestBody RegisterRequestDTO request) {

        UserResponseDTO userResponse = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(userResponse, "Đăng ký tài khoản thành công"));
    }

    /**
     * API Đăng nhập
     * POST /api/auth/login
     *
     * @param request thông tin đăng nhập (usernameOrEmail, password)
     * @return accessToken + thông tin user
     */
    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Xác thực và nhận JWT token")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO request) {

        AuthResponseDTO authResponse = authService.login(request);

        return ResponseEntity
                .ok(ApiResponse.success(authResponse, "Đăng nhập thành công"));
    }
}

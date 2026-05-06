package com.cinema.movie_booking.service.impl;

import com.cinema.movie_booking.dto.auth.AuthResponseDTO;
import com.cinema.movie_booking.dto.auth.LoginRequestDTO;
import com.cinema.movie_booking.dto.auth.RegisterRequestDTO;
import com.cinema.movie_booking.dto.user.UserResponseDTO;
import com.cinema.movie_booking.entity.User;
import com.cinema.movie_booking.enums.Role;
import com.cinema.movie_booking.exception.BadRequestException;
import com.cinema.movie_booking.exception.UnauthorizedException;
import com.cinema.movie_booking.repository.UserRepository;
import com.cinema.movie_booking.security.CustomUserDetailsService;
import com.cinema.movie_booking.security.JwtUtil;
import com.cinema.movie_booking.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Triển khai AuthService: xử lý logic đăng ký và đăng nhập
 */
@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Autowired
    public AuthServiceImpl(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            CustomUserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Đăng ký tài khoản mới
     * - Validate username/email không trùng
     * - Mã hóa password bằng BCrypt
     * - Gán role mặc định: CUSTOMER
     */
    @Override
    public UserResponseDTO register(RegisterRequestDTO request) {
        logger.info("Đăng ký tài khoản mới với username: {}", request.getUsername());

        // Kiểm tra username đã tồn tại chưa
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Tên đăng nhập đã tồn tại: " + request.getUsername());
        }

        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng: " + request.getEmail());
        }

        // Tạo user mới
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER); // Mặc định là CUSTOMER
        user.setIsActive(true);

        User savedUser = userRepository.save(user);
        logger.info("Đăng ký thành công cho user: {}", savedUser.getUsername());

        return mapToUserResponseDTO(savedUser);
    }

    /**
     * Đăng nhập
     * - Tìm user theo username hoặc email
     * - Kiểm tra password bằng BCrypt
     * - Sinh JWT token nếu hợp lệ
     */
    @Override
    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO request) {
        logger.info("Đăng nhập với username/email: {}", request.getUsernameOrEmail());

        // Tìm user theo username hoặc email
        User user = userRepository.findByUsername(request.getUsernameOrEmail())
                .orElseGet(() -> userRepository.findByEmail(request.getUsernameOrEmail())
                        .orElseThrow(() -> new UnauthorizedException(
                                "Tên đăng nhập hoặc email không tồn tại")));

        // Kiểm tra tài khoản có bị vô hiệu hóa không
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Tài khoản đã bị vô hiệu hóa");
        }

        // Kiểm tra password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Mật khẩu không chính xác");
        }

        // Load UserDetails để sinh JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());

        // Sinh JWT token
        String accessToken = jwtUtil.generateToken(userDetails);
        logger.info("Đăng nhập thành công cho user: {}", user.getUsername());

        return new AuthResponseDTO(
                accessToken,
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole());
    }

    /**
     * Map User entity sang UserResponseDTO
     */
    private UserResponseDTO mapToUserResponseDTO(User user) {
        return new UserResponseDTO(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getIsActive(),
                user.getRole(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }
}

package com.cinema.movie_booking.config;

import com.cinema.movie_booking.security.CustomUserDetailsService;
import com.cinema.movie_booking.security.JwtAuthenticationFilter;

import lombok.AllArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Cấu hình Spring Security với JWT
 * - Stateless session (không dùng session/cookie)
 * - JWT filter chạy trước UsernamePasswordAuthenticationFilter
 * - Chỉ cho phép /api/auth/** không cần xác thực
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@AllArgsConstructor
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * BCrypt password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * AuthenticationProvider sử dụng CustomUserDetailsService + BCrypt
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * AuthenticationManager — dùng để xác thực trong AuthService
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Cấu hình Security Filter Chain
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Tắt CSRF (dùng JWT nên không cần)
                .csrf(AbstractHttpConfigurer::disable)

                // Tích hợp CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // Stateless session — không lưu session phía server
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Cấu hình phân quyền
                .authorizeHttpRequests(auth -> auth
                        // Cho phép tất cả request đến /api/auth/** (register, login)
                        .requestMatchers("/", "/api/client/showtimes/**", "/api/seats/**", "/api/movies/**",
                                "/api/cinemas/**",
                                "/api/genres",
                                "/api/auth/**")
                        .permitAll()

                        // VNPAY callback endpoints — KHONG can JWT
                        // IPN: VNPAY server goi truc tiep (khong co token)
                        // Return: VNPAY redirect user ve (khong co token)
                        .requestMatchers("/api/payment/vnpay/ipn", "/api/payment/vnpay/return")
                        .permitAll()

                        // Cho phép Swagger UI
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**")
                        .permitAll()

                        // Chỉ ADMIN mới được truy cập /api/admin/**
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Các API khác yêu cầu xác thực
                        .anyRequest().authenticated())

                // Đăng ký AuthenticationProvider
                .authenticationProvider(authenticationProvider())

                // Thêm JWT filter trước UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

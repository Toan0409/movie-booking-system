package com.cinema.movie_booking.dto.auth;

import com.cinema.movie_booking.enums.Role;

/**
 * DTO cho response sau khi đăng nhập thành công
 * Trả về accessToken và thông tin user (không bao gồm password)
 */
public class AuthResponseDTO {

    private String accessToken;
    private String tokenType = "Bearer";

    // User info
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private Role role;

    public AuthResponseDTO() {
    }

    public AuthResponseDTO(String accessToken, Long userId, String username,
            String email, String fullName, Role role) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}

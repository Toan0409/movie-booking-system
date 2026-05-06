package com.cinema.movie_booking.dto.cinema;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CinemaRequestDTO {
    @NotBlank(message = "Tên rạp không được để trống")
    private String name;

    private String address;

    private String city;

    private String district;

    private String phone;

    private String email;

    private String imageUrl;

    private String description;

    private Boolean isActive;
}
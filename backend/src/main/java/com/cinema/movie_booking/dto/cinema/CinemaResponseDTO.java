package com.cinema.movie_booking.dto.cinema;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CinemaResponseDTO {
    private Long cinemaId;

    private String name;

    private String address;

    private String city;

    private String district;

    private String phone;

    private String email;

    private String imageUrl;

    private String description;

    private Boolean isActive;

    private LocalDateTime createdAt;
}

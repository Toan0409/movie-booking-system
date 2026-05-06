package com.cinema.movie_booking.dto.director;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DirectorResponseDTO {
    private Long directorId;

    private String name;

    private String biography;

    private LocalDate birthDate;

    private String nationality;

    private String imageUrl;

    private LocalDateTime createdAt;
}

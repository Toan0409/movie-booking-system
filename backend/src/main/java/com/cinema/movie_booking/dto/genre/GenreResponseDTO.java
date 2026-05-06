package com.cinema.movie_booking.dto.genre;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GenreResponseDTO {
    private Long genreId;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private Boolean isDeleted;
}

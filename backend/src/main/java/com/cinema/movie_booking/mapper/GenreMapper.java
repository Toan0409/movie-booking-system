package com.cinema.movie_booking.mapper;

import com.cinema.movie_booking.dto.genre.GenreRequestDTO;
import com.cinema.movie_booking.dto.genre.GenreResponseDTO;
import com.cinema.movie_booking.entity.Genre;

public class GenreMapper {
    public static Genre toEntity(GenreRequestDTO requestDTO) {
        return Genre.builder()
                .name(requestDTO.getName().trim())
                .description(requestDTO.getDescription())
                .isDeleted(false)
                .build();
    }

    public static GenreResponseDTO toDTO(Genre genre) {
        return GenreResponseDTO.builder()
                .genreId(genre.getGenreId())
                .name(genre.getName())
                .description(genre.getDescription())
                .createdAt(genre.getCreatedAt())
                .isDeleted(genre.getIsDeleted())
                .build();
    }
}

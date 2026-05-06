package com.cinema.movie_booking.mapper;

import com.cinema.movie_booking.dto.director.DirectorRequestDTO;
import com.cinema.movie_booking.dto.director.DirectorResponseDTO;
import com.cinema.movie_booking.entity.Director;

public class DirectorMapper {
    public static Director toEntity(DirectorRequestDTO requestDTO) {
        return Director.builder()
                .name(requestDTO.getName().trim())
                .biography(requestDTO.getBiography())
                .birthDate(requestDTO.getBirthDate())
                .imageUrl(requestDTO.getImageUrl())
                .nationality(requestDTO.getNationality())
                .build();
    }

    public static DirectorResponseDTO toDTO(Director director) {
        return DirectorResponseDTO.builder()
                .directorId(director.getDirectorId())
                .name(director.getName())
                .biography(director.getBiography())
                .birthDate(director.getBirthDate())
                .nationality(director.getNationality())
                .imageUrl(director.getImageUrl())
                .createdAt(director.getCreatedAt())
                .build();
    }
}

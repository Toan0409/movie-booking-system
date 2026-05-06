package com.cinema.movie_booking.mapper;

import com.cinema.movie_booking.dto.cinema.CinemaRequestDTO;
import com.cinema.movie_booking.dto.cinema.CinemaResponseDTO;
import com.cinema.movie_booking.entity.Cinema;

public class CinemaMapper {
    public static Cinema toEntity(CinemaRequestDTO requestDTO) {
        return Cinema.builder()
                .name(requestDTO.getName().trim())
                .address(requestDTO.getAddress().trim())
                .city(requestDTO.getCity().trim())
                .district(requestDTO.getDistrict().trim())
                .phone(requestDTO.getPhone().trim())
                .email(requestDTO.getEmail().trim())
                .imageUrl(requestDTO.getImageUrl().trim())
                .description(requestDTO.getDescription().trim())
                .build();
    }

    public static CinemaResponseDTO toDTO(Cinema cinema) {
        return CinemaResponseDTO.builder()
                .cinemaId(cinema.getCinemaId())
                .name(cinema.getName())
                .address(cinema.getAddress())
                .city(cinema.getCity())
                .district(cinema.getDistrict())
                .phone(cinema.getPhone())
                .email(cinema.getEmail())
                .imageUrl(cinema.getImageUrl())
                .description(cinema.getDescription())
                .isActive(cinema.getIsActive())
                .createdAt(cinema.getCreatedAt())
                .build();
    }
}

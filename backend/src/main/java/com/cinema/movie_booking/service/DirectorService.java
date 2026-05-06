package com.cinema.movie_booking.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.cinema.movie_booking.dto.director.DirectorRequestDTO;
import com.cinema.movie_booking.dto.director.DirectorResponseDTO;

public interface DirectorService {
    DirectorResponseDTO createDirector(DirectorRequestDTO requestDTO);

    Page<DirectorResponseDTO> getAllDirectors(String keyword, Pageable pageable);

    DirectorResponseDTO getDirectorById(Long id);

    DirectorResponseDTO updateDirector(Long id, DirectorRequestDTO requestDTO);

    void deleteDirector(Long id);
}

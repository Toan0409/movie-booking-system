package com.cinema.movie_booking.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.cinema.movie_booking.dto.genre.GenreRequestDTO;
import com.cinema.movie_booking.dto.genre.GenreResponseDTO;

public interface GenreService {
    GenreResponseDTO createGenre(GenreRequestDTO requestDTO);

    Page<GenreResponseDTO> getAllGenres(String keyword ,Pageable pageable);

    GenreResponseDTO getGenreById(Long id);

    GenreResponseDTO updateGenre(Long id, GenreRequestDTO requestDTO);

    void deleteGenre(Long id);

    GenreResponseDTO restoreGenre(Long id);

}

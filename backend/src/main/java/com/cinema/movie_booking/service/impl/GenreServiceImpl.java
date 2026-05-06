package com.cinema.movie_booking.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.cinema.movie_booking.dto.genre.GenreRequestDTO;
import com.cinema.movie_booking.dto.genre.GenreResponseDTO;
import com.cinema.movie_booking.entity.Genre;
import com.cinema.movie_booking.mapper.GenreMapper;
import com.cinema.movie_booking.repository.GenreRepository;
import com.cinema.movie_booking.service.GenreService;

import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class GenreServiceImpl implements GenreService{
    private final GenreRepository genreRepository;

    @Override
    public GenreResponseDTO createGenre(GenreRequestDTO request) {
        String name = request.getName().trim();

        if (genreRepository.existsByNameIgnoreCaseAndIsDeletedFalse(name)) {
            throw new IllegalArgumentException("Tên thể loại đã tồn tại");
        }

        Genre genre = GenreMapper.toEntity(request);
        return GenreMapper.toDTO(genreRepository.save(genre));
    }

    @Override
    public Page<GenreResponseDTO> getAllGenres(String keyword,Pageable pageable) {
        Page<Genre> page;

        if (keyword != null && !keyword.isBlank()) {
            page = genreRepository.findByNameContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);
        } else {
            page = genreRepository.findByIsDeletedFalse(pageable);
        }

        return page.map(GenreMapper::toDTO);
    }

    @Override
    public GenreResponseDTO getGenreById(Long id) {
        Genre genre = genreRepository.findByGenreIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thể loại"));

        return GenreMapper.toDTO(genre);
    }

    @Override
    public GenreResponseDTO updateGenre(Long id, GenreRequestDTO request) {

        Genre genre = genreRepository.findByGenreIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thể loại"));

        String newName = request.getName().trim();

        if (!genre.getName().equalsIgnoreCase(newName) &&
                genreRepository.existsByNameIgnoreCaseAndIsDeletedFalse(newName)) {
            throw new IllegalArgumentException("Tên thể loại đã tồn tại");
        }

        genre.setName(newName);
        genre.setDescription(request.getDescription());

        return GenreMapper.toDTO(genreRepository.save(genre));
    }

    @Override
    public void deleteGenre(Long id) {
        Genre genre = genreRepository.findByGenreIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thể loại"));

        genre.setIsDeleted(true);
        genreRepository.save(genre);
    }

    @Override
    public GenreResponseDTO restoreGenre(Long id) {
        Genre genre = genreRepository.findByGenreIdAndIsDeletedTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thể loại đã xóa"));

        genre.setIsDeleted(false);
        return GenreMapper.toDTO(genreRepository.save(genre));
    }

}

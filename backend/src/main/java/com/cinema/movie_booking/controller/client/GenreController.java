package com.cinema.movie_booking.controller.client;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.genre.GenreResponseDTO;
import com.cinema.movie_booking.service.GenreService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
public class GenreController {
    private final GenreService genreService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<GenreResponseDTO>>> getAll(
            @RequestParam(required = false) String keyword, Pageable pageable) {
        Page<GenreResponseDTO> genres = genreService.getAllGenres(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(genres, "Lấy danh sách thể loại thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GenreResponseDTO>> getByID(@PathVariable Long id) {
        GenreResponseDTO genreResponseDTO = genreService.getGenreById(id);
        return ResponseEntity.ok(ApiResponse.success(genreResponseDTO, "Lấy thông tin thể loại thành công"));
    }
}

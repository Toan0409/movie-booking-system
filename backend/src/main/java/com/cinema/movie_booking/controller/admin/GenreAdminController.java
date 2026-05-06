package com.cinema.movie_booking.controller.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.genre.GenreRequestDTO;
import com.cinema.movie_booking.dto.genre.GenreResponseDTO;
import com.cinema.movie_booking.service.GenreService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/admin/genres")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class GenreAdminController {
    private final GenreService genreService;

    @PostMapping
    public ResponseEntity<ApiResponse<GenreResponseDTO>> createGenre(@Valid @RequestBody GenreRequestDTO requestDTO) {
        GenreResponseDTO genreResponseDTO = genreService.createGenre(requestDTO);
        return ResponseEntity.ok(ApiResponse.success(genreResponseDTO, "Tạo thể loại thành công"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<GenreResponseDTO>>> getAll(
            @RequestParam(required = false) String keyword, Pageable pageable) {
        Page<GenreResponseDTO> genres = genreService.getAllGenres(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(genres, "Lấy danh sách thể loại thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GenreResponseDTO>> update(@PathVariable Long id,
            @Valid @RequestBody GenreRequestDTO requestDTO) {
        GenreResponseDTO genreResponseDTO = genreService.updateGenre(id, requestDTO);
        return ResponseEntity.ok(ApiResponse.success(genreResponseDTO, "Cập nhật thể loại thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        genreService.deleteGenre(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa thể loại thành công"));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<GenreResponseDTO>> restore(@PathVariable Long id) {
        GenreResponseDTO genreResponseDTO = genreService.restoreGenre(id);
        return ResponseEntity.ok(ApiResponse.success(genreResponseDTO, "Khôi phục thể loại thành công"));
    }

}

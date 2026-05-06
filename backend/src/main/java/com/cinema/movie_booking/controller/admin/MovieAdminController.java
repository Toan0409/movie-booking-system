package com.cinema.movie_booking.controller.admin;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.movie.MoviePageDTO;
import com.cinema.movie_booking.dto.movie.MovieRequestDTO;
import com.cinema.movie_booking.dto.movie.MovieResponseDTO;
import com.cinema.movie_booking.service.MovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/movies")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class MovieAdminController {

    private final MovieService movieService;

    /**
     * Tạo mới Movie
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MovieResponseDTO>> createMovie(
            @Valid @RequestBody MovieRequestDTO requestDTO) {
        MovieResponseDTO movie = movieService.createMovie(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(movie, "Tạo phim thành công"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MovieResponseDTO>>> getAllMovies(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        Page<MovieResponseDTO> movies = movieService.getAllMovies(pageable);
        return ResponseEntity.ok(ApiResponse.success(movies, "Lấy danh sách phim thành công"));
    }

    /**
     * Cập nhật Movie
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieResponseDTO>> updateMovie(
            @PathVariable Long id,
            @Valid @RequestBody MovieRequestDTO requestDTO) {
        MovieResponseDTO movie = movieService.updateMovie(id, requestDTO);
        return ResponseEntity.ok(ApiResponse.success(movie, "Cập nhật phim thành công"));
    }

    /**
     * Xóa Movie (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa phim thành công"));
    }

    /**
     * Khôi phục phim đã xóa
     */
    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<MovieResponseDTO>> restoreMovie(@PathVariable Long id) {
        MovieResponseDTO movie = movieService.restoreMovie(id);
        return ResponseEntity.ok(ApiResponse.success(movie, "Khôi phục phim thành công"));
    }

}

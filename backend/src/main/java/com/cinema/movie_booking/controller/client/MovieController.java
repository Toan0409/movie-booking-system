package com.cinema.movie_booking.controller.client;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.movie.MovieResponseDTO;
import com.cinema.movie_booking.service.MovieService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MovieResponseDTO>>> getAllMovies(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        Page<MovieResponseDTO> movies = movieService.getAllMovies(pageable);
        return ResponseEntity.ok(ApiResponse.success(movies, "Lấy danh sách phim thành công"));
    }

    /**
     * Lấy Movie theo id
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieResponseDTO>> getMovieById(@PathVariable Long id) {
        MovieResponseDTO movie = movieService.getMovieById(id);
        return ResponseEntity.ok(ApiResponse.success(movie, "Lấy thông tin phim thành công"));
    }

    /**
     * Lấy danh sách phim đang chiếu (có phân trang)
     */
    @GetMapping("/now-showing")
    public ResponseEntity<ApiResponse<Page<MovieResponseDTO>>> getMoviesNowShowing(
            @PageableDefault(size = 10, sort = "releaseDate") Pageable pageable) {
        Page<MovieResponseDTO> movies = movieService.getMoviesNowShowing(pageable);
        return ResponseEntity.ok(ApiResponse.success(movies, "Lấy danh sách phim đang chiếu thành công"));
    }

    /**
     * Lấy danh sách phim sắp chiếu (có phân trang)
     */
    @GetMapping("/coming-soon")
    public ResponseEntity<ApiResponse<Page<MovieResponseDTO>>> getMoviesComingSoon(
            @PageableDefault(size = 10, sort = "releaseDate") Pageable pageable) {
        Page<MovieResponseDTO> movies = movieService.getMoviesComingSoon(pageable);
        return ResponseEntity.ok(ApiResponse.success(movies, "Lấy danh sách phim sắp chiếu thành công"));
    }

    /**
     * Lấy danh sách phim nổi bật (có phân trang)
     */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<Page<MovieResponseDTO>>> getFeaturedMovies(
            @PageableDefault(size = 10, sort = "rating") Pageable pageable) {
        Page<MovieResponseDTO> movies = movieService.getFeaturedMovies(pageable);
        return ResponseEntity.ok(ApiResponse.success(movies, "Lấy danh sách phim nổi bật thành công"));
    }

    /**
     * Tìm kiếm phim theo tên (có phân trang)
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<MovieResponseDTO>>> searchMovies(
            @RequestParam String keyword,
            @PageableDefault(size = 10, sort = "title") Pageable pageable) {
        Page<MovieResponseDTO> movies = movieService.searchMovies(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(movies, "Tìm kiếm phim thành công"));
    }

    /**
     * Lấy danh sách phim theo thể loại (có phân trang)
     */
    @GetMapping("/genre/{genreId}")
    public ResponseEntity<ApiResponse<Page<MovieResponseDTO>>> getMoviesByGenre(
            @PathVariable Long genreId,
            @PageableDefault(size = 10, sort = "title") Pageable pageable) {
        Page<MovieResponseDTO> movies = movieService.getMoviesByGenre(genreId, pageable);
        return ResponseEntity.ok(ApiResponse.success(movies, "Lấy danh sách phim theo thể loại thành công"));
    }
}

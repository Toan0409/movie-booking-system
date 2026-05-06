package com.cinema.movie_booking.service;

import com.cinema.movie_booking.dto.movie.MoviePageDTO;
import com.cinema.movie_booking.dto.movie.MovieRequestDTO;
import com.cinema.movie_booking.dto.movie.MovieResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface cho Movie
 * Định nghĩa các method nghiệp vụ
 */
public interface MovieService {

    /**
     * Tạo mới phim
     */
    MovieResponseDTO createMovie(MovieRequestDTO requestDTO);

    /**
     * Lấy danh sách tất cả phim (có phân trang)
     */
    Page<MovieResponseDTO> getAllMovies(Pageable pageable);

    /**
     * Lấy thông tin phim theo ID
     */
    MovieResponseDTO getMovieById(Long id);

    /**
     * Cập nhật thông tin phim
     */
    MovieResponseDTO updateMovie(Long id, MovieRequestDTO requestDTO);

    /**
     * Xóa phim (soft delete)
     */
    void deleteMovie(Long id);

    /**
     * Khôi phục phim đã xóa
     */
    MovieResponseDTO restoreMovie(Long id);

    /**
     * Lấy danh sách phim đang chiếu (có phân trang)
     */
    Page<MovieResponseDTO> getMoviesNowShowing(Pageable pageable);

    /**
     * Lấy danh sách phim sắp chiếu (có phân trang)
     */
    Page<MovieResponseDTO> getMoviesComingSoon(Pageable pageable);

    /**
     * Lấy danh sách phim nổi bật (có phân trang)
     */
    Page<MovieResponseDTO> getFeaturedMovies(Pageable pageable);

    /**
     * Tìm kiếm phim theo từ khóa (có phân trang)
     */
    Page<MovieResponseDTO> searchMovies(String keyword, Pageable pageable);

    /**
     * Lấy danh sách phim theo thể loại (có phân trang)
     */
    Page<MovieResponseDTO> getMoviesByGenre(Long genreId, Pageable pageable);
}

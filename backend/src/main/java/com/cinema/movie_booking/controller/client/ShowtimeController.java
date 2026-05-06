package com.cinema.movie_booking.controller.client;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.showtime.ShowtimeResponseDTO;
import com.cinema.movie_booking.service.ShowtimeService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/client/showtimes")
@AllArgsConstructor
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    /**
     * Get showtime by ID
     * GET /api/client/showtimes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponseDTO>> getById(@PathVariable Long id) {
        ShowtimeResponseDTO showtime = showtimeService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(showtime, "Lấy thông tin suất chiếu thành công"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShowtimeResponseDTO>>> getActiveShowtimes() {
        // Return today's showtimes by default
        List<ShowtimeResponseDTO> showtimes = showtimeService.getByDate(LocalDate.now());
        return ResponseEntity.ok(ApiResponse.success(showtimes, "Lấy danh sách suất chiếu thành công"));
    }

    /**
     * Get showtimes by movie ID
     * GET /api/client/showtimes/movie/{movieId}
     */
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ApiResponse<List<ShowtimeResponseDTO>>> getByMovieId(@PathVariable Long movieId) {
        List<ShowtimeResponseDTO> showtimes = showtimeService.getByMovieId(movieId);
        return ResponseEntity.ok(ApiResponse.success(showtimes, "Lấy danh sách suất chiếu theo phim thành công"));
    }

    /**
     * Get showtimes by theater ID
     * GET /api/client/showtimes/theater/{theaterId}
     */
    @GetMapping("/theater/{theaterId}")
    public ResponseEntity<ApiResponse<List<ShowtimeResponseDTO>>> getByTheaterId(@PathVariable Long theaterId) {
        List<ShowtimeResponseDTO> showtimes = showtimeService.getByTheaterId(theaterId);
        return ResponseEntity
                .ok(ApiResponse.success(showtimes, "Lấy danh sách suất chiếu theo phòng chiếu thành công"));
    }

    /**
     * Get showtimes by date
     * GET /api/client/showtimes/date?date=2024-01-15
     */
    @GetMapping("/date")
    public ResponseEntity<ApiResponse<List<ShowtimeResponseDTO>>> getByDate(@RequestParam LocalDate date) {
        List<ShowtimeResponseDTO> showtimes = showtimeService.getByDate(date);
        return ResponseEntity.ok(ApiResponse.success(showtimes, "Lấy danh sách suất chiếu theo ngày thành công"));
    }

    /**
     * Get showtimes by movie and date
     * GET /api/client/showtimes/movie/{movieId}/date?date=2024-01-15
     */
    @GetMapping("/movie/{movieId}/date")
    public ResponseEntity<ApiResponse<List<ShowtimeResponseDTO>>> getByMovieAndDate(
            @PathVariable Long movieId,
            @RequestParam LocalDate date) {
        List<ShowtimeResponseDTO> showtimes = showtimeService.getByMovieAndDate(movieId, date);
        return ResponseEntity
                .ok(ApiResponse.success(showtimes, "Lấy danh sách suất chiếu theo phim và ngày thành công"));
    }
}

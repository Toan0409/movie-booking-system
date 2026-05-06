package com.cinema.movie_booking.controller.admin;

import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.showtime.ShowtimeRequestDTO;
import com.cinema.movie_booking.dto.showtime.ShowtimeResponseDTO;
import com.cinema.movie_booking.service.ShowtimeService;

import jakarta.validation.Valid;
import java.time.LocalDate;

/**
 * Admin controller for Showtime management
 * Only ADMIN or STAFF can access these endpoints
 */
@RestController
@RequestMapping("/api/admin/showtimes")
@PreAuthorize("hasRole('ADMIN')")
@AllArgsConstructor
public class ShowtimeAdminController {

    private final ShowtimeService showtimeService;

    /**
     * Create a new showtime
     * POST /api/admin/showtimes
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ShowtimeResponseDTO>> create(
            @Valid @RequestBody ShowtimeRequestDTO request) {
        ShowtimeResponseDTO showtime = showtimeService.create(request);
        return ResponseEntity.ok(ApiResponse.success(showtime, "Tạo suất chiếu thành công"));
    }

    /**
     * Update an existing showtime
     * PUT /api/admin/showtimes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponseDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody ShowtimeRequestDTO request) {
        ShowtimeResponseDTO showtime = showtimeService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(showtime, "Cập nhật suất chiếu thành công"));
    }

    /**
     * Get showtime by ID
     * GET /api/admin/showtimes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponseDTO>> getById(@PathVariable Long id) {
        ShowtimeResponseDTO showtime = showtimeService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(showtime, "Lấy thông tin suất chiếu thành công"));
    }

    /**
     * Get all showtimes with pagination
     * GET /api/admin/showtimes
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ShowtimeResponseDTO>>> getAll(Pageable pageable) {
        Page<ShowtimeResponseDTO> showtimes = showtimeService.getAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(showtimes, "Lấy danh sách suất chiếu thành công"));
    }

    /**
     * Get all active showtimes
     * GET /api/admin/showtimes/active
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<Page<ShowtimeResponseDTO>>> getActiveShowtimes(Pageable pageable) {
        Page<ShowtimeResponseDTO> showtimes = showtimeService.getActiveShowtimes(pageable);
        return ResponseEntity.ok(ApiResponse.success(showtimes, "Lấy danh sách suất chiếu đang hoạt động thành công"));
    }

    /**
     * Get showtimes by movie ID
     * GET /api/admin/showtimes/movie/{movieId}
     */
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ApiResponse<java.util.List<ShowtimeResponseDTO>>> getByMovieId(
            @PathVariable Long movieId) {
        java.util.List<ShowtimeResponseDTO> showtimes = showtimeService.getByMovieId(movieId);
        return ResponseEntity.ok(ApiResponse.success(showtimes, "Lấy danh sách suất chiếu theo phim thành công"));
    }

    /**
     * Get showtimes by theater ID
     * GET /api/admin/showtimes/theater/{theaterId}
     */
    @GetMapping("/theater/{theaterId}")
    public ResponseEntity<ApiResponse<java.util.List<ShowtimeResponseDTO>>> getByTheaterId(
            @PathVariable Long theaterId) {
        java.util.List<ShowtimeResponseDTO> showtimes = showtimeService.getByTheaterId(theaterId);
        return ResponseEntity
                .ok(ApiResponse.success(showtimes, "Lấy danh sách suất chiếu theo phòng chiếu thành công"));
    }

    /**
     * Get showtimes by date
     * GET /api/admin/showtimes/date?date=2024-01-15
     */
    @GetMapping("/date")
    public ResponseEntity<ApiResponse<java.util.List<ShowtimeResponseDTO>>> getByDate(
            @RequestParam LocalDate date) {
        java.util.List<ShowtimeResponseDTO> showtimes = showtimeService.getByDate(date);
        return ResponseEntity.ok(ApiResponse.success(showtimes, "Lấy danh sách suất chiếu theo ngày thành công"));
    }

    /**
     * Deactivate a showtime (soft delete)
     * DELETE /api/admin/showtimes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        showtimeService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Vô hiệu hóa suất chiếu thành công"));
    }

    /**
     * Activate a showtime
     * PATCH /api/admin/showtimes/{id}/activate
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<ShowtimeResponseDTO>> activate(@PathVariable Long id) {
        ShowtimeResponseDTO showtime = showtimeService.activate(id);
        return ResponseEntity.ok(ApiResponse.success(showtime, "Kích hoạt suất chiếu thành công"));
    }
}

package com.cinema.movie_booking.controller.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.cinema.CinemaRequestDTO;
import com.cinema.movie_booking.dto.cinema.CinemaResponseDTO;
import com.cinema.movie_booking.service.CinemaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/cinemas")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class CinemaAdminController {

    private final CinemaService cinemaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CinemaResponseDTO>>> getAll() {
        List<CinemaResponseDTO> cinemas = cinemaService.getAllCinemas();
        return ResponseEntity.ok(ApiResponse.success(cinemas, "Lấy danh sách rạp thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaResponseDTO>> getById(@PathVariable Long id) {
        CinemaResponseDTO cinema = cinemaService.getCinemaById(id);
        return ResponseEntity.ok(ApiResponse.success(cinema, "Lấy thông tin rạp thành công"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CinemaResponseDTO>> create(@RequestBody CinemaRequestDTO cinema) {
        CinemaResponseDTO created = cinemaService.createCinema(cinema);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Tạo rạp thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaResponseDTO>> update(
            @PathVariable Long id,
            @RequestBody CinemaRequestDTO cinema) {

        CinemaResponseDTO updated = cinemaService.updateCinema(id, cinema);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật rạp thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        cinemaService.deleteCinema(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa rạp thành công"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CinemaResponseDTO>>> searchByName(
            @RequestParam String keyword) {

        List<CinemaResponseDTO> cinemas = cinemaService.searchCinemasByName(keyword);
        return ResponseEntity.ok(ApiResponse.success(cinemas, "Tìm kiếm rạp thành công"));
    }

    @GetMapping("/city")
    public ResponseEntity<ApiResponse<List<CinemaResponseDTO>>> getByCity(
            @RequestParam String city) {

        List<CinemaResponseDTO> cinemas = cinemaService.getCinemasByCity(city);
        return ResponseEntity.ok(ApiResponse.success(cinemas, "Lấy danh sách rạp theo thành phố"));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<CinemaResponseDTO>> restore(@PathVariable Long id) {

        CinemaResponseDTO cinema = cinemaService.restoreCinema(id);
        return ResponseEntity.ok(ApiResponse.success(cinema, "Khôi phục rạp thành công"));
    }
}
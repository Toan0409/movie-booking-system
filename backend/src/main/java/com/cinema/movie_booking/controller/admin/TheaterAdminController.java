package com.cinema.movie_booking.controller.admin;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.theater.TheaterRequestDTO;
import com.cinema.movie_booking.dto.theater.TheaterResponseDTO;
import com.cinema.movie_booking.service.TheaterService;

import lombok.AllArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/admin/theaters")
@PreAuthorize("hasRole('ADMIN')")
@AllArgsConstructor
public class TheaterAdminController {
    private final TheaterService theaterService;

    @PostMapping
    public ResponseEntity<ApiResponse<TheaterResponseDTO>> create(@RequestBody TheaterRequestDTO theaterRequestDTO) {
        TheaterResponseDTO theater = theaterService.create(theaterRequestDTO);
        return ResponseEntity.ok(ApiResponse.success(theater, "Thêm phòng chiếu thành công"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TheaterResponseDTO>>> getAll(Pageable pageable) {
        Page<TheaterResponseDTO> theaters = theaterService.getAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(theaters, "Lấy danh sách phòng chiếu thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TheaterResponseDTO>> getById(@PathVariable Long id) {
        TheaterResponseDTO theater = theaterService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(theater, "Lấy thông tin phòng chiếu thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TheaterResponseDTO>> update(@PathVariable Long id,
            @RequestBody TheaterRequestDTO theaterRequestDTO) {
        TheaterResponseDTO theater = theaterService.update(id, theaterRequestDTO);
        return ResponseEntity.ok(ApiResponse.success(theater, "Cập nhật phòng chiếu thành công"));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<TheaterResponseDTO>> restore(@PathVariable Long id) {
        TheaterResponseDTO theater = theaterService.restore(id);
        return ResponseEntity.ok(ApiResponse.success(theater, "Khôi phục phòng chiếu thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        theaterService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa phòng chiếu thành công"));
    }

}

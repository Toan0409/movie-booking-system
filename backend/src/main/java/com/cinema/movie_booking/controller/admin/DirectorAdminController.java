package com.cinema.movie_booking.controller.admin;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.director.DirectorRequestDTO;
import com.cinema.movie_booking.dto.director.DirectorResponseDTO;
import com.cinema.movie_booking.service.DirectorService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/admin/directors")
@PreAuthorize("hasRole('ADMIN')")
@AllArgsConstructor
public class DirectorAdminController {
    private final DirectorService directorService;

    @PostMapping
    public ResponseEntity<ApiResponse<DirectorResponseDTO>> createDirector(
            @Valid @RequestBody DirectorRequestDTO requestDTO) {
        DirectorResponseDTO director = directorService.createDirector(requestDTO);
        return ResponseEntity.ok(ApiResponse.success(director, "Tạo đạo diễn thành công"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DirectorResponseDTO>>> getAll(@RequestParam(required = false) String keyword,
            Pageable pageable) {
        Page<DirectorResponseDTO> directors = directorService.getAllDirectors(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(directors, "Lấy danh sách đạo diễn thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DirectorResponseDTO>> getById(@PathVariable Long id) {
        DirectorResponseDTO director = directorService.getDirectorById(id);
        return ResponseEntity.ok(ApiResponse.success(director, "Lấy thông tin đạo diễn thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DirectorResponseDTO>> update(@PathVariable Long id,
            @Valid @RequestBody DirectorRequestDTO requestDTO) {
        DirectorResponseDTO director = directorService.updateDirector(id, requestDTO);
        return ResponseEntity.ok(ApiResponse.success(director, "Cập nhật đạo diễn thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        directorService.deleteDirector(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa đạo diễn thành công"));
    }
}

package com.cinema.movie_booking.controller.admin;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.movie_booking.dto.actor.ActorRequestDTO;
import com.cinema.movie_booking.dto.actor.ActorResponseDTO;
import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.service.ActorService;

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
@RequestMapping("/api/admin/actors")
@PreAuthorize("hasRole('ADMIN')")
@AllArgsConstructor
public class ActorAdminController {
    private final ActorService actorService;

    @PostMapping
    public ResponseEntity<ApiResponse<ActorResponseDTO>> createActor(
            @Valid @RequestBody ActorRequestDTO actorRequestDTO) {
        ActorResponseDTO actor = actorService.createActor(actorRequestDTO);
        return ResponseEntity.ok(ApiResponse.success(actor, "Tạo diễn viên thành công"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ActorResponseDTO>>> getAll(@RequestParam(required = false) String keyword,
            Pageable pageable) {
        Page<ActorResponseDTO> actors = actorService.getAllActors(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(actors, "Lấy danh sách diễn viên thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActorResponseDTO>> getById(@PathVariable Long id) {
        ActorResponseDTO actor = actorService.getActorById(id);
        return ResponseEntity.ok(ApiResponse.success(actor, "Lấy thông tin diễn viên thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ActorResponseDTO>> update(@PathVariable Long id,
            @Valid @RequestBody ActorRequestDTO actorRequestDTO) {
        ActorResponseDTO actor = actorService.updateActor(id, actorRequestDTO);
        return ResponseEntity.ok(ApiResponse.success(actor, "Cập nhật diễn viên thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        actorService.deleteActor(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa diễn viên thành công"));
    }

}

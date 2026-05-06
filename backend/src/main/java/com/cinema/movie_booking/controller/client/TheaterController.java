package com.cinema.movie_booking.controller.client;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.theater.TheaterResponseDTO;
import com.cinema.movie_booking.service.TheaterService;

import lombok.AllArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/theaters")
@AllArgsConstructor
public class TheaterController {
    private final TheaterService theaterService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TheaterResponseDTO>>> getActiveTheater(Pageable pageable) {
        Page<TheaterResponseDTO> theaters = theaterService.getByIsActiveTrue(pageable);
        return ResponseEntity.ok(ApiResponse.success(theaters, "Lấy danh sách phòng chiếu thành công"));
    }

}

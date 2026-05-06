package com.cinema.movie_booking.controller.admin;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.seat.SeatResponseDTO;
import com.cinema.movie_booking.entity.SeatType;
import com.cinema.movie_booking.repository.SeatTypeRepository;
import com.cinema.movie_booking.service.SeatService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin controller for seat management operations
 * Base path: /api/admin/seats
 */
@RestController
@RequestMapping("/api/admin/seats")
@PreAuthorize("hasRole('ADMIN')")
@AllArgsConstructor
public class SeatAdminController {

    private final SeatService seatService;
    private final SeatTypeRepository seatTypeRepository;

    /**
     * Lấy danh sách ghế theo phòng chiếu
     */
    @GetMapping("/theaters/{theaterId}")
    public ResponseEntity<ApiResponse<List<SeatResponseDTO>>> getSeatsByTheater(@PathVariable Long theaterId) {
        List<SeatResponseDTO> seats = seatService.getSeatsByTheater(theaterId);
        return ResponseEntity.ok(ApiResponse.success(seats, "Lấy danh sách ghế theo phòng chiếu thành công"));
    }

    /**
     * Cập nhật loại ghế
     */
    @PatchMapping("/{seatId}/type")
    public ResponseEntity<ApiResponse<SeatResponseDTO>> updateSeatType(
            @PathVariable Long seatId,
            @RequestParam String seatTypeName) {

        SeatType seatType = seatTypeRepository.findByName(seatTypeName)
                .orElseThrow(() -> new RuntimeException("Loại ghế không tồn tại: " + seatTypeName));

        SeatResponseDTO updatedSeat = seatService.updateSeatType(seatId, seatType);
        return ResponseEntity.ok(ApiResponse.success(updatedSeat, "Cập nhật loại ghế thành công"));
    }

    /**
     * Vô hiệu hóa ghế
     */
    @PatchMapping("/{seatId}/disable")
    public ResponseEntity<ApiResponse<Void>> disableSeat(@PathVariable Long seatId) {
        seatService.disableSeat(seatId);
        return ResponseEntity.ok(ApiResponse.success(null, "Vô hiệu hóa ghế thành công"));
    }

    /**
     * Kích hoạt lại ghế
     */
    @PatchMapping("/{seatId}/enable")
    public ResponseEntity<ApiResponse<Void>> enableSeat(@PathVariable Long seatId) {
        seatService.enableSeat(seatId);
        return ResponseEntity.ok(ApiResponse.success(null, "Kích hoạt ghế thành công"));
    }

    /**
     * Tạo lại toàn bộ ghế của phòng chiếu
     */
    @PostMapping("/theaters/{theaterId}/regenerate")
    public ResponseEntity<ApiResponse<Void>> regenerateSeats(@PathVariable Long theaterId) {
        seatService.regenerateSeats(theaterId);
        return ResponseEntity.ok(ApiResponse.success(null, "Tạo lại ghế thành công"));
    }

    /**
     * Lấy thông tin một ghế
     */
    @GetMapping("/{seatId}")
    public ResponseEntity<ApiResponse<SeatResponseDTO>> getSeatById(@PathVariable Long seatId) {
        SeatResponseDTO seat = seatService.getSeatById(seatId);
        return ResponseEntity.ok(ApiResponse.success(seat, "Lấy thông tin ghế thành công"));
    }
}

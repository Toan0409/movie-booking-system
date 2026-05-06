package com.cinema.movie_booking.mapper;

import com.cinema.movie_booking.dto.seat.SeatAvailabilityDTO;
import com.cinema.movie_booking.dto.seat.SeatRequestDTO;
import com.cinema.movie_booking.dto.seat.SeatResponseDTO;
import com.cinema.movie_booking.entity.Seat;
import com.cinema.movie_booking.entity.SeatType;
import com.cinema.movie_booking.entity.Theater;

/**
 * Mapper for converting between Seat entity and DTOs
 */
public class SeatMapper {

    /**
     * Convert SeatRequestDTO to Seat entity
     * 
     * @param requestDTO the request DTO
     * @param theater    the theater entity
     * @param seatType   the seat type entity
     * @return Seat entity
     */
    public static Seat toEntity(SeatRequestDTO requestDTO, Theater theater, SeatType seatType) {
        if (requestDTO == null) {
            return null;
        }

        return Seat.builder()
                .seatRow(requestDTO.getRowLabel())
                .seatNumber(requestDTO.getSeatNumber())
                .seatCode(requestDTO.getRowLabel() + requestDTO.getSeatNumber())
                .theater(theater)
                .seatType(seatType)
                .isAvailable(requestDTO.getIsActive() != null ? requestDTO.getIsActive() : true)
                .isCoupleSeat("COUPLE".equalsIgnoreCase(seatType.getName()))
                .build();
    }

    /**
     * Convert Seat entity to SeatResponseDTO
     * 
     * @param seat the seat entity
     * @return the response DTO
     */
    public static SeatResponseDTO toResponseDTO(Seat seat) {
        if (seat == null) {
            return null;
        }

        return SeatResponseDTO.builder()
                .seatId(seat.getSeatId())
                .theaterId(seat.getTheater().getTheaterId())
                .theaterName(seat.getTheater().getName())
                .seatLabel(seat.getSeatCode())
                .seatRow(seat.getSeatRow())
                .seatNumber(seat.getSeatNumber())
                .seatType(seat.getSeatType() != null ? seat.getSeatType().getName() : null)
                .priceMultiplier(seat.getSeatType() != null ? seat.getSeatType().getPriceMultiplier() : 1.0)
                .isAvailable(seat.getIsAvailable())
                .isCoupleSeat(seat.getIsCoupleSeat())
                .isActive(seat.getIsAvailable())
                .build();
    }

    /**
     * Convert Seat entity to SeatAvailabilityDTO
     * 
     * @param seat   the seat entity
     * @param status the availability status (AVAILABLE, RESERVED, OCCUPIED)
     * @return the availability DTO
     */
    public static SeatAvailabilityDTO toAvailabilityDTO(Seat seat, String status) {
        if (seat == null) {
            return null;
        }

        return SeatAvailabilityDTO.builder()
                .seatId(seat.getSeatId())
                .seatLabel(seat.getSeatCode())
                .seatRow(seat.getSeatRow())
                .seatNumber(seat.getSeatNumber())
                .seatType(seat.getSeatType() != null ? seat.getSeatType().getName() : null)
                .priceMultiplier(seat.getSeatType() != null ? seat.getSeatType().getPriceMultiplier() : 1.0)
                .status(status)
                .isCoupleSeat(seat.getIsCoupleSeat())
                .build();
    }
}

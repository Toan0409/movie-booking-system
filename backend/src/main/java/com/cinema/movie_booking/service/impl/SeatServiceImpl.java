package com.cinema.movie_booking.service.impl;

import com.cinema.movie_booking.dto.seat.SeatAvailabilityDTO;
import com.cinema.movie_booking.dto.seat.SeatResponseDTO;
import com.cinema.movie_booking.entity.Booking;
import com.cinema.movie_booking.entity.BookingDetail;
import com.cinema.movie_booking.entity.Seat;
import com.cinema.movie_booking.entity.SeatType;
import com.cinema.movie_booking.entity.Showtime;
import com.cinema.movie_booking.entity.Theater;
import com.cinema.movie_booking.exception.ResourceNotFoundException;
import com.cinema.movie_booking.mapper.SeatMapper;
import com.cinema.movie_booking.repository.BookingDetailRepository;
import com.cinema.movie_booking.repository.SeatRepository;
import com.cinema.movie_booking.repository.SeatTypeRepository;
import com.cinema.movie_booking.repository.ShowtimeRepository;
import com.cinema.movie_booking.repository.TheaterRepository;
import com.cinema.movie_booking.service.SeatService;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementation of SeatService for managing seats in the cinema booking system
 */
@Service
@AllArgsConstructor
public class SeatServiceImpl implements SeatService {

    private final SeatRepository seatRepository;
    private final TheaterRepository theaterRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatTypeRepository seatTypeRepository;
    private final BookingDetailRepository bookingDetailRepository;

    private static final String SEAT_STATUS_AVAILABLE = "AVAILABLE";
    private static final String SEAT_STATUS_RESERVED = "RESERVED";
    private static final String SEAT_STATUS_OCCUPIED = "OCCUPIED";

    @Override
    public List<SeatResponseDTO> getSeatsByTheater(Long theaterId) {
        // Verify theater exists
        Theater theater = theaterRepository.findById(theaterId)
                .orElseThrow(() -> new ResourceNotFoundException("Theater", "id", theaterId));

        // Get all seats for the theater
        List<Seat> seats = seatRepository.findByTheater_TheaterId(theaterId);

        // Convert to response DTOs
        return seats.stream()
                .map(SeatMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SeatAvailabilityDTO> getSeatAvailability(Long showtimeId) {
        // Verify showtime exists
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", "id", showtimeId));

        Long theaterId = showtime.getTheater().getTheaterId();

        // Get all seats in the theater
        List<Seat> seats = seatRepository.findByTheater_TheaterId(theaterId);

        // Get all booking details for this showtime
        List<BookingDetail> bookedDetails = bookingDetailRepository.findByShowtimeId(showtimeId);

        // Create a map of seat ID to booking status for quick lookup
        Map<Long, String> seatStatusMap = new HashMap<>();
        for (BookingDetail detail : bookedDetails) {
            Long seatId = detail.getSeat().getSeatId();
            String bookingStatus = detail.getBooking().getStatus();
            String status;
            if ("PAID".equals(bookingStatus)) {
                status = SEAT_STATUS_OCCUPIED;
            } else if ("PENDING".equals(bookingStatus)) {
                status = SEAT_STATUS_RESERVED;
            } else {
                status = SEAT_STATUS_AVAILABLE;
            }

            // Only update if not already set (first booking takes precedence)
            seatStatusMap.putIfAbsent(seatId, status);
        }

        // Build availability DTOs
        List<SeatAvailabilityDTO> availabilityList = new ArrayList<>();
        for (Seat seat : seats) {
            String status = seatStatusMap.getOrDefault(seat.getSeatId(), SEAT_STATUS_AVAILABLE);

            // Only show AVAILABLE seats if the seat is also marked as available in the
            // system
            if (Boolean.FALSE.equals(seat.getIsAvailable())) {
                status = SEAT_STATUS_OCCUPIED; // Disabled seats are treated as occupied
            }

            availabilityList.add(SeatMapper.toAvailabilityDTO(seat, status));
        }

        return availabilityList;
    }

    @Override
    @Transactional
    public SeatResponseDTO updateSeatType(Long seatId, SeatType seatType) {
        // Verify seat exists
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));

        // Update seat type
        seat.setSeatType(seatType);

        // Update couple seat flag based on type
        seat.setIsCoupleSeat("COUPLE".equalsIgnoreCase(seatType.getName()));

        seat = seatRepository.save(seat);

        return SeatMapper.toResponseDTO(seat);
    }

    @Override
    @Transactional
    public void disableSeat(Long seatId) {
        // Verify seat exists
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));

        // Disable the seat
        seat.setIsAvailable(false);
        seatRepository.save(seat);
    }

    @Override
    @Transactional
    public void enableSeat(Long seatId) {
        // Verify seat exists
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));

        // Enable the seat
        seat.setIsAvailable(true);
        seatRepository.save(seat);
    }

    @Override
    @Transactional
    public void regenerateSeats(Long theaterId) {
        // Verify theater exists
        Theater theater = theaterRepository.findById(theaterId)
                .orElseThrow(() -> new ResourceNotFoundException("Theater", "id", theaterId));

        // Delete all existing seats for this theater
        List<Seat> existingSeats = seatRepository.findByTheater_TheaterId(theaterId);
        seatRepository.deleteAll(existingSeats);

        // Generate new seats
        generateSeats(theater, theater.getRowsCount(), theater.getSeatsPerRow());
    }

    @Override
    public boolean isSeatAvailable(Long showtimeId, Long seatId) {
        // Verify seat exists
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));

        // Check if seat is disabled
        if (Boolean.FALSE.equals(seat.getIsAvailable())) {
            return false;
        }

        // Check if seat is booked for this showtime
        return !bookingDetailRepository.existsByShowtimeIdAndSeatId(showtimeId, seatId);
    }

    @Override
    public SeatResponseDTO getSeatById(Long seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));

        return SeatMapper.toResponseDTO(seat);
    }

    /**
     * Generate seats for a theater based on row count and seats per row
     * 
     * @param theater     the theater entity
     * @param rowsCount   number of rows
     * @param seatsPerRow number of seats per row
     */
    private void generateSeats(Theater theater, Integer rowsCount, Integer seatsPerRow) {
        if (rowsCount == null || seatsPerRow == null || rowsCount <= 0 || seatsPerRow <= 0) {
            return;
        }

        // Get or create default seat types
        SeatType standardType = seatTypeRepository.findByName("STANDARD")
                .orElseGet(() -> seatTypeRepository.save(
                        SeatType.builder()
                                .name("STANDARD")
                                .description("Standard seat")
                                .priceMultiplier(1.0)
                                .build()));

        SeatType vipType = seatTypeRepository.findByName("VIP")
                .orElseGet(() -> seatTypeRepository.save(
                        SeatType.builder()
                                .name("VIP")
                                .description("VIP seat")
                                .priceMultiplier(1.5)
                                .build()));

        List<Seat> seats = new ArrayList<>();

        for (int row = 0; row < rowsCount; row++) {
            char rowChar = (char) ('A' + row);

            for (int seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
                // Determine seat type based on row
                // Last row is VIP, others are STANDARD
                SeatType seatType = (row == rowsCount - 1) ? vipType : standardType;

                Seat seat = Seat.builder()
                        .seatRow(String.valueOf(rowChar))
                        .seatNumber(seatNum)
                        .seatCode(rowChar + String.valueOf(seatNum))
                        .theater(theater)
                        .seatType(seatType)
                        .isAvailable(true)
                        .isCoupleSeat(false)
                        .build();
                seats.add(seat);
            }
        }

        seatRepository.saveAll(seats);
    }

}

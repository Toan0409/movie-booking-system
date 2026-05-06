package com.cinema.movie_booking.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.movie_booking.dto.theater.TheaterRequestDTO;
import com.cinema.movie_booking.dto.theater.TheaterResponseDTO;
import com.cinema.movie_booking.entity.Cinema;
import com.cinema.movie_booking.entity.Seat;
import com.cinema.movie_booking.entity.SeatType;
import com.cinema.movie_booking.entity.Theater;
import com.cinema.movie_booking.mapper.TheaterMapper;
import com.cinema.movie_booking.repository.CinemaRepository;
import com.cinema.movie_booking.repository.SeatRepository;
import com.cinema.movie_booking.repository.SeatTypeRepository;
import com.cinema.movie_booking.repository.TheaterRepository;
import com.cinema.movie_booking.service.TheaterService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@AllArgsConstructor
public class TheaterServiceImpl implements TheaterService {

    private final TheaterRepository theaterRepository;
    private final CinemaRepository cinemaRepository;
    private final SeatRepository seatRepository;
    private final SeatTypeRepository seatTypeRepository;

    /**
     * Create a new theater and auto-generate seats.
     * The entire operation runs in a single transaction.
     */
    @Override
    @Transactional
    public TheaterResponseDTO create(TheaterRequestDTO request) {
        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new RuntimeException("Cinema not found with id: " + request.getCinemaId()));

        Theater theater = TheaterMapper.toEntity(request, cinema);
        theater = theaterRepository.save(theater);

        // Flush to ensure theater_id is assigned before generating seats
        theaterRepository.flush();

        generateSeats(theater, request.getRowsCount(), request.getSeatsPerRow());

        return TheaterMapper.toDTO(theater);
    }

    /**
     * Generate seats for a theater.
     *
     * Design:
     *  - seat_code is unique per theater (not globally), enforced by DB composite unique (theater_id, seat_code)
     *  - Idempotency guard: if theater already has seats, skip generation entirely
     *  - In-memory deduplication via HashSet<seatCode> before DB insert
     *  - Defensive DB check per seat via existsByTheater_TheaterIdAndSeatCode to avoid race conditions
     *  - All seats saved in a single saveAll() call within the parent transaction
     *
     * Example (rowsCount=3, seatsPerRow=4):
     *   A1 A2 A3 A4
     *   B1 B2 B3 B4
     *   C1 C2 C3 C4
     */
    private void generateSeats(Theater theater, Integer rowsCount, Integer seatsPerRow) {
        // 1. Validate input
        if (rowsCount == null || seatsPerRow == null || rowsCount <= 0 || seatsPerRow <= 0) {
            log.warn("generateSeats skipped: invalid rowsCount={} or seatsPerRow={} for theaterId={}",
                    rowsCount, seatsPerRow, theater.getTheaterId());
            return;
        }

        // 2. Idempotency guard: skip if theater already has seats
        if (seatRepository.existsByTheater_TheaterId(theater.getTheaterId())) {
            log.warn("generateSeats skipped: theater {} already has seats. Possible duplicate call.",
                    theater.getTheaterId());
            return;
        }

        // 3. Resolve or create default SeatType
        SeatType defaultSeatType = seatTypeRepository.findByName("STANDARD")
                .orElseGet(() -> {
                    SeatType standardType = SeatType.builder()
                            .name("STANDARD")
                            .description("Standard seat")
                            .priceMultiplier(1.0)
                            .build();
                    return seatTypeRepository.save(standardType);
                });

        // 4. Build seat list with in-memory deduplication
        List<Seat> seats = new ArrayList<>();
        Set<String> seenCodes = new HashSet<>();

        for (int row = 0; row < rowsCount; row++) {
            String seatRow = String.valueOf((char) ('A' + row)); // A, B, C...

            for (int seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
                String seatCode = seatRow + seatNum; // A1, A2, B1...

                // 4a. In-memory dedup
                if (!seenCodes.add(seatCode)) {
                    log.warn("generateSeats: duplicate seatCode '{}' detected in-memory for theaterId={}, skipping.",
                            seatCode, theater.getTheaterId());
                    continue;
                }

                // 4b. Defensive DB check (guards against concurrent inserts / dirty state)
                if (seatRepository.existsByTheater_TheaterIdAndSeatCode(theater.getTheaterId(), seatCode)) {
                    log.warn("generateSeats: seatCode '{}' already exists in DB for theaterId={}, skipping.",
                            seatCode, theater.getTheaterId());
                    continue;
                }

                Seat seat = Seat.builder()
                        .seatRow(seatRow)
                        .seatNumber(seatNum)
                        .seatCode(seatCode)
                        .theater(theater)
                        .seatType(defaultSeatType)
                        .isAvailable(true)
                        .isCoupleSeat(false)
                        .build();

                seats.add(seat);
            }
        }

        // 5. Persist all seats in a single batch
        if (!seats.isEmpty()) {
            seatRepository.saveAll(seats);
            log.info("generateSeats: saved {} seats for theaterId={}", seats.size(), theater.getTheaterId());
        } else {
            log.warn("generateSeats: no seats to save for theaterId={}", theater.getTheaterId());
        }
    }

    @Override
    public void delete(Long id) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Theater not found with id: " + id));
        theater.setIsActive(false);
        theaterRepository.save(theater);
    }

    @Override
    public Page<TheaterResponseDTO> getAll(Pageable pageable) {
        Page<Theater> theaters = theaterRepository.findAll(pageable);
        return theaters.map(TheaterMapper::toDTO);
    }

    @Override
    public TheaterResponseDTO getById(Long id) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chiếu với id: " + id));
        return TheaterMapper.toDTO(theater);
    }

    @Override
    public TheaterResponseDTO restore(Long id) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chiếu với id: " + id));
        theater.setIsActive(true);
        theaterRepository.save(theater);
        return TheaterMapper.toDTO(theater);
    }

    @Override
    public TheaterResponseDTO update(Long id, TheaterRequestDTO request) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chiếu với id: " + id));
        theater.setName(request.getName());
        theater.setRowsCount(request.getRowsCount());
        theater.setTotalSeats(request.getRowsCount() * request.getSeatsPerRow());
        theater.setSeatsPerRow(request.getSeatsPerRow());
        theater.setTheaterType(request.getTheaterType());
        theater = theaterRepository.save(theater);
        return TheaterMapper.toDTO(theater);
    }

    @Override
    public Page<TheaterResponseDTO> getByIsActiveTrue(Pageable pageable) {
        Page<Theater> theaters = theaterRepository.findByIsActiveTrue(pageable);
        return theaters.map(TheaterMapper::toDTO);
    }
}

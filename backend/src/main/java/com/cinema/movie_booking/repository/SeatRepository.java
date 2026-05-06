package com.cinema.movie_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cinema.movie_booking.entity.Seat;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    /**
     * Find all seats by theater ID
     */
    List<Seat> findByTheater_TheaterId(Long theaterId);

    /**
     * Find seat by theater ID and seat code
     */
    Optional<Seat> findByTheater_TheaterIdAndSeatCode(Long theaterId, String seatCode);

    /**
     * Find seat by seat code
     */
    Optional<Seat> findBySeatCode(String seatCode);

    /**
     * Check if seat exists in a specific theater
     */
    boolean existsByTheater_TheaterIdAndSeatCode(Long theaterId, String seatCode);

    /**
     * Check if a theater already has any seats generated (idempotency guard)
     */
    boolean existsByTheater_TheaterId(Long theaterId);

    /**
     * Find all seats by seat type
     */
    List<Seat> findBySeatType_SeatTypeId(Long seatTypeId);

    /**
     * Find all active seats in a theater
     */
    List<Seat> findByTheater_TheaterIdAndIsAvailableTrue(Long theaterId);

    /**
     * Check if a seat belongs to a theater
     */
    boolean existsByTheater_TheaterIdAndSeatId(Long theaterId, Long seatId);

    /**
     * Lock seats for update
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.seatId IN :seatIds")
    List<Seat> findAllByIdForUpdate(@Param("seatIds") List<Long> seatIds);
}

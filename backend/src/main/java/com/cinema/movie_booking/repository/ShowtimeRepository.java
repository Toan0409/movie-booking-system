package com.cinema.movie_booking.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cinema.movie_booking.entity.Showtime;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

        // Find showtimes by movie ID
        Page<Showtime> findByMovieMovieId(Long movieId, Pageable pageable);

        // Find showtimes by movie ID and active
        List<Showtime> findByMovieMovieIdAndIsActiveTrue(Long movieId);

        // Find showtimes by theater ID
        Page<Showtime> findByTheaterTheaterId(Long theaterId, Pageable pageable);

        // Find showtimes by theater ID and active
        List<Showtime> findByTheaterTheaterIdAndIsActiveTrue(Long theaterId);

        // Find showtimes by date range (using startTime)
        @Query("SELECT s FROM Showtime s WHERE s.startTime >= :startDate AND s.startTime < :endDate")
        Page<Showtime> findByStartTimeBetween(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        Pageable pageable);

        // Find active showtimes by date (using startTime)
        @Query("SELECT s FROM Showtime s WHERE s.isActive = true AND s.startTime >= :startDate AND s.startTime < :endDate")
        List<Showtime> findActiveShowtimesByDate(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        // Find overlapping showtimes in the same theater
        @Query("SELECT s FROM Showtime s WHERE s.theater.theaterId = :theaterId " +
                        "AND s.isActive = true " +
                        "AND ((s.startTime < :endTime AND s.endTime > :startTime))")
        List<Showtime> findOverlappingShowtimes(
                        @Param("theaterId") Long theaterId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        // Find overlapping showtimes excluding a specific showtime (for updates)
        @Query("SELECT s FROM Showtime s WHERE s.theater.theaterId = :theaterId " +
                        "AND s.isActive = true " +
                        "AND s.showtimeId != :excludeShowtimeId " +
                        "AND ((s.startTime < :endTime AND s.endTime > :startTime))")
        List<Showtime> findOverlappingShowtimesExcluding(
                        @Param("theaterId") Long theaterId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime,
                        @Param("excludeShowtimeId") Long excludeShowtimeId);

        // Find showtimes by movie and date (using startTime)
        @Query("SELECT s FROM Showtime s WHERE s.movie.movieId = :movieId " +
                        "AND s.isActive = true " +
                        "AND s.startTime >= :startDate AND s.startTime < :endDate")
        List<Showtime> findByMovieAndDate(
                        @Param("movieId") Long movieId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        // Find all active showtimes
        Page<Showtime> findByIsActiveTrue(Pageable pageable);
}

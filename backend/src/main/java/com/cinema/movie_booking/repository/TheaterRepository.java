package com.cinema.movie_booking.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cinema.movie_booking.entity.Theater;

@Repository
public interface TheaterRepository extends JpaRepository<Theater, Long> {
    Page<Theater> findByCinema_CinemaId(Long cinemaId, Pageable pageable);

    Page<Theater> findByTheaterType(String theaterType, Pageable pageable);

    Page<Theater> findByIsActiveTrue(Pageable pageable);
}

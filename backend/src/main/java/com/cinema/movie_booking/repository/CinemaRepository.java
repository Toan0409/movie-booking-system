package com.cinema.movie_booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinema.movie_booking.entity.Cinema;

public interface CinemaRepository extends JpaRepository<Cinema, Long> {
    List<Cinema> findByNameContainingIgnoreCase(String keyword);

    boolean existsByName(String name);

    List<Cinema> findByCityContainingIgnoreCase(String city);

    List<Cinema> findByIsActiveTrue();
}

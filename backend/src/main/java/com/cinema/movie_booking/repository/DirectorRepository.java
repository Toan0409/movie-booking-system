package com.cinema.movie_booking.repository;

import com.cinema.movie_booking.entity.Director;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DirectorRepository extends JpaRepository<Director, Long> {
    boolean existsByName(String name);

    Page<Director> findByNameContainingIgnoreCase(String keyword, Pageable pageable);

    // Used by DataSeeder to find director by exact name
    Optional<Director> findByName(String name);
}

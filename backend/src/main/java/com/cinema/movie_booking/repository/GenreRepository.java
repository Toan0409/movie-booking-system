package com.cinema.movie_booking.repository;

import com.cinema.movie_booking.entity.Genre;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GenreRepository extends JpaRepository<Genre, Long> {
    boolean existsByNameIgnoreCaseAndIsDeletedFalse(String name);

    Optional<Genre> findByGenreIdAndIsDeletedFalse(Long id);

    Page<Genre> findByIsDeletedFalse(Pageable pageable);

    Page<Genre> findByNameContainingIgnoreCaseAndIsDeletedFalse(String keyword, Pageable pageable);

    Optional<Genre> findByGenreIdAndIsDeletedTrue(Long id);

    // Used by DataSeeder to find genre by name (case-insensitive)
    Optional<Genre> findByNameIgnoreCase(String name);
}

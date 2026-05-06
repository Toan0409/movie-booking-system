package com.cinema.movie_booking.repository;

import com.cinema.movie_booking.entity.Actor;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActorRepository extends JpaRepository<Actor, Long> {
    Optional<Actor> findByName(String name);

    boolean existsByName(String name);

    Page<Actor> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
}

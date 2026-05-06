package com.cinema.movie_booking.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.cinema.movie_booking.dto.actor.ActorRequestDTO;
import com.cinema.movie_booking.dto.actor.ActorResponseDTO;

public interface ActorService {
    ActorResponseDTO createActor(ActorRequestDTO actorRequestDTO);

    ActorResponseDTO getActorById(Long id);

    Page<ActorResponseDTO> getAllActors(String keyword, Pageable pageable);

    ActorResponseDTO updateActor(Long id, ActorRequestDTO actorRequestDTO);

    void deleteActor(Long id);
}

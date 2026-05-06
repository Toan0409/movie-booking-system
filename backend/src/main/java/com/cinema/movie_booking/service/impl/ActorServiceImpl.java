package com.cinema.movie_booking.service.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.cinema.movie_booking.dto.actor.ActorRequestDTO;
import com.cinema.movie_booking.dto.actor.ActorResponseDTO;
import com.cinema.movie_booking.entity.Actor;
import com.cinema.movie_booking.mapper.ActorMapper;
import com.cinema.movie_booking.repository.ActorRepository;
import com.cinema.movie_booking.service.ActorService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ActorServiceImpl implements ActorService {
    private final ActorRepository actorRepository;

    @Override
    public ActorResponseDTO createActor(ActorRequestDTO actorRequestDTO) {
        String name = actorRequestDTO.getName();
        if (actorRepository.existsByName(name)) {
            throw new IllegalArgumentException("Ten dien vien da ton tai");
        }
        Actor actor = ActorMapper.toEntity(actorRequestDTO);
        return ActorMapper.toDTO(actorRepository.save(actor));
    }

    @Override
    public void deleteActor(Long id) {
        Actor actor = actorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay dien vien"));
        actorRepository.delete(actor);
    }

    @Override
    public ActorResponseDTO getActorById(Long id) {
        Actor actor = actorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay dien vien"));
        return ActorMapper.toDTO(actor);
    }

    @Override
    public Page<ActorResponseDTO> getAllActors(String keyword, Pageable pageable) {
        Page<Actor> page;
        if (keyword != null && !keyword.isBlank()) {
            page = actorRepository.findByNameContainingIgnoreCase(keyword, pageable);
        } else {
            page = actorRepository.findAll(pageable);
        }
        return page.map(ActorMapper::toDTO);
    }

    @Override
    public ActorResponseDTO updateActor(Long id, ActorRequestDTO actorRequestDTO) {
        Actor actor = actorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay dien vien"));
        String newName = actorRequestDTO.getName();
        if (!actor.getName().equalsIgnoreCase(newName) && actorRepository.existsByName(newName)) {
            throw new IllegalArgumentException("Ten dien vien da ton tai");
        }
        actor.setName(newName);
        actor.setBirthDate(actorRequestDTO.getBirthDate());
        actor.setBiography(actorRequestDTO.getBiography());
        actor.setNationality(actorRequestDTO.getNationality());
        actor.setImageUrl(actorRequestDTO.getImageUrl());
        return ActorMapper.toDTO(actorRepository.save(actor));
    }

}

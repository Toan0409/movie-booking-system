package com.cinema.movie_booking.mapper;

import com.cinema.movie_booking.dto.actor.ActorRequestDTO;
import com.cinema.movie_booking.dto.actor.ActorResponseDTO;
import com.cinema.movie_booking.entity.Actor;

public class ActorMapper {
    public static Actor toEntity(ActorRequestDTO actorRequestDTO) {
        return Actor.builder()
                .name(actorRequestDTO.getName())
                .biography(actorRequestDTO.getBiography())
                .birthDate(actorRequestDTO.getBirthDate())
                .nationality(actorRequestDTO.getNationality())
                .imageUrl(actorRequestDTO.getImageUrl())
                .build();
    }

    public static ActorResponseDTO toDTO(Actor actor) {
        return ActorResponseDTO.builder()
                .id(actor.getActorId())
                .name(actor.getName())
                .biography(actor.getBiography())
                .birthDate(actor.getBirthDate())
                .nationality(actor.getNationality())
                .imageUrl(actor.getImageUrl())
                .build();
    }
}

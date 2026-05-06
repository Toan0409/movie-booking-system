package com.cinema.movie_booking.dto.actor;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ActorResponseDTO {
    private Long id;
    private String name;
    private String biography;
    private LocalDate birthDate;
    private String nationality;
    private String imageUrl;

}

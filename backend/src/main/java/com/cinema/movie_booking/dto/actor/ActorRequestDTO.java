package com.cinema.movie_booking.dto.actor;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ActorRequestDTO {
    @NotBlank(message = "Ten diễn viên không được để trống")
    private String name;

    private String biography;

    @JsonAlias({ "birthDate", "dateOfBirth", "birth_date" })
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;
    private String nationality;
    private String imageUrl;
}

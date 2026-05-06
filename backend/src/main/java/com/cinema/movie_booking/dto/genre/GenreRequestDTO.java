package com.cinema.movie_booking.dto.genre;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GenreRequestDTO {

    @NotBlank(message = "Tên thể loại không được để trống")
    @Size(max = 50, message = "Tên tối đa 50 ký tự")
    private String name;

    @Size(max = 255)
    private String description;
}

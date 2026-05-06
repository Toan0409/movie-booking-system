package com.cinema.movie_booking.dto.chatbot;

import com.cinema.movie_booking.dto.chatbot.ChatMessageDTO;
import com.cinema.movie_booking.dto.movie.MovieResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponseDTO {
    private List<MovieResponseDTO> movies;
    private String message;
    private List<ChatMessageDTO> history;
}

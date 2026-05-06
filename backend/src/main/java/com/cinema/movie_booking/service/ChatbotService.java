package com.cinema.movie_booking.service;

import com.cinema.movie_booking.dto.chatbot.ChatRequestDTO;
import com.cinema.movie_booking.dto.chatbot.ChatResponseDTO;
import org.springframework.data.domain.Pageable;

public interface ChatbotService {
    ChatResponseDTO chat(ChatRequestDTO request, Long userId, Pageable pageable);
}

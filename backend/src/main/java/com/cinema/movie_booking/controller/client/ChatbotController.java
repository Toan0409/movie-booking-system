package com.cinema.movie_booking.controller.client;

import com.cinema.movie_booking.dto.api.ApiResponse;
import com.cinema.movie_booking.dto.chatbot.ChatRequestDTO;
import com.cinema.movie_booking.dto.chatbot.ChatResponseDTO;
import com.cinema.movie_booking.entity.User;
import com.cinema.movie_booking.exception.UnauthorizedException;
import com.cinema.movie_booking.repository.UserRepository;
import com.cinema.movie_booking.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final UserRepository userRepository;

    @PostMapping("/chat")

    public ResponseEntity<ApiResponse<ChatResponseDTO>> chat(
            @RequestBody ChatRequestDTO request,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedException("Bạn cần đăng nhập để sử dụng chatbot");
        }

        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseGet(() -> userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() -> new UnauthorizedException("Không xác định được người dùng hiện tại")));

        ChatResponseDTO response = chatbotService.chat(request, currentUser.getUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Chatbot trả lời thành công"));
    }
}

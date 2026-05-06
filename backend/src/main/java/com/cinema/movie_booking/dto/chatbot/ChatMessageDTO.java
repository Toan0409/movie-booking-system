package com.cinema.movie_booking.dto.chatbot;

import com.cinema.movie_booking.entity.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    
    private Long id;
    private String role;
    private String message;
    private String formattedTime;
    
    public static ChatMessageDTO fromEntity(ChatMessage entity) {
        return ChatMessageDTO.builder()
                .id(entity.getId())
                .role(entity.getRole().name())
                .message(entity.getMessage())
                .formattedTime(entity.getCreatedAt()
                    .format(DateTimeFormatter.ofPattern("HH:mm dd/MM")))
                .build();
    }
}

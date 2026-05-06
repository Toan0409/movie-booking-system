package com.cinema.movie_booking.service.impl;

import com.cinema.movie_booking.dto.chatbot.ChatMessageDTO;
import com.cinema.movie_booking.dto.chatbot.ChatRequestDTO;
import com.cinema.movie_booking.dto.chatbot.ChatResponseDTO;
import com.cinema.movie_booking.dto.movie.MovieResponseDTO;
import com.cinema.movie_booking.entity.ChatMessage;
import com.cinema.movie_booking.entity.Movie;
import com.cinema.movie_booking.mapper.MovieMapper;
import com.cinema.movie_booking.repository.ChatMessageRepository;
import com.cinema.movie_booking.repository.MovieRepository;
import com.cinema.movie_booking.service.ChatbotService;
import com.cinema.movie_booking.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

    private final MovieRepository movieRepository;
    private final MovieMapper movieMapper;
    private final GeminiService geminiService;
    private final ChatMessageRepository chatMessageRepository;

    @Override
    public ChatResponseDTO chat(ChatRequestDTO request, Long userId, Pageable pageable) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required for chat history");
        }

        List<ChatMessageDTO> existingHistory = chatMessageRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .getContent()
                .stream()
                .map(ChatMessageDTO::fromEntity)
                .collect(Collectors.toList());

        String rawMessage = request != null && request.getMessage() != null ? request.getMessage() : "";
        String message = rawMessage.toLowerCase(Locale.ROOT).trim();

        if (message.isBlank()) {
            return ChatResponseDTO.builder()
                    .movies(List.of())
                    .message("Tin nhắn không được để trống.")
                    .history(existingHistory)
                    .build();
        }

        chatMessageRepository.save(ChatMessage.builder()
                .userId(userId)
                .role(ChatMessage.MessageRole.USER)
                .message(rawMessage)
                .build());

        ChatResponseDTO botResponse = buildBotResponse(message, pageable);

        chatMessageRepository.save(ChatMessage.builder()
                .userId(userId)
                .role(ChatMessage.MessageRole.BOT)
                .message(botResponse.getMessage())
                .build());

        List<ChatMessageDTO> updatedHistory = chatMessageRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .getContent()
                .stream()
                .map(ChatMessageDTO::fromEntity)
                .collect(Collectors.toList());

        return ChatResponseDTO.builder()
                .movies(botResponse.getMovies())
                .message(botResponse.getMessage())
                .history(updatedHistory)
                .build();
    }

    private ChatResponseDTO buildBotResponse(String message, Pageable pageable) {
        List<Movie> movies;
        String botMessage;

        if (containsAny(message, "hành động", "action", "hanh dong")) {
            movies = recommendByGenre("action");
            botMessage = "Đây là các phim hành động hay dành cho bạn:";
        } else if (containsAny(message, "tình cảm", "romance", "lang man", "lãng mạn")) {
            movies = recommendByGenre("romance");
            botMessage = "Đây là các phim tình cảm đang chiếu:";
        } else if (containsAny(message, "tối nay", "hôm nay", "toi nay", "hom nay")) {
            movies = recommendTonight();
            botMessage = "Các phim phù hợp để xem tối nay:";
        } else if (containsAny(message, "gia đình", "family", "tre em", "trẻ em")) {
            movies = recommendFamily();
            botMessage = "Gợi ý phim phù hợp đi cùng gia đình:";
        } else if (containsAny(message, "kinh dị", "horror")) {
            movies = recommendByGenre("horror");
            botMessage = containsAny(message, "top")
                    ? "Top phim kinh dị nổi bật:"
                    : "Các phim kinh dị bạn có thể quan tâm:";
        } else if (containsAny(message, "top")) {
            movies = recommendTop();
            botMessage = "Top phim nổi bật hiện tại:";
        } else {
            return politeFallback(message);
        }

        List<MovieResponseDTO> responseMovies = movies.stream()
                .limit(resolveLimit(pageable))
                .map(movieMapper::toResponseDTO)
                .collect(Collectors.toList());

        if (responseMovies.isEmpty()) {
            return ChatResponseDTO.builder()
                    .movies(List.of())
                    .message("Hiện chưa có phim phù hợp với yêu cầu của bạn. Bạn thử thể loại khác nhé!")
                    .build();
        }

        return ChatResponseDTO.builder()
                .movies(responseMovies)
                .message(botMessage)
                .build();
    }

    private List<Movie> recommendByGenre(String genreKeyword) {
        return movieRepository.findByIsDeletedFalse().stream()
                .filter(m -> Boolean.TRUE.equals(m.getIsNowShowing()))
                .filter(m -> m.getGenre() != null && m.getGenre().getName() != null)
                .filter(m -> m.getGenre().getName().toLowerCase(Locale.ROOT).contains(genreKeyword))
                .sorted(byRatingDescThenReleaseDateDesc())
                .collect(Collectors.toList());
    }

    private List<Movie> recommendTonight() {
        return movieRepository.findByIsNowShowingTrueAndIsDeletedFalse().stream()
                .sorted(byRatingDescThenReleaseDateDesc())
                .collect(Collectors.toList());
    }

    private List<Movie> recommendFamily() {
        return movieRepository.findByIsDeletedFalse().stream()
                .filter(m -> Boolean.TRUE.equals(m.getIsNowShowing()))
                .filter(m -> {
                    String age = m.getAgeRating() == null ? "" : m.getAgeRating().toUpperCase(Locale.ROOT);
                    return age.equals("G") || age.equals("PG") || age.equals("P");
                })
                .sorted(byRatingDescThenReleaseDateDesc())
                .collect(Collectors.toList());
    }

    private List<Movie> recommendTop() {
        return movieRepository.findByIsNowShowingTrueAndIsDeletedFalse().stream()
                .sorted(byRatingDescThenReleaseDateDesc())
                .collect(Collectors.toList());
    }

    private Comparator<Movie> byRatingDescThenReleaseDateDesc() {
        return Comparator
                .comparing((Movie m) -> m.getRating() == null ? 0.0 : m.getRating(), Comparator.reverseOrder())
                .thenComparing(
                        m -> m.getReleaseDate() == null ? LocalDate.MIN : m.getReleaseDate(),
                        Comparator.reverseOrder());
    }

    private boolean containsAny(String text, String... keywords) {
        return Arrays.stream(keywords).anyMatch(text::contains);
    }

    private int resolveLimit(Pageable pageable) {
        if (pageable == null) {
            return 5;
        }
        int size = pageable.getPageSize();
        if (size <= 0) {
            return 5;
        }
        return Math.min(size, 10);
    }

    private ChatResponseDTO politeFallback(String message) {
        List<Movie> nowShowingMovies = movieRepository.findByIsNowShowingTrueAndIsDeletedFalse();
        String movieContext = buildMovieContext(nowShowingMovies);
        String aiResponse;

        try {
            aiResponse = geminiService.generateResponse(message, movieContext);
        } catch (Exception e) {
            log.error("Gemini API error: {}", e.getMessage());
            aiResponse = "Xin lỗi, tôi gặp lỗi kỹ thuật. Hãy thử hỏi về thể loại phim cụ thể (hành động, tình cảm, kinh dị, gia đình, tối nay, top phim) nhé! 😊";
        }

        return ChatResponseDTO.builder()
                .movies(List.of())
                .message(aiResponse)
                .build();
    }

    private String buildMovieContext(List<Movie> movies) {
        if (movies.isEmpty()) {
            return "Không có phim nào đang chiếu.";
        }

        return movies.stream()
                .limit(20)
                .map(movie -> {
                    String genreName = movie.getGenre() != null ? movie.getGenre().getName() : "Không xác định";
                    String status = Boolean.TRUE.equals(movie.getIsNowShowing()) ? "Đang chiếu" : "Sắp chiếu";
                    return String.format("- %s (Thể loại: %s, Rating: %.1f, %s)",
                            movie.getTitle(), genreName,
                            movie.getRating() != null ? movie.getRating() : 0.0,
                            status);
                })
                .collect(Collectors.joining("\n"));
    }
}

package com.cinema.movie_booking.service.impl;

import com.cinema.movie_booking.service.GeminiService;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiServiceImpl implements GeminiService {

        @Value("${gemini.api.key}")
        private String apiKey;

        private static final String MODEL = "gemini-3-flash-preview";

        @Override
        public String generateResponse(String userQuery, String movieContext) {

                try {
                        String prompt = buildPrompt(userQuery, movieContext);

                        Client client = Client.builder()
                                        .apiKey(apiKey)
                                        .build();

                        GenerateContentResponse response = client.models.generateContent(
                                        MODEL,
                                        prompt,
                                        null);

                        String result = response.text();

                        if (result == null || result.isBlank()) {
                                return "Xin lỗi, hiện chưa có phản hồi phù hợp.";
                        }

                        return result.trim();

                } catch (Exception e) {
                        log.error("Gemini API error", e);
                        return "Xin lỗi, hệ thống AI đang bận. Bạn thử lại sau nhé 😊";
                }
        }

        private String buildPrompt(String userQuery, String movieContext) {
                return """
                                Bạn là chatbot tư vấn phim cho website đặt vé rạp chiếu phim.

                                Nhiệm vụ:
                                - Trả lời bằng tiếng Việt tự nhiên
                                - Thân thiện, ngắn gọn, hấp dẫn
                                - Chỉ gợi ý phim trong danh sách bên dưới
                                - Nếu không phù hợp thì xin lỗi lịch sự

                                DANH SÁCH PHIM:
                                %s

                                KHÁCH HỎI:
                                %s

                                TRẢ LỜI:
                                """.formatted(movieContext, userQuery);
        }
}
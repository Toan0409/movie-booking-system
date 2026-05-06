package com.cinema.movie_booking.service;

public interface GeminiService {
    String generateResponse(String userQuery, String movieContext);
}
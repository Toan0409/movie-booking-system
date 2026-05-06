package com.cinema.movie_booking.repository;

import com.cinema.movie_booking.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Page<ChatMessage> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}

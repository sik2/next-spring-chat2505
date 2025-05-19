package com.ll.chatApp.domain.chat.chatMessage.repository;

import com.ll.chatApp.domain.chat.chatMessage.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomId(Long chatRoomId);
    List<ChatMessage> findByChatRoomIdAndIdGreaterThan(Long chatRoomId, Long afterChatMessageId);
}
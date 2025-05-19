package com.ll.chatApp.domain.chat.chatMessage.service;

import com.ll.chatApp.domain.chat.chatMessage.dto.ChatMessageRequest;
import com.ll.chatApp.domain.chat.chatMessage.entity.ChatMessage;
import com.ll.chatApp.domain.chat.chatMessage.repository.ChatMessageRepository;
import com.ll.chatApp.domain.chat.chatRoom.entity.ChatRoom;
import com.ll.chatApp.domain.chat.chatRoom.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;

    public List<ChatMessage> getList(Long roomId, long afterChatMessageId) {
        if (afterChatMessageId == -1) {
            return chatMessageRepository.findByChatRoomId(roomId);
        }
        return chatMessageRepository.findByChatRoomIdAndIdGreaterThan(roomId, afterChatMessageId);
    }

    public ChatMessage save(Long roomId, ChatMessageRequest chatMessageRequest) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElse(null);
        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .writerName(chatMessageRequest.getWriterName())
                .content(chatMessageRequest.getContent())
                .build();

        return chatMessageRepository.save(chatMessage);
    }
}
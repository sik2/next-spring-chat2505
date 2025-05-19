package com.ll.chatApp.domain.chat.chatMessage.dto;

import com.ll.chatApp.domain.chat.chatMessage.entity.ChatMessage;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
public class ChatMessageResponse {
    private final Long id;
    private final String writerName;
    private final String content;
    private final String createDate;

    public ChatMessageResponse(ChatMessage chatMessage) {
        this.id = chatMessage.getId();
        this.writerName = chatMessage.getWriterName();
        this.content = chatMessage.getContent();

        // 프론트엔드의 dateForPrint 함수에 맞춰 날짜 포맷 변경
        this.createDate = chatMessage.getCreateDate()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
    }
}
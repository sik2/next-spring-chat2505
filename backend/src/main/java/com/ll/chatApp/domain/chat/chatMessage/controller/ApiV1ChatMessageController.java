package com.ll.chatApp.domain.chat.chatMessage.controller;

import com.ll.chatApp.domain.chat.chatMessage.dto.ChatMessageRequest;
import com.ll.chatApp.domain.chat.chatMessage.dto.ChatMessageResponse;
import com.ll.chatApp.domain.chat.chatMessage.entity.ChatMessage;
import com.ll.chatApp.domain.chat.chatMessage.service.ChatMessageService;
import com.ll.chatApp.domain.chat.chatRoom.entity.ChatRoom;
import com.ll.chatApp.domain.chat.chatRoom.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/chat/rooms/{roomId}/messages")
@RequiredArgsConstructor
public class ApiV1ChatMessageController {

    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;


    @GetMapping
    public List<ChatMessageResponse> showMessages(
            @PathVariable("roomId") Long roomId,
            @RequestParam(value = "afterChatMessageId", defaultValue = "-1") long afterChatMessageId
    ) {

        ChatRoom chatRoom = chatRoomService.findById(roomId);
        List<ChatMessageResponse> chatMessageResponseList = chatMessageService.getList(roomId, afterChatMessageId).stream()
                .map(ChatMessageResponse::new)
                .collect(Collectors.toList());

        return chatMessageResponseList;
    }

    @PostMapping
    public String sendMessage(
            @PathVariable("roomId") Long roomId,
            @RequestBody ChatMessageRequest chatMessageRequest
    ){

        ChatMessage chatMessage = chatMessageService.save(roomId, chatMessageRequest);

        ChatMessageResponse chatMessageResponse = new ChatMessageResponse(chatMessage);

        // WebSocket으로 메시지 브로드캐스트
        messagingTemplate.convertAndSend("/topic/chat/room/" + roomId, chatMessageResponse);

        return roomId + "번 채팅방 메시지 생성완료";
    }
}

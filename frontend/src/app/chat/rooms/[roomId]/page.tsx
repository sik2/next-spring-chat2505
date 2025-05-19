"use client";

import { ChatMessage, ChatRoom } from "@/types/chat";
import { Client, IMessage } from "@stomp/stompjs";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  const roomIdNum = parseInt(roomId);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [writerName, setWriterName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log(str); // 디버깅을 위해 WebSocket 로그 추가
      },
    });

    client.onConnect = () => {
      console.log("WebSocket 연결됨"); // 연결 상태 확인용
      client.subscribe(`/topic/chat/room/${roomIdNum}`, (message: IMessage) => {
        console.log("메시지 수신:", message.body); // 수신된 메시지 확인
        try {
          const chatMessage = JSON.parse(message.body);
          if (!chatMessage || !chatMessage.id) {
            console.error("잘못된 메시지 형식:", chatMessage);
            return;
          }

          setMessages((prev) => [
            ...prev,
            {
              writerName: chatMessage.writerName,
              content: chatMessage.content,
            },
          ]);
        } catch (err) {
          console.error("메시지 처리 실패:", err, "원본 메시지:", message.body);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP 에러:", frame);
    };

    stompClient.current = client;
    client.activate();

    loadRoom();
    loadMessages();

    return () => {
      if (client.connected) {
        client.deactivate();
      }
    };
  }, [roomIdNum]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadRoom = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat/rooms/${roomIdNum}`
      );
      const data = await response.json();
      setRoom(data);
    } catch (err) {
      console.error("채팅방 정보 로드 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat/rooms/${roomIdNum}/messages`
      );
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("메시지 로드 실패");
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newMessage.trim() ||
      !writerName.trim() ||
      !stompClient.current?.connected
    ) {
      alert("작성자와 메시지를 모두 입력해주세요.");
      return;
    }

    try {
      // 메시지 전송 전 상태 확인
      console.log("메시지 전송 시도:", {
        writerName,
        content: newMessage,
        connected: stompClient.current.connected,
      });

      // REST API로 메시지 전송
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat/rooms/${roomIdNum}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            writerName,
            content: newMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("메시지 전송 실패");
      }

      // 메시지 전송 성공 후 입력 필드 초기화
      setNewMessage("");
    } catch (err) {
      console.error("메시지 전송 실패:", err);
      alert("메시지 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        로딩 중...
      </div>
    );
  }

  if (!room) {
    return <div className="text-center p-4">채팅방을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{room.name}</h1>
        <button
          onClick={() => router.push("/chat/rooms")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          목록으로
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 border rounded p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div key={`${message.writerName}-${index}`} className="mb-4">
            <div className="flex items-start gap-2">
              <div className="font-semibold text-sm">{message.writerName}</div>
            </div>
            <div className="mt-1 p-2 bg-white rounded shadow-sm">
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={writerName}
            onChange={(e) => setWriterName(e.target.value)}
            placeholder="작성자 이름"
            className="w-32 p-2 border rounded"
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
}

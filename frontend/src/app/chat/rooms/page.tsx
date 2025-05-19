"use client";

import { ChatRoom } from "@/types/chat";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChatRoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat/rooms`
      );
      const data = await response.json();
      setRooms(data);
      setError(null);
    } catch (err) {
      console.error("채팅방 목록 로드 실패:", err);
      setError("채팅방 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat/rooms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newRoomName }),
        }
      );
      const newRoom = await response.json();
      setRooms([...rooms, newRoom]);
      setNewRoomName("");
      setError(null);
    } catch (err) {
      console.error("채팅방 생성 실패:", err);
      setError("채팅방 생성에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">채팅방 목록</h1>

      <form onSubmit={handleCreateRoom} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="새로운 채팅방 이름"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            생성
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="space-y-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => router.push(`/chat/rooms/${room.id}`)}
            className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
          >
            <h2 className="text-lg font-semibold">{room.name}</h2>
            <p className="text-sm text-gray-500">
              생성일: {new Date(room.createDate).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

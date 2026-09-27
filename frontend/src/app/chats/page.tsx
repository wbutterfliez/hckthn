"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

interface ChatPreview {
  matchId: string;
  matchName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: "pending" | "accepted" | "rejected" | "completed";
}

export default function ChatsPage() {
  const { token, loadFromStorage } = useAuthStore();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      if (!token) return;

      try {
        const data = await api("/users/chats", "GET", null, token);
        setChats(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#221512] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#72463B] border-t-[#D9C4B9] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#221512]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#D9C4B9] mb-6">
          Messages
        </h1>

        {chats.length === 0 ? (
          <div className="text-center py-16 bg-[#72463B]/30 rounded-xl border border-[#B49E94]/20">
            <p className="text-[#B49E94] text-lg">No messages yet</p>
            <p className="text-sm text-[#B49E94]/70 mt-1">
              Start a conversation from your dashboard
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <Link
                key={chat.matchId}
                href={`/chat/${chat.matchId}`}
                className="block bg-[#72463B] p-4 rounded-xl hover:bg-[#8B5A4A] transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-[#D9C4B9] font-semibold">
                      {chat.matchName}
                    </h3>
                    <p className="text-sm text-[#B49E94] truncate">
                      {chat.lastMessage}
                    </p>

                    <p className="text-xs text-[#B49E94] mt-1">
                      {chat.status === "accepted"
                        ? "Active exchange"
                        : chat.status === "completed"
                        ? "Completed"
                        : chat.status === "pending"
                        ? "Pending request"
                        : "Rejected"}
                    </p>
                  </div>

                  <div className="text-right text-xs text-[#B49E94]">
                    {new Date(chat.lastMessageTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
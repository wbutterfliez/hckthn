"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import Link from "next/link";

export default function Chat() {
  const params = useParams();
  const matchId = params?.matchId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [matchName, setMatchName] = useState("");

  // Load match name
  useEffect(() => {
    const loadMatchInfo = async () => {
      if (!token || !matchId) return;
      try {
        const data = await api(`/match/${matchId}`, "GET", null, token);
        setMatchName(data.matchName || "Chat");
      } catch (error) {
        console.error("Failed to load match info:", error);
      }
    };
    loadMatchInfo();
  }, [matchId, token]);

  // Load old messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!token || !matchId) return;
      try {
        const data = await api(`/match/messages/${matchId}`, "GET", null, token);
        if (Array.isArray(data)) {
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };
    loadMessages();
  }, [matchId, token]);

  // Connect + Join
  useEffect(() => {
    if (!matchId) return;

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setConnected(true);
      socket.emit("join_room", matchId);
    };

    socket.on("connect", onConnect);

    return () => {
      socket.emit("leave_room", matchId);
      socket.off("connect", onConnect);
    };
  }, [matchId]);

  // Receive messages
  useEffect(() => {
    const handleMessage = (data: any) => {
      if (data.matchId === matchId) {
        setMessages((prev) => {
          const exists = prev.find((m) => m._id === data._id);
          if (exists) return prev;
          return [...prev, data];
        });
      }
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, [matchId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const send = () => {
    if (!msg.trim() || !connected) return;

    socket.emit("send_message", {
      matchId,
      content: msg,
      senderId: user?._id,
    });

    setMsg("");
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="h-screen bg-[#221512] flex flex-col">
      {/* Header */}
      <div className="bg-[#72463B] border-b border-[#B49E94]/20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/chats" className="text-[#D9C4B9] hover:text-[#B49E94] transition">
            ← Back
          </Link>
          <div>
            <h2 className="font-semibold text-[#D9C4B9]">{matchName || "Loading..."}</h2>
            <p className="text-xs text-[#B49E94]">
              {connected ? "● Online" : "○ Connecting..."}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.map((m, idx) => {
            const isOwn = m.sender === user?._id;
            return (
              <div
                key={m._id || idx}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    isOwn
                      ? "bg-[#72463B] text-[#D9C4B9]"
                      : "bg-[#3A2A25] text-[#D9C4B9]"
                  }`}
                >
                  <p className="text-sm break-words">{m.content}</p>
                  <p className="text-xs text-[#B49E94] mt-1">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-[#72463B] border-t border-[#B49E94]/20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-[#221512] text-[#D9C4B9] rounded-lg border border-[#B49E94]/30 focus:border-[#D9C4B9] focus:outline-none transition-colors placeholder-[#B49E94]/50"
          />
          <button
            onClick={send}
            disabled={!connected || !msg.trim()}
            className="px-6 py-2 bg-[#D9C4B9] text-[#221512] rounded-lg font-medium hover:bg-[#B49E94] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
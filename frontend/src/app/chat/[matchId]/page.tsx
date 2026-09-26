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
  const [status, setStatus] = useState<"pending" | "accepted" | "rejected">("pending");
  const [isReceiver, setIsReceiver] = useState(false);

  // ✅ LOAD MATCH INFO
  useEffect(() => {
    const loadMatchInfo = async () => {
      if (!token || !matchId) return;

      try {
        const data = await api(`/match/${matchId}`, "GET", null, token);

        setMatchName(data.matchName || "Chat");
        setStatus(data.status || "pending");

        setIsReceiver(data.isReceiver);
      } catch (error) {
        console.error(error);
      }
    };

    loadMatchInfo();
  }, [matchId, token, user?._id]);

  // ✅ LOAD OLD MESSAGES
  useEffect(() => {
    const loadMessages = async () => {
      if (!token || !matchId) return;

      try {
        const data = await api(`/match/messages/${matchId}`, "GET", null, token);
        if (Array.isArray(data)) setMessages(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadMessages();
  }, [matchId, token]);

  // ✅ SOCKET CONNECT
  useEffect(() => {
    if (!matchId) return;

    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_room", matchId);
    });

    return () => {
      socket.emit("leave_room", matchId);
      socket.off("connect");
    };
  }, [matchId]);

  // ✅ RECEIVE MESSAGE
  useEffect(() => {
    socket.on("receive_message", (data: any) => {
      if (data.matchId === matchId) {
        setMessages((prev) => {
          const exists = prev.find((m) => m._id === data._id);
          if (exists) return prev;
          return [...prev, data];
        });
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [matchId]);

  // RECEIVE MATCH STATUS UPDATE
  useEffect(() => {
    const handleMatchStatusUpdate = (data: any) => {
      if (data.matchId !== matchId) return;

      setStatus(data.status);
    };

    socket.on("match_status_updated", handleMatchStatusUpdate);

    return () => {
      socket.off("match_status_updated", handleMatchStatusUpdate);
    };
  }, [matchId]);

  // ✅ AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ SEND MESSAGE
  const send = () => {
    if (!msg.trim() || !connected || status !== "accepted") return;

    socket.emit("send_message", {
      matchId,
      content: msg,
      senderId: user?._id,
    });

    setMsg("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // ACCEPT
  const accept = async () => {
    try {
      const data = await api(
        `/match/accept/${matchId}`,
        "POST",
        null,
        token!
      );

      if (data?.success) {
        setStatus("accepted");

        socket.emit("match_status_updated", {
          matchId,
          status: "accepted",
        });
      }
    } catch (err) {
      console.error("ACCEPT ERROR:", err);
    }
  };

  // REJECT
  const reject = async () => {
    try {
      const data = await api(
        `/match/reject/${matchId}`,
        "POST",
        null,
        token!
      );

      if (data?.success) {
        setStatus("rejected");

        socket.emit("match_status_updated", {
          matchId,
          status: "rejected",
        });
      }
    } catch (err) {
      console.error("REJECT ERROR:", err);
    }
  };

  return (
    <div className="h-screen bg-[#221512] flex flex-col">

      {/* HEADER */}
      <div className="bg-[#72463B] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/chats" className="text-[#D9C4B9]">
            ← Back
          </Link>
          <div>
            <h2 className="text-[#D9C4B9]">{matchName}</h2>
            <p className="text-xs text-[#B49E94]">
              {connected ? "● Online" : "○ Connecting..."}
            </p>
          </div>
        </div>
      </div>

      {/* STATUS */}
      {status === "pending" && isReceiver && (
        <div className="bg-yellow-900 text-white p-3 flex justify-center gap-4">
          <button onClick={accept} className="bg-green-500 px-4 py-1 rounded">
            Accept
          </button>
          <button onClick={reject} className="bg-red-500 px-4 py-1 rounded">
            Reject
          </button>
        </div>
      )}

      {status === "pending" && !isReceiver && (
        <div className="bg-yellow-900 text-yellow-200 text-center p-2">
          Waiting for user to accept your request...
        </div>
      )}

      {status === "rejected" && (
        <div className="bg-red-900 text-red-200 text-center p-2">
          Request rejected. Chat locked.
        </div>
      )}

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.map((m, idx) => {
            const senderId =
              typeof m.sender === "object" ? m.sender._id : m.sender;

            const isOwn = senderId === user?._id;

            return (
              <div key={m._id || idx} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${isOwn ? "bg-[#72463B]" : "bg-[#3A2A25]"} text-[#D9C4B9]`}>
                  <p>{m.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className="bg-[#72463B] px-4 py-3">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={status !== "accepted"}
            placeholder={status === "accepted" ? "Type..." : "Chat locked..."}
            className="flex-1 px-4 py-2 bg-[#221512] text-[#D9C4B9] rounded"
          />
          <button
            onClick={send}
            disabled={!connected || !msg.trim() || status !== "accepted"}
            className="px-6 py-2 bg-[#D9C4B9] text-black rounded"
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
}
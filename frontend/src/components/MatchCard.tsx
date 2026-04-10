"use client";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MatchCard({ user, index = 0 }: any) {
  const { token } = useAuthStore();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const sendRequest = async () => {
    if (!msg.trim()) return;
    setLoading(true);
    try {
      const res = await api(
        "/match/request",
        "POST",
        {
          receiverId: user._id,
          content: msg,
        },
        token!
      );
      const matchId = res.match._id;
      router.push(`/chat/${matchId}`);
    } catch (error) {
      console.error("Failed to send request:", error);
    } finally {
      setLoading(false);
    }
  };

  // Animation delay for staggered entrance
  const animationDelay = `${index * 50}ms`;

  return (
    <div 
      className="group relative transition-all duration-300 ease-out"
      style={{ animationDelay }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Card container with hover effects */}
      <div className={`
        bg-[#72463B] rounded-xl border border-[#B49E94]/20 
        transition-all duration-300 ease-out
        ${isExpanded ? 'scale-[1.02] -translate-y-1 shadow-2xl' : 'scale-100 translate-y-0 shadow-lg'}
      `}>
        <div className="p-5">
          {/* User info row */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className={`
              w-12 h-12 rounded-full bg-[#D9C4B9] flex items-center justify-center 
              transition-all duration-300
              ${isExpanded ? 'scale-110' : 'scale-100'}
            `}>
              <span className="text-[#221512] font-bold text-lg">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User details */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#D9C4B9]">
                {user.name}
              </h3>
              
              {/* Skills tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {user.skillsOffered?.slice(0, 3).map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-[#221512] text-[#D9C4B9] text-xs rounded-md"
                  >
                    {skill}
                  </span>
                ))}
                {user.skillsOffered?.length > 3 && (
                  <span className="px-2 py-0.5 bg-[#221512]/50 text-[#B49E94] text-xs rounded-md">
                    +{user.skillsOffered.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Match badge */}
            <div className="text-right">
              <div className="text-xs text-[#B49E94] bg-[#221512]/50 px-2 py-1 rounded-full">
                ★ Match
              </div>
            </div>
          </div>

          {/* Message input - slides in on hover */}
          <div className={`
            overflow-hidden transition-all duration-300 ease-out
            ${isExpanded ? 'max-h-32 opacity-100 mt-4' : 'max-h-0 opacity-0'}
          `}>
            <textarea
              placeholder={`Message ${user.name.split(' ')[0]}...`}
              onChange={(e) => setMsg(e.target.value)}
              value={msg}
              rows={2}
              className="w-full px-3 py-2 bg-[#221512] text-[#D9C4B9] rounded-lg border border-[#B49E94]/30 focus:border-[#D9C4B9] focus:outline-none transition-colors placeholder-[#B49E94]/50 resize-none text-sm"
            />
            <button
              onClick={sendRequest}
              disabled={loading || !msg.trim()}
              className="w-full mt-2 py-2 bg-[#D9C4B9] text-[#221512] rounded-lg font-medium hover:bg-[#B49E94] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Sending..." : "Connect →"}
            </button>
          </div>

          {/* Quick connect button - always visible */}
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full mt-3 py-2 border border-[#B49E94]/40 text-[#D9C4B9] rounded-lg text-sm hover:bg-[#221512] transition-all duration-200"
            >
              Connect →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
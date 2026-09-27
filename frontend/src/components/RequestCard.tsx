"use client";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";

interface RequestCardProps {
  request: any;
  type: "incoming" | "outgoing";
  onUpdate: () => void;
}

export default function RequestCard({
  request,
  type,
  onUpdate,
}: RequestCardProps) {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const person =
    type === "incoming"
      ? request.sender
      : request.receiver;

  const handleAction = async (
    action: "accept" | "reject"
  ) => {
    if (!token) return;

    try {
      setLoading(true);

      await api(
        `/match/${action}/${request._id}`,
        "POST",
        null,
        token
      );

      onUpdate();
    } catch (error: any) {
      console.error(error);
      alert(
        error?.message ||
          `Failed to ${action} request`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!token) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this request?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await api(
        `/match/cancel/${request._id}`,
        "DELETE",
        null,
        token
      );

      onUpdate();
    } catch (error: any) {
      console.error(error);
      alert(
        error?.message ||
          "Failed to cancel request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#72463B] rounded-xl p-5">
      <div className="flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-[#D9C4B9] text-[#221512] flex items-center justify-center font-semibold">
            {person?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>

          <div>
            <h3 className="text-[#D9C4B9] font-semibold">
              {person?.name || "Unknown user"}
            </h3>

            <p className="text-sm text-[#B49E94]">
              {type === "incoming"
                ? "Wants to connect with you"
                : "Request sent"}
            </p>
          </div>
        </div>

        {type === "incoming" ? (
          <div className="flex gap-2">
            <button
              disabled={loading}
              onClick={() => handleAction("accept")}
              className="bg-[#D9C4B9] text-[#221512] px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              Accept
            </button>

            <button
              disabled={loading}
              onClick={() => handleAction("reject")}
              className="border border-[#D9C4B9]/40 text-[#D9C4B9] px-4 py-2 rounded-lg hover:bg-[#221512]/30 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#B49E94] bg-[#221512]/40 px-4 py-2 rounded-full">
              Pending
            </span>

            <button
              disabled={loading}
              onClick={handleCancel}
              className="text-sm border border-red-300/30 text-red-200 px-4 py-2 rounded-lg hover:bg-red-900/30 disabled:opacity-50"
            >
              {loading ? "Cancelling..." : "Cancel"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
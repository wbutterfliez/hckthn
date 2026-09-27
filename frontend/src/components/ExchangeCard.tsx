"use client";

import { useRouter } from "next/navigation";

export default function ExchangeCard({
  exchange,
  completed = false,
}: {
  exchange: any;
  completed?: boolean;
}) {
  const router = useRouter();

  const matchId = exchange.matchId || exchange._id;

  const otherUser =
    exchange.otherUser ||
    exchange.user ||
    exchange.users?.find(
      (u: any) => u?._id !== exchange.currentUserId
    );

  const userName = otherUser?.name || exchange.matchName || "SkillSwap user";
  const avatar = otherUser?.avatar;

  const openChat = () => {
    if (!matchId) {
      console.error("No match ID found:", exchange);
      return;
    }

    router.push(`/chat/${matchId}`);
  };

  return (
    <div className="bg-[#855044] rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {avatar ? (
            <img
              src={avatar}
              alt={userName}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#dfcec5] text-[#221512] flex items-center justify-center text-lg font-medium">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-[#f0e3dc]">
              {userName}
            </h3>

            <p className="text-[#d9c4b9]">
              {completed
                ? "Exchange completed"
                : "You have an active exchange"}
            </p>
          </div>
        </div>

        <span
          className={`px-5 py-2 rounded-full ${
            completed
              ? "bg-[#4f403b]"
              : "bg-[#60382f]"
          } text-[#e5d4cc]`}
        >
          {completed ? "Completed" : "Active"}
        </span>
      </div>

      {!completed && (
        <button
          onClick={openChat}
          className="mt-5 w-full border border-[#dfcec5] rounded-xl py-3 text-[#f0e3dc] hover:bg-[#72463b] transition"
        >
          Open Chat →
        </button>
      )}
    </div>
  );
}
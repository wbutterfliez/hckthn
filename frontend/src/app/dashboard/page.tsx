"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import SkillForm from "@/components/SkillForm";
import MatchCard from "@/components/MatchCard";

export default function Dashboard() {
  const { token, loadFromStorage, user } = useAuthStore();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api("/users/matches", "GET", null, token);
        if (Array.isArray(data)) {
          setMatches(data);
        }
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#221512]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with greeting */}
        <div className="mb-8 pb-4 border-b border-[#B49E94]/20">
          <h1 className="text-3xl font-bold text-[#D9C4B9]">
            Hey{user?.name ? `, ${user.name.split(' ')[0]}` : ''} ☕
          </h1>
          <p className="text-[#B49E94] mt-1">
            {matches.length} matches brewing • Let’s build your skill circle
          </p>
        </div>

        {/* Two column layout - left: skills form, right: matches */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Skills Form */}
          <div className="lg:col-span-1">
            <SkillForm />
          </div>

          {/* Right Column - Matches */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#D9C4B9]">Your Matches</h2>
              <span className="text-sm text-[#B49E94] bg-[#72463B]/30 px-3 py-1 rounded-full">
                {matches.length} {matches.length === 1 ? 'person' : 'people'}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#72463B] border-t-[#D9C4B9]"></div>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-16 bg-[#72463B]/20 rounded-xl border border-[#B49E94]/20 border-dashed">
                <p className="text-[#B49E94] text-lg">No matches yet</p>
                <p className="text-sm text-[#B49E94]/60 mt-1">
                  Add your skills above to find your perfect match
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((m: any, idx: number) => (
                  <MatchCard key={m._id} user={m} index={idx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
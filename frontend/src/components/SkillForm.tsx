"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function SkillForm() {
  const { token } = useAuthStore();
  const [skillsOffered, setOffered] = useState("");
  const [skillsWanted, setWanted] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load existing skills
  useEffect(() => {
    const loadSkills = async () => {
      if (!token) return;
      try {
        const data = await api("/users/profile", "GET", null, token);
        if (data) {
          setOffered(data.skillsOffered?.join(", ") || "");
          setWanted(data.skillsWanted?.join(", ") || "");
        }
      } catch (error) {
        console.error("Failed to load skills:", error);
      }
    };
    loadSkills();
  }, [token]);

  const save = async () => {
    setLoading(true);
    try {
      await api(
        "/users/profile",
        "PUT",
        {
          skillsOffered: skillsOffered.toLowerCase().split(",").map(s => s.trim()).filter(s => s),
          skillsWanted: skillsWanted.toLowerCase().split(",").map(s => s.trim()).filter(s => s),
        },
        token!
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save skills:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#72463B] rounded-xl border border-[#B49E94]/20 p-6">
      <h2 className="text-2xl font-semibold text-[#D9C4B9] mb-4">Your Skills</h2>
      <p className="text-[#B49E94] text-sm mb-6">
        List your skills separated by commas (e.g., "javascript, python, design")
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-[#D9C4B9] text-sm font-medium mb-2">
            Skills you can teach
          </label>
          <input
            className="w-full px-4 py-2 bg-[#221512] text-[#D9C4B9] rounded-lg border border-[#B49E94]/30 focus:border-[#D9C4B9] focus:outline-none transition-colors placeholder-[#B49E94]/50"
            placeholder="e.g., guitar, cooking, coding"
            value={skillsOffered}
            onChange={(e) => setOffered(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[#D9C4B9] text-sm font-medium mb-2">
            Skills you want to learn
          </label>
          <input
            className="w-full px-4 py-2 bg-[#221512] text-[#D9C4B9] rounded-lg border border-[#B49E94]/30 focus:border-[#D9C4B9] focus:outline-none transition-colors placeholder-[#B49E94]/50"
            placeholder="e.g., spanish, yoga, photography"
            value={skillsWanted}
            onChange={(e) => setWanted(e.target.value)}
          />
        </div>

        <button
          onClick={save}
          disabled={loading}
          className="w-full py-2 bg-[#D9C4B9] text-[#221512] rounded-lg font-medium hover:bg-[#B49E94] transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Saving..." : saved ? "✓ Saved!" : "Save Skills"}
        </button>
      </div>
    </div>
  );
}
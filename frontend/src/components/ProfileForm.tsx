"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function ProfileForm() {
  const { token } = useAuthStore();

  const [bio, setBio] = useState("");
  const [offered, setOffered] = useState("");
  const [wanted, setWanted] = useState("");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await api(
        "/users/profile",
        "PUT",
        {
          bio,
          skillsOffered: offered.split(",").map(s => s.trim()),
          skillsWanted: wanted.split(",").map(s => s.trim()),
        },
        token!
      );
      alert("Profile saved!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#72463B] p-6 rounded-xl space-y-4">
      <textarea
        placeholder="Tell people about yourself..."
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full p-3 rounded bg-[#221512] text-[#D9C4B9]"
      />

      <input
        placeholder="Skills you offer (comma separated)"
        value={offered}
        onChange={(e) => setOffered(e.target.value)}
        className="w-full p-2 rounded bg-[#221512] text-[#D9C4B9]"
      />

      <input
        placeholder="Skills you want"
        value={wanted}
        onChange={(e) => setWanted(e.target.value)}
        className="w-full p-2 rounded bg-[#221512] text-[#D9C4B9]"
      />

      <button
        onClick={save}
        className="bg-[#D9C4B9] text-[#221512] px-4 py-2 rounded"
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
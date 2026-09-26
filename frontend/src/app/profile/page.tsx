"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const { token, user, loadFromStorage } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    bio: "",
    skillsOffered: "",
    skillsWanted: "",
  });

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      const data = await api("/users/profile", "GET", null, token);
      setProfile(data);

      setForm({
        bio: data.bio || "",
        skillsOffered: data.skillsOffered?.join(", ") || "",
        skillsWanted: data.skillsWanted?.join(", ") || "",
      });
    };

    fetchProfile();
  }, [token]);

  const save = async () => {
    const updated = await api(
      "/users/profile",
      "PUT",
      {
        bio: form.bio,
        skillsOffered: form.skillsOffered.split(",").map((s) => s.trim()),
        skillsWanted: form.skillsWanted.split(",").map((s) => s.trim()),
      },
      token!
    );

    setProfile(updated);
    setEditing(false);
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#221512] flex justify-center py-10">
      <div className="w-full max-w-2xl bg-[#72463B] p-6 rounded-xl">
        <h1 className="text-2xl text-[#D9C4B9] mb-4">Your Profile</h1>

        {editing ? (
          <div className="space-y-4">
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Bio"
              className="w-full p-2 bg-[#221512] text-[#D9C4B9]"
            />

            <input
              value={form.skillsOffered}
              onChange={(e) =>
                setForm({ ...form, skillsOffered: e.target.value })
              }
              placeholder="Skills Offered"
              className="w-full p-2 bg-[#221512] text-[#D9C4B9]"
            />

            <input
              value={form.skillsWanted}
              onChange={(e) =>
                setForm({ ...form, skillsWanted: e.target.value })
              }
              placeholder="Skills Wanted"
              className="w-full p-2 bg-[#221512] text-[#D9C4B9]"
            />

            <button onClick={save} className="bg-[#D9C4B9] px-4 py-2">
              Save
            </button>
          </div>
        ) : (
          <div>
            <p className="text-[#B49E94]">{profile.bio}</p>

            <div className="mt-4">
              <p className="text-[#D9C4B9] font-semibold">Offers:</p>
              {profile.skillsOffered?.map((s: string) => (
                <span key={s}>{s} </span>
              ))}
            </div>

            <div className="mt-2">
              <p className="text-[#D9C4B9] font-semibold">Wants:</p>
              {profile.skillsWanted?.map((s: string) => (
                <span key={s}>{s} </span>
              ))}
            </div>

            <button
              onClick={() => setEditing(true)}
              className="mt-4 bg-[#D9C4B9] px-4 py-2"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
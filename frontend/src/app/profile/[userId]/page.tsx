"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function OtherProfile() {
  const { userId } = useParams();
  const { token } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      const data = await api(`/users/${userId}`, "GET", null, token!);
      setProfile(data);
    };
    fetch();
  }, [userId]);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#221512] flex justify-center py-10">
      <div className="w-full max-w-2xl bg-[#72463B] p-6 rounded-xl">
        <h1 className="text-2xl text-[#D9C4B9] mb-4">{profile.name}</h1>

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
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function OtherProfile() {
  const { userId } = useParams();
  const { token } = useAuthStore();

  const [profile, setProfile] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !userId) return;

      try {
        const data = await api(
          `/users/profile/${userId}`,
          "GET",
          null,
          token
        );

        setProfile(data);
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#221512] flex items-center justify-center text-[#D9C4B9]">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#221512] flex items-center justify-center text-[#B49E94]">
        User not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#221512] flex justify-center py-10 px-4">
      <div className="w-full max-w-2xl">

        <Link
          href="/dashboard"
          className="text-[#B49E94] hover:text-[#D9C4B9]"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-[#72463B] p-6 rounded-xl mt-5">

          {/* HEADER */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#D9C4B9] text-[#221512] flex items-center justify-center text-xl font-bold">
              {profile.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#D9C4B9]">
                {profile.name}
              </h1>

              {profile.bio && (
                <p className="text-[#B49E94] mt-1">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* OFFERED */}
          <div className="mt-8">
            <p className="text-[#D9C4B9] font-semibold mb-3">
              Skills they can teach
            </p>

            <div className="flex flex-wrap gap-2">
              {profile.skillsOffered?.map(
                (skill: string) => (
                  <span
                    key={skill}
                    className="bg-[#221512] text-[#D9C4B9] px-3 py-2 rounded-md"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>

          {/* WANTED */}
          <div className="mt-6">
            <p className="text-[#D9C4B9] font-semibold mb-3">
              Skills they want to learn
            </p>

            <div className="flex flex-wrap gap-2">
              {profile.skillsWanted?.map(
                (skill: string) => (
                  <span
                    key={skill}
                    className="bg-[#221512] text-[#D9C4B9] px-3 py-2 rounded-md"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
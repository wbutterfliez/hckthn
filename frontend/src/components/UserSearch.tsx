"use client";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function UserSearch() {
  const { token } = useAuthStore();

  const [search, setSearch] = useState("");
  const [type, setType] = useState<
    "all" | "offered" | "wanted"
  >("all");

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const query =
        `/users/search?search=${encodeURIComponent(
          search
        )}&type=${type}`;

      const data = await api(
        query,
        "GET",
        null,
        token
      );

      setUsers(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Failed to search users:",
        error
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      searchUsers();
    }
  }, [type, token]);

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#D9C4B9]">
          Find People
        </h2>
      </div>

      {/* SEARCH */}
      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchUsers();
            }
          }}
          placeholder="Search users or skills..."
          className="flex-1 bg-[#221512] border border-[#B49E94]/20 text-[#D9C4B9] px-4 py-3 rounded-xl outline-none focus:border-[#D9C4B9]/50"
        />

        <button
          onClick={searchUsers}
          className="bg-[#D9C4B9] text-[#221512] px-5 rounded-xl font-medium"
        >
          Search
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 mb-5">
        {[
          ["all", "All"],
          ["offered", "Offered"],
          ["wanted", "Wanted"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() =>
              setType(
                value as
                  | "all"
                  | "offered"
                  | "wanted"
              )
            }
            className={`px-4 py-2 rounded-full text-sm ${
              type === value
                ? "bg-[#D9C4B9] text-[#221512]"
                : "bg-[#72463B]/40 text-[#B49E94]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* RESULTS */}
      {loading ? (
        <div className="text-center py-8 text-[#B49E94]">
          Searching...
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 bg-[#72463B]/20 rounded-xl">
          <p className="text-[#B49E94]">
            No users found
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-[#72463B] rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D9C4B9] text-[#221512] flex items-center justify-center font-semibold">
                    {user?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "?"}
                  </div>

                  <div>
                    <h3 className="text-[#D9C4B9] font-semibold">
                      {user.name}
                    </h3>

                    {user.bio && (
                      <p className="text-sm text-[#B49E94] mt-1">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/profile/${user._id}`}
                  className="text-sm border border-[#D9C4B9]/40 px-4 py-2 rounded-lg text-[#D9C4B9]"
                >
                  View Profile
                </Link>
              </div>

              {/* OFFERED */}
              <div className="mt-4">
                <p className="text-xs text-[#B49E94] mb-2">
                  Offers
                </p>

                <div className="flex flex-wrap gap-2">
                  {user.skillsOffered?.map(
                    (skill: string) => (
                      <span
                        key={skill}
                        className="bg-[#221512] text-[#D9C4B9] px-3 py-1 rounded-md text-sm"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* WANTED */}
              <div className="mt-4">
                <p className="text-xs text-[#B49E94] mb-2">
                  Wants
                </p>

                <div className="flex flex-wrap gap-2">
                  {user.skillsWanted?.map(
                    (skill: string) => (
                      <span
                        key={skill}
                        className="bg-[#221512] text-[#D9C4B9] px-3 py-1 rounded-md text-sm"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
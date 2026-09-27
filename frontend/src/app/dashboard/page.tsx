"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

import SkillForm from "@/components/SkillForm";
import MatchCard from "@/components/MatchCard";
import RequestCard from "@/components/RequestCard";
import ExchangeCard from "@/components/ExchangeCard";
import UserSearch from "@/components/UserSearch";

export default function Dashboard() {
  const {
    token,
    loadFromStorage,
    user,
  } = useAuthStore();

  // Existing matches
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Requests
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);

  // Exchanges
  const [active, setActive] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);

  const [dataLoading, setDataLoading] =
    useState(true);

  // ==================================================
  // LOAD AUTH
  // ==================================================

  useEffect(() => {
    loadFromStorage();
  }, []);

  // ==================================================
  // LOAD EVERYTHING
  // ==================================================

  const fetchDashboardData = async () => {
    if (!token) {
      setLoading(false);
      setDataLoading(false);
      return;
    }

    try {
      setDataLoading(true);

      const [
        matchesData,
        incomingData,
        outgoingData,
        activeData,
        completedData,
      ] = await Promise.all([
        api(
          "/users/matches",
          "GET",
          null,
          token
        ),

        api(
          "/match/requests/incoming",
          "GET",
          null,
          token
        ),

        api(
          "/match/requests/outgoing",
          "GET",
          null,
          token
        ),

        api(
          "/match/exchanges/active",
          "GET",
          null,
          token
        ),

        api(
          "/match/exchanges/completed",
          "GET",
          null,
          token
        ),
      ]);

      setMatches(
        Array.isArray(matchesData)
          ? matchesData
          : []
      );

      setIncoming(
        Array.isArray(incomingData)
          ? incomingData
          : []
      );

      setOutgoing(
        Array.isArray(outgoingData)
          ? outgoingData
          : []
      );

      setActive(
        Array.isArray(activeData)
          ? activeData
          : []
      );

      setCompleted(
        Array.isArray(completedData)
          ? completedData
          : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch dashboard data:",
        error
      );
    } finally {
      setLoading(false);
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="min-h-screen bg-[#221512]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HEADER */}
        <div className="mb-8 pb-4 border-b border-[#B49E94]/20">
          <h1 className="text-3xl font-bold text-[#D9C4B9]">
            Hey
            {user?.name
              ? `, ${user.name.split(" ")[0]}`
              : ""}{" "}
            ☕
          </h1>

          <p className="text-[#B49E94] mt-1">
            {matches.length} matches brewing •
            Let’s build your skill circle
          </p>
        </div>

        {/* ==========================================
            SKILLS + MATCHES
        ========================================== */}

        <div className="grid lg:grid-cols-3 gap-8">

          {/* SKILLS */}
          <div className="lg:col-span-1">
            <SkillForm />
          </div>

          {/* MATCHES */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#D9C4B9]">
                Your Matches
              </h2>

              <span className="text-sm text-[#B49E94] bg-[#72463B]/30 px-3 py-1 rounded-full">
                {matches.length}{" "}
                {matches.length === 1
                  ? "person"
                  : "people"}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#72463B] border-t-[#D9C4B9]" />
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-16 bg-[#72463B]/20 rounded-xl border border-[#B49E94]/20 border-dashed">
                <p className="text-[#B49E94] text-lg">
                  No matches yet
                </p>

                <p className="text-sm text-[#B49E94]/60 mt-1">
                  Add your skills above to find your
                  perfect match
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map(
                  (m: any, idx: number) => (
                    <MatchCard
                      key={m._id}
                      user={m}
                      index={idx}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            PENDING REQUESTS
        ========================================== */}

        <section className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-[#D9C4B9]">
              Pending Requests
            </h2>

            <span className="text-sm text-[#B49E94]">
              {incoming.length + outgoing.length}
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">

            {/* INCOMING */}
            <div>
              <h3 className="text-sm text-[#B49E94] mb-3">
                Incoming
              </h3>

              {incoming.length === 0 ? (
                <div className="bg-[#72463B]/20 rounded-xl p-5 text-sm text-[#B49E94]">
                  No incoming requests.
                </div>
              ) : (
                <div className="space-y-3">
                  {incoming.map((request) => (
                    <RequestCard
                      key={request._id}
                      request={request}
                      type="incoming"
                      onUpdate={fetchDashboardData}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* OUTGOING */}
            <div>
              <h3 className="text-sm text-[#B49E94] mb-3">
                Outgoing
              </h3>

              {outgoing.length === 0 ? (
                <div className="bg-[#72463B]/20 rounded-xl p-5 text-sm text-[#B49E94]">
                  No outgoing requests.
                </div>
              ) : (
                <div className="space-y-3">
                  {outgoing.map((request) => (
                    <RequestCard
                      key={request._id}
                      request={request}
                      type="outgoing"
                      onUpdate={fetchDashboardData}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==========================================
            ACTIVE EXCHANGES
        ========================================== */}

        <section className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-[#D9C4B9]">
              Active Exchanges
            </h2>

            <span className="text-sm text-[#B49E94]">
              {active.length}
            </span>
          </div>

          {active.length === 0 ? (
            <div className="bg-[#72463B]/20 rounded-xl p-6 text-[#B49E94]">
              No active exchanges yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {active.map((exchange) => (
                <ExchangeCard
                  key={exchange._id}
                  exchange={exchange}
                />
              ))}
            </div>
          )}
        </section>

        {/* ==========================================
            COMPLETED
        ========================================== */}

        <section className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-[#D9C4B9]">
              Completed Exchanges
            </h2>

            <span className="text-sm text-[#B49E94]">
              {completed.length}
            </span>
          </div>

          {completed.length === 0 ? (
            <div className="bg-[#72463B]/20 rounded-xl p-6 text-[#B49E94]">
              No completed exchanges yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {completed.map((exchange) => (
                <ExchangeCard
                  key={exchange._id}
                  exchange={exchange}
                  completed
                />
              ))}
            </div>
          )}
        </section>

        {/* ==========================================
            SEARCH USERS
        ========================================== */}

        <UserSearch />

      </div>
    </div>
  );
}
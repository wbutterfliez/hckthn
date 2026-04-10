"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api("/auth/signup", "POST", form);
      router.push("/login");
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-[#72463B] rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-[#D9C4B9]">Join SkillSwap</h1>
            <p className="text-[#B49E94]">Start your skill exchange journey</p>
          </div>

          <div className="space-y-4">
            <input
              className="w-full px-4 py-3 bg-[#221512] text-[#D9C4B9] rounded-lg border border-[#B49E94]/30 focus:border-[#D9C4B9] focus:outline-none transition-colors placeholder-[#B49E94]/50"
              placeholder="Full name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="w-full px-4 py-3 bg-[#221512] text-[#D9C4B9] rounded-lg border border-[#B49E94]/30 focus:border-[#D9C4B9] focus:outline-none transition-colors placeholder-[#B49E94]/50"
              placeholder="Email address"
              type="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              className="w-full px-4 py-3 bg-[#221512] text-[#D9C4B9] rounded-lg border border-[#B49E94]/30 focus:border-[#D9C4B9] focus:outline-none transition-colors placeholder-[#B49E94]/50"
              placeholder="Password"
              type="password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button
              className="w-full py-3 bg-[#D9C4B9] text-[#221512] rounded-lg font-semibold hover:bg-[#B49E94] transition-all duration-200 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </div>

          <p className="text-center text-[#B49E94]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#D9C4B9] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
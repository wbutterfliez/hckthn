"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Don't show navbar on login/signup pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <nav className="bg-[#72463B]/95 backdrop-blur-sm border-b border-[#B49E94]/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-xl font-bold text-[#D9C4B9] hover:text-[#B49E94] transition-colors"
          >
            Skillswap
          </Link>

          {/* Navigation */}
          {user ? (
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm text-[#D9C4B9] hover:text-[#B49E94] transition-colors ${
                  pathname === "/dashboard" ? "border-b-2 border-[#D9C4B9]" : ""
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/chats"
                className={`text-sm text-[#D9C4B9] hover:text-[#B49E94] transition-colors ${
                  pathname === "/chats" ? "border-b-2 border-[#D9C4B9]" : ""
                }`}
              >
                Messages
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-[#D9C4B9] hover:text-[#B49E94] transition-colors"
              >
                Logout
              </button>
              <div className="w-8 h-8 rounded-full bg-[#D9C4B9] flex items-center justify-center">
                <span className="text-[#221512] font-medium text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link
                href="/login"
                className="text-sm text-[#D9C4B9] hover:text-[#B49E94] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 bg-[#D9C4B9] text-[#221512] rounded-lg text-sm font-medium hover:bg-[#B49E94] transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
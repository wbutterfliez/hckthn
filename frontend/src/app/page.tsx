import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold text-[#D9C4B9] tracking-tight">
            SkillSwap
          </h1>
          <p className="text-xl text-[#B49E94] max-w-md mx-auto">
            Exchange skills, grow together. Find your perfect skill match today.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/login"
            className="px-8 py-3 bg-[#72463B] text-[#D9C4B9] rounded-lg font-medium hover:bg-[#8B5A4A] transition-all duration-200 shadow-lg"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 border-2 border-[#72463B] text-[#D9C4B9] rounded-lg font-medium hover:bg-[#72463B] hover:border-[#72463B] transition-all duration-200"
          >
            Sign Up
          </Link>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 pt-16">
          <div className="p-6 rounded-lg border border-[#B49E94]/20">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-[#D9C4B9] font-semibold mb-2">Find Matches</h3>
            <p className="text-sm text-[#B49E94]">Connect with people who share your interests</p>
          </div>
          <div className="p-6 rounded-lg border border-[#B49E94]/20">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-[#D9C4B9] font-semibold mb-2">Chat Instantly</h3>
            <p className="text-sm text-[#B49E94]">Real-time messaging with your matches</p>
          </div>
          <div className="p-6 rounded-lg border border-[#B49E94]/20">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-[#D9C4B9] font-semibold mb-2">Grow Together</h3>
            <p className="text-sm text-[#B49E94]">Learn and teach skills that matter</p>
          </div>
        </div>
      </div>
    </div>
  );
}
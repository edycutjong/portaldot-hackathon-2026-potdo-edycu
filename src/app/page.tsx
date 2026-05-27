import Link from "next/link";
import { TerminalDemo } from "@/components/TerminalDemo";

const FEATURES = [
  {
    icon: "⚡",
    title: "Natural Language",
    description: "Type \"Send 10 POT to Alice\" and get an interactive transfer preview card instantly.",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/20",
  },
  {
    icon: "📦",
    title: "Batch Airdrops",
    description: "\"Airdrop 5 POT to Alice, Bob, and Charlie\" — one command, one extrinsic.",
    color: "text-purple-400",
    borderColor: "border-purple-500/20",
  },
  {
    icon: "💰",
    title: "Live Balance",
    description: "\"What's my balance?\" renders real-time free, reserved, and frozen breakdown.",
    color: "text-green-400",
    borderColor: "border-green-500/20",
  },
  {
    icon: "🛡️",
    title: "Error Protection",
    description: "Insufficient balance? Red-bordered cards with clear warnings before you can execute.",
    color: "text-red-400",
    borderColor: "border-red-500/20",
  },
];

const STATS = [
  { value: "14", label: "Decimal Precision", color: "text-cyan-400" },
  { value: "8", label: "API Methods Used", color: "text-purple-400" },
  { value: "100%", label: "Test Coverage", color: "text-green-400" },
];

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 pb-16 scanline-overlay">
      {/* Background grid pattern */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 max-w-3xl mx-auto text-center animate-fade-in-up">
        {/* Hackathon badge */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-sm font-(family-name:--font-jetbrains) mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            DoraHacks × Portaldot Online S1 Hackathon 2026
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-purple-400 to-cyan-400">
              Potdo
            </span>
            <span className="ml-3">⚡</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            AI copilot that turns{" "}
            <span className="text-cyan-400 font-semibold">plain English</span> into{" "}
            <span className="text-purple-400 font-semibold">secure</span>,{" "}
            <span className="text-green-400 font-semibold">visual</span> Portaldot
            transactions — see the state change before you sign.
          </p>
        </div>

        {/* Terminal Demo */}
        <div className="mb-10">
          <TerminalDemo />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {/* Primary — Launch App */}
          <Link
            href="/dashboard"
            id="launch-app-cta"
            className="relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-lg overflow-hidden animate-button-breathe hover:bg-cyan-400 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Launch App
            {/* Shimmer sweep */}
            <span
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 3s linear infinite",
              }}
            />
          </Link>

          {/* Secondary — View Source */}
          <a
            href="https://github.com/edycutjong/potdo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all duration-200 hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            View Source
          </a>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-16">
          {STATS.map((stat) => (
            <div key={stat.label} className="glass-card p-3 text-center">
              <p className={`text-2xl font-bold font-(family-name:--font-jetbrains) ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-16">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className={`glass-card p-5 text-left border ${feature.borderColor} hover:border-opacity-60 transition-all duration-300 hover:scale-[1.02] animate-fade-in-up stagger-${i + 1}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{feature.icon}</span>
                <h3 className={`font-semibold ${feature.color}`}>{feature.title}</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Sponsor Section */}
        <div className="border-t border-slate-800/50 pt-10">
          <p className="text-xs font-(family-name:--font-jetbrains) text-slate-500 uppercase tracking-widest mb-6">
            Built for
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Portaldot */}
            <a
              href="https://portaldot.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 h-14 px-5 rounded-lg border border-slate-800 bg-white/2 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-200"
            >
              <span className="text-lg">⚡</span>
              <span className="text-sm font-semibold text-slate-200">Portaldot</span>
              <span className="text-xs text-slate-500 font-(family-name:--font-jetbrains)">Substrate L1</span>
            </a>

            {/* DoraHacks */}
            <a
              href="https://dorahacks.io/hackathon/portaldot-online-s1/detail"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 h-14 px-5 rounded-lg border border-slate-800 bg-white/2 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all duration-200"
            >
              <span className="text-lg">🏗️</span>
              <span className="text-sm font-semibold text-slate-200">DoraHacks</span>
              <span className="text-xs text-slate-500 font-(family-name:--font-jetbrains)">Online S1 2026</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

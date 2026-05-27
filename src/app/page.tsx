import Link from "next/link";

import { TerminalDemo } from "@/components/TerminalDemo";

/* ── Inline SVG Icon Components ───────────────────────────────── */

function IconBolt({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconLayers({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </svg>
  );
}

function IconWallet({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}

function IconShield({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconGitHub({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function IconHexagon({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

function IconCode({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: IconBolt,
    title: "Natural Language",
    description: "Type \"Send 10 POT to Alice\" and get an interactive transfer preview card instantly.",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/20",
    iconBg: "bg-cyan-500/10",
  },
  {
    icon: IconLayers,
    title: "Batch Airdrops",
    description: "\"Airdrop 5 POT to Alice, Bob, and Charlie\" — one command, one extrinsic.",
    color: "text-purple-400",
    borderColor: "border-purple-500/20",
    iconBg: "bg-purple-500/10",
  },
  {
    icon: IconWallet,
    title: "Live Balance",
    description: "\"What's my balance?\" renders real-time free, reserved, and frozen breakdown.",
    color: "text-green-400",
    borderColor: "border-green-500/20",
    iconBg: "bg-green-500/10",
  },
  {
    icon: IconShield,
    title: "Error Protection",
    description: "Insufficient balance? Red-bordered cards with clear warnings before you can execute.",
    color: "text-red-400",
    borderColor: "border-red-500/20",
    iconBg: "bg-red-500/10",
  },
];

const STATS = [
  { value: "14", label: "Decimal Precision", color: "text-cyan-400" },
  { value: "8", label: "API Methods Used", color: "text-purple-400" },
  { value: "100%", label: "Test Coverage", color: "text-green-400" },
];

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 pb-12 scanline-overlay">
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
        <div className="mb-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-sm font-(family-name:--font-jetbrains) mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            DoraHacks × Portaldot Online S1 Hackathon 2026
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-3">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-purple-400 to-cyan-400">
              Potdo
            </span>
            <IconBolt className="inline-block w-10 h-10 md:w-14 md:h-14 ml-3 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            AI copilot that turns{" "}
            <span className="text-cyan-400 font-semibold">plain English</span> into{" "}
            <span className="text-purple-400 font-semibold">secure</span>,{" "}
            <span className="text-green-400 font-semibold">visual</span> Portaldot
            transactions — see the state change before you sign.
          </p>
        </div>

        {/* Terminal Demo */}
        <div className="mb-8">
          <TerminalDemo />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          {/* Primary — Launch App */}
          <Link
            href="/dashboard"
            id="launch-app-cta"
            className="relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-lg overflow-hidden animate-button-breathe hover:bg-cyan-400 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30"
          >
            <IconBolt className="w-5 h-5 shrink-0" />
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
            <IconGitHub className="w-5 h-5 shrink-0" />
            View Source
          </a>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-10">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-10">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className={`glass-card p-5 text-left border ${feature.borderColor} hover:border-opacity-60 transition-all duration-300 hover:scale-[1.02] animate-fade-in-up stagger-${i + 1}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-lg ${feature.iconBg} flex items-center justify-center shrink-0`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className={`font-semibold ${feature.color}`}>{feature.title}</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Sponsor Section */}
        <div className="border-t border-slate-800/50 pt-8">
          <p className="text-xs font-(family-name:--font-jetbrains) text-slate-500 uppercase tracking-widest mb-5">
            Built for
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Portaldot */}
            <a
              href="https://portaldot.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 h-12 px-5 rounded-lg border border-slate-800 bg-white/2 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-200"
            >
              <IconHexagon className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-semibold text-slate-200">Portaldot</span>
              <span className="text-xs text-slate-500 font-(family-name:--font-jetbrains)">Substrate L1</span>
            </a>

            {/* DoraHacks */}
            <a
              href="https://dorahacks.io/hackathon/portaldot-online-s1/detail"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 h-12 px-5 rounded-lg border border-slate-800 bg-white/2 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all duration-200"
            >
              <IconCode className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-semibold text-slate-200">DoraHacks</span>
              <span className="text-xs text-slate-500 font-(family-name:--font-jetbrains)">Online S1 2026</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

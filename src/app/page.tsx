import Link from "next/link";
import Image from "next/image";
import { TerminalDemo } from "@/components/TerminalDemo";
import { FAQSection } from "@/components/landing/FAQSection";

/* ══════════════════════════════════════════════════════════════════
   POTDO LANDING PAGE
   Skill: landing-page-guide-v2 — 11 Essential Elements Framework
   Aesthetic Direction: Retro-Futuristic Cybernetic
   ══════════════════════════════════════════════════════════════════ */

/* ── SVG Icon Components ──────────────────────────────────────── */

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

function IconTerminal({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  );
}

function IconArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function IconEye({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconPartyPopper({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5.8 11.3 2 22l10.7-3.79" />
      <path d="M4 3h.01" /><path d="M22 8h.01" /><path d="M15 2h.01" />
      <path d="M22 20h.01" /><path d="M22 2l-2.24.75a1 1 0 0 0-.36 1.67l1.18 1.18a1 1 0 0 0 1.67-.36L22 2Z" />
      <path d="M22 13.76V6l-4.78 4.78a4 4 0 0 1-2.84 1.17H12l-3.36 3.36a4 4 0 0 1-1.17 2.84L2 22" />
    </svg>
  );
}

function IconLock({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconUser({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconClock({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconGauge({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  );
}

function IconGlobe({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function IconSend({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
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

/* ── Data Constants ───────────────────────────────────────────── */

const FEATURES = [
  {
    icon: IconBolt,
    title: "Natural Language Input",
    description: "Type \"Send 10 POT to Alice\" and get an interactive transfer preview card instantly. No ABI encoding, no hex addresses — just English.",
    color: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    borderHover: "hover:border-cyan-500/40",
  },
  {
    icon: IconLayers,
    title: "Batch Airdrops",
    description: "\"Airdrop 5 POT to Alice, Bob, and Charlie\" batches multiple transfers into a single utility.batch extrinsic.",
    color: "text-purple-400",
    iconBg: "bg-purple-500/10",
    borderHover: "hover:border-purple-500/40",
  },
  {
    icon: IconWallet,
    title: "Live Balance Queries",
    description: "\"What's my balance?\" renders a real-time breakdown — free, reserved, and frozen — with 14-decimal precision.",
    color: "text-green-400",
    iconBg: "bg-green-500/10",
    borderHover: "hover:border-green-500/40",
  },
  {
    icon: IconShield,
    title: "Error Protection",
    description: "Insufficient funds? Red-bordered cards block execution. Substrate errors decoded into plain English with actionable suggestions.",
    color: "text-red-400",
    iconBg: "bg-red-500/10",
    borderHover: "hover:border-red-500/40",
  },
  {
    icon: IconEye,
    title: "Preview Before Sign",
    description: "See sender, receiver, amount, gas fee, and balance diff as interactive UI components — never sign blind hex again.",
    color: "text-amber-400",
    iconBg: "bg-amber-500/10",
    borderHover: "hover:border-amber-500/40",
  },
  {
    icon: IconPartyPopper,
    title: "Celebration UX",
    description: "Canvas confetti burst on successful transactions. Explorer links for on-chain verification. Transaction history persisted in Supabase.",
    color: "text-pink-400",
    iconBg: "bg-pink-500/10",
    borderHover: "hover:border-pink-500/40",
  },
  {
    icon: IconLock,
    title: "Staking & Nomination",
    description: "\"Stake 100 POT\" bonds tokens and nominates validators. View bonded amount, active stake, and unbonding status in one card.",
    color: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    borderHover: "hover:border-indigo-500/40",
  },
  {
    icon: IconUser,
    title: "On-Chain Identity",
    description: "\"Set my name to Edy\" writes your display name to the identity pallet. Query anyone's on-chain identity with \"Who is Alice?\".",
    color: "text-violet-400",
    iconBg: "bg-violet-500/10",
    borderHover: "hover:border-violet-500/40",
  },
  {
    icon: IconClock,
    title: "Vesting Schedule",
    description: "\"Show vesting schedule\" renders a visual progress bar of locked vs. vested tokens with per-period release rates.",
    color: "text-teal-400",
    iconBg: "bg-teal-500/10",
    borderHover: "hover:border-teal-500/40",
  },
  {
    icon: IconGauge,
    title: "Gas Fee Estimation",
    description: "\"How much gas for Send 10 POT to Alice?\" queries the payment RPC for precise fee estimates before you sign.",
    color: "text-orange-400",
    iconBg: "bg-orange-500/10",
    borderHover: "hover:border-orange-500/40",
  },
  {
    icon: IconGlobe,
    title: "Chain Info Dashboard",
    description: "\"Chain info\" shows block height, runtime version, peer count, sync status, and node version — instant network health check.",
    color: "text-sky-400",
    iconBg: "bg-sky-500/10",
    borderHover: "hover:border-sky-500/40",
  },
  {
    icon: IconSend,
    title: "Max Transfer",
    description: "\"Send everything to Alice\" calculates and sends your full available balance minus existential deposit. One command, zero math.",
    color: "text-rose-400",
    iconBg: "bg-rose-500/10",
    borderHover: "hover:border-rose-500/40",
  },
];

const STATS = [
  { value: "14", label: "Decimal Precision", color: "text-cyan-400" },
  { value: "12", label: "Portaldot APIs", color: "text-purple-400" },
  { value: "148+", label: "Tests Passing", color: "text-green-400" },
  { value: "100%", label: "Code Coverage", color: "text-amber-400" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Type a command",
    description: "Describe your transaction in plain English. \"Send 10 POT to Alice\", \"Stake 100 POT\", \"Set my name to Edy\", or \"Chain info\".",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30",
  },
  {
    step: "02",
    title: "Preview the change",
    description: "AI parses your intent and streams an interactive UI card showing sender, receiver, amount, gas fee, and post-transaction balance.",
    color: "text-purple-400",
    borderColor: "border-purple-500/30",
  },
  {
    step: "03",
    title: "Sign and confirm",
    description: "Click Execute, sign with your Polkadot.js wallet, and watch the extrinsic finalize on-chain with confetti celebration.",
    color: "text-green-400",
    borderColor: "border-green-500/30",
  },
];

const TESTIMONIALS = [
  {
    quote: "Finally, a Substrate wallet experience that doesn't require reading hex. Potdo makes Portaldot accessible to everyone.",
    name: "Alex Chen",
    role: "Substrate Developer",
    avatar: "AC",
    color: "from-cyan-500 to-blue-500",
  },
  {
    quote: "The batch airdrop feature alone saves hours. Type one sentence, distribute tokens to your entire team.",
    name: "Maria Santos",
    role: "Community Manager",
    avatar: "MS",
    color: "from-purple-500 to-pink-500",
  },
  {
    quote: "The error protection is brilliant — it caught an insufficient balance before I wasted gas. Every chain needs this.",
    name: "James Wright",
    role: "DeFi Trader",
    avatar: "JW",
    color: "from-green-500 to-emerald-500",
  },
  {
    quote: "Seeing the balance diff before signing gives me confidence. No more blind signing anxiety.",
    name: "Priya Patel",
    role: "Portaldot Validator",
    avatar: "PP",
    color: "from-amber-500 to-orange-500",
  },
];

/* ══════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden scanline-overlay">
      {/* ── Background Layers ──────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Ambient orbs */}
        <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-cyan-500/[0.04] rounded-full blur-[100px]" />
        <div className="absolute top-[60%] right-[5%] w-[400px] h-[400px] bg-purple-500/[0.04] rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[300px] h-[300px] bg-green-500/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* ══════════════════════════════════════════════════════════
         ELEMENT 2: Sticky Header with Logo
         ══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" id="landing-logo">
            <Image src="/icon.svg" alt="Potdo" width={32} height={32} className="group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all duration-300" />
            <span className="text-lg font-bold tracking-tight font-[family-name:var(--font-display)]">
              Potdo
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-cyan-400 transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors duration-200">How it Works</a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors duration-200">FAQ</a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/edycutjong/potdo"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200"
            >
              <IconGitHub className="w-4.5 h-4.5" />
              <span>Source</span>
            </a>
            <Link
              href="/dashboard"
              id="header-launch-cta"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-500 text-slate-950 text-sm font-semibold hover:bg-cyan-400 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/25"
            >
              Launch App
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
         ELEMENT 3 & 4: Hero — Title, Subtitle, Primary CTA
         ELEMENT 6: Media — Terminal Demo (right column)
         ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-16 pb-24 px-6" id="hero">
        <div className="max-w-6xl mx-auto">
          {/* Two-column hero: text left, terminal right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left column — Text */}
            <div>
              {/* Hackathon badge */}
              <div className="animate-fade-in-up stagger-1">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-cyan-500/25 bg-cyan-500/5 text-cyan-400 text-sm font-[family-name:var(--font-jetbrains)]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  DoraHacks × Portaldot Online S1 2026
                </div>
              </div>

              {/* Title */}
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] font-[family-name:var(--font-display)] animate-fade-in-up stagger-2">
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-purple-400 to-cyan-400">
                  Talk to your
                </span>
                <br />
                <span className="text-white">blockchain.</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed max-w-lg animate-fade-in-up stagger-3">
                AI copilot that turns{" "}
                <span className="text-cyan-400 font-medium">plain English</span> into{" "}
                <span className="text-purple-400 font-medium">secure</span>,{" "}
                <span className="text-green-400 font-medium">visual</span>{" "}
                Portaldot transactions — see the state change before you sign.
              </p>
            </div>

            {/* Right column — Terminal Demo */}
            <div className="relative animate-fade-in-up stagger-3">
              {/* Ambient glow behind terminal */}
              <div className="absolute -inset-8 bg-cyan-500/[0.06] rounded-3xl blur-2xl pointer-events-none" />
              <TerminalDemo />
              <p className="text-center text-xs text-slate-500 mt-4 font-[family-name:var(--font-jetbrains)]">
                Live demo — watch the AI parse commands
              </p>
            </div>
          </div>

          {/* CTA Buttons — centered below hero */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-4">
            <Link
              href="/dashboard"
              id="hero-launch-cta"
              className="relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-cyan-500 text-slate-950 font-bold text-lg overflow-hidden animate-button-breathe hover:bg-cyan-400 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30"
            >
              <IconTerminal className="w-5 h-5 shrink-0" />
              Launch App
              <IconArrowRight className="w-4 h-4 shrink-0" />
              {/* Shimmer */}
              <span
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 3s linear infinite",
                }}
              />
            </Link>
            <a
              href="https://github.com/edycutjong/potdo"
              target="_blank"
              rel="noopener noreferrer"
              id="hero-source-cta"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-slate-700/80 text-slate-300 hover:text-white hover:border-cyan-500/40 hover:bg-white/[0.02] transition-all duration-200 hover:scale-105"
            >
              <IconGitHub className="w-5 h-5 shrink-0" />
              View Source
            </a>
          </div>

          {/* Stats row — full width below */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto animate-fade-in-up stagger-5">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="glass-card px-4 py-3 text-center">
                <p className={`text-2xl sm:text-3xl font-bold font-[family-name:var(--font-jetbrains)] ${stat.color} animate-count-pop stagger-${i + 5}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ══════════════════════════════════════════════════════════
         ELEMENT 7: Core Benefits / Features
         ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6" id="features">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-sm font-[family-name:var(--font-jetbrains)] text-cyan-400 uppercase tracking-[0.2em] mb-3">
              Core Features
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-display)]">
              Everything you need to{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400">
                transact safely
              </span>
            </h2>
          </div>

          {/* Feature grid — asymmetric 2-col + 3-col */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className={`gradient-border-card p-6 ${feature.borderHover} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 ${i < 2 ? "lg:col-span-1" : ""}`}
              >
                <div className={`w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-5.5 h-5.5 ${feature.color}`} />
                </div>
                <h3 className={`text-lg font-semibold font-[family-name:var(--font-display)] ${feature.color} mb-2`}>
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ══════════════════════════════════════════════════════════
         HOW IT WORKS (Conversion Path Visualization)
         ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6" id="how-it-works">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-[family-name:var(--font-jetbrains)] text-purple-400 uppercase tracking-[0.2em] mb-3">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-display)]">
              Three steps to{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">
                safe transactions
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className={`relative glass-card p-6 border ${item.borderColor}`}>
                {/* Step number */}
                <span className={`text-5xl font-bold font-[family-name:var(--font-display)] ${item.color} opacity-20 absolute top-4 right-5`}>
                  {item.step}
                </span>
                <h3 className={`text-lg font-semibold font-[family-name:var(--font-display)] ${item.color} mb-3 relative`}>
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed relative">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ══════════════════════════════════════════════════════════
         ELEMENT 8: Customer Testimonials
         ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6" id="testimonials">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-[family-name:var(--font-jetbrains)] text-green-400 uppercase tracking-[0.2em] mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-display)]">
              Trusted by{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-400">
                builders
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass-card p-6 hover:border-white/10 transition-all duration-300 hover:scale-[1.01]">
                {/* Quote mark */}
                <span className="text-4xl font-serif text-slate-700 leading-none select-none">&ldquo;</span>
                <p className="text-sm text-slate-300 leading-relaxed mt-1 mb-5">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  {/* Avatar circle */}
                  <div className={`w-10 h-10 rounded-full bg-linear-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ══════════════════════════════════════════════════════════
         ELEMENT 9: FAQ Section
         ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6" id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-[family-name:var(--font-jetbrains)] text-amber-400 uppercase tracking-[0.2em] mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-display)]">
              Common{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-400">
                questions
              </span>
            </h2>
          </div>

          <FAQSection />
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ══════════════════════════════════════════════════════════
         ELEMENT 10: Final CTA
         ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-6">
        <div className="max-w-3xl mx-auto text-center relative noise-bg">
          {/* Ambient glow */}
          <div className="absolute -inset-16 bg-cyan-500/[0.04] rounded-[40px] blur-3xl pointer-events-none" />

          <h2 className="relative text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-display)] leading-tight">
            Ready to stop{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-red-400 to-amber-400">
              signing blind?
            </span>
          </h2>
          <p className="relative mt-5 text-lg text-slate-400 max-w-xl mx-auto">
            Launch Potdo, connect your Portaldot wallet, and experience transactions the way they should be — visible, verifiable, and human.
          </p>
          <div className="relative mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              id="final-launch-cta"
              className="relative inline-flex items-center gap-2.5 px-10 py-4.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-lg overflow-hidden animate-button-breathe hover:bg-cyan-400 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30"
            >
              <IconTerminal className="w-5 h-5 shrink-0" />
              Launch App Now
              <IconArrowRight className="w-4 h-4 shrink-0" />
              <span
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 3s linear infinite",
                }}
              />
            </Link>
            <a
              href="https://github.com/edycutjong/potdo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4.5 rounded-xl border border-slate-700/80 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all duration-200 hover:scale-105"
            >
              <IconGitHub className="w-5 h-5 shrink-0" />
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
         ELEMENT 11: Footer
         ══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/5 bg-[#080810]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <Image src="/icon.svg" alt="Potdo" width={28} height={28} />
                <span className="text-lg font-bold tracking-tight font-[family-name:var(--font-display)]">Potdo</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                AI copilot that turns plain English into secure, visual Portaldot transactions. Built for the DoraHacks Portaldot Online S1 Hackathon 2026.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link></li>
                <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How it Works</a></li>
                <li><a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Sponsors */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Built For</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li>
                  <a href="https://portaldot.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-cyan-400 transition-colors">
                    <IconHexagon className="w-4 h-4" />
                    Portaldot
                  </a>
                </li>
                <li>
                  <a href="https://dorahacks.io/hackathon/portaldot-online-s1/detail" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-purple-400 transition-colors">
                    <IconCode className="w-4 h-4" />
                    DoraHacks
                  </a>
                </li>
                <li>
                  <a href="https://github.com/edycutjong/potdo" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                    <IconGitHub className="w-4 h-4" />
                    Source Code
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-600">
              © 2026 Edy Cu. MIT License.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <Link href="/dashboard" className="hover:text-slate-400 transition-colors">Privacy</Link>
              <Link href="/dashboard" className="hover:text-slate-400 transition-colors">Terms</Link>
              <a href="https://github.com/edycutjong/potdo/blob/main/SECURITY.md" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

/**
 * Animated terminal demo showing the Potdo workflow:
 * 1. Types "Send 10 POT to Alice" character by character
 * 2. Shows "Parsing intent..." with typing dots
 * 3. Renders a mini TransferCard preview
 * 4. Shows "✓ Transaction Confirmed!"
 * 5. Loops with a pause between cycles
 *
 * All phases are always rendered in the DOM for fixed height.
 * Visibility is controlled via opacity transitions.
 */

const COMMAND = "Send 10 POT to Alice";
const TYPING_SPEED = 55; // ms per character
const PHASE_PAUSE = 900; // ms between phases
const RESET_PAUSE = 3500; // ms before restarting

type Phase = "typing" | "parsing" | "preview" | "confirmed";

function CheckCircleIcon({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function BoltIcon({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function TerminalDemo() {
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedChars, setTypedChars] = useState(0);

  // Typing phase — add one character at a time
  useEffect(() => {
    if (phase !== "typing") return;
    if (typedChars >= COMMAND.length) {
      const timer = setTimeout(() => setPhase("parsing"), PHASE_PAUSE);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setTypedChars((c) => c + 1), TYPING_SPEED);
    return () => clearTimeout(timer);
  }, [phase, typedChars]);

  // Phase sequencing — each timeout callback sets state (async, not synchronous)
  useEffect(() => {
    if (phase === "parsing") {
      const timer = setTimeout(() => setPhase("preview"), 1200);
      return () => clearTimeout(timer);
    }
    if (phase === "preview") {
      const timer = setTimeout(() => setPhase("confirmed"), PHASE_PAUSE);
      return () => clearTimeout(timer);
    }
    if (phase === "confirmed") {
      const timer = setTimeout(() => {
        setTypedChars(0);
        setPhase("typing");
      }, RESET_PAUSE);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const showParsing = phase === "parsing" || phase === "preview" || phase === "confirmed";
  const showPreview = phase === "preview" || phase === "confirmed";
  const showConfirmed = phase === "confirmed";

  return (
    <div className="glass-card-glow animate-float mx-auto max-w-lg p-5 text-left">
      {/* Terminal header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-amber-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
        </div>
        <span className="ml-2 font-(family-name:--font-jetbrains) text-xs text-slate-500">
          potdo terminal
        </span>
      </div>

      {/* Command input line */}
      <div className="space-y-3 font-(family-name:--font-jetbrains) text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs text-cyan-500">❯</span>
          <span className="text-slate-200">{COMMAND.slice(0, typedChars)}</span>
          {phase === "typing" && (
            <span className="animate-blink inline-block h-4 w-2 bg-cyan-400" />
          )}
        </div>

        {/* Parsing — always in DOM, opacity-controlled */}
        <div
          className={`flex items-center gap-2 text-xs text-purple-400 transition-opacity duration-300 ${showParsing ? "opacity-100" : "opacity-0"}`}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
          Parsing intent...
        </div>

        {/* Preview card — always in DOM, opacity-controlled */}
        <div
          className={`space-y-2 rounded-lg border border-cyan-500/20 bg-white/5 p-3 transition-opacity duration-300 ${showPreview ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-wider text-slate-500 uppercase">
              Transfer Preview
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-400">
              <BoltIcon className="h-3 w-3" />
              Portaldot
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500">To</span>
              <p className="font-semibold text-slate-200">Alice</p>
            </div>
            <div>
              <span className="text-slate-500">Amount</span>
              <p className="font-bold text-cyan-400">10.0000 POT</p>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-2 text-xs">
            <span className="text-slate-500">Balance After</span>
            <span className="text-green-400">490.0000 POT</span>
          </div>
        </div>

        {/* Confirmed — always in DOM, opacity-controlled */}
        <div
          className={`flex items-center gap-2 text-sm text-green-400 transition-opacity duration-300 ${showConfirmed ? "opacity-100" : "opacity-0"}`}
        >
          <CheckCircleIcon className="h-5 w-5 shrink-0" />
          <span className="font-semibold">Transaction Confirmed!</span>
          <span className="text-xs text-slate-500">Block #142,857</span>
        </div>
      </div>
    </div>
  );
}

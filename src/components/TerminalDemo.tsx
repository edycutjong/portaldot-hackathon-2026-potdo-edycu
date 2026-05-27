"use client";

import { useState, useEffect } from "react";

/**
 * Animated terminal demo showing the Potdo workflow:
 * 1. Types "Send 10 POT to Alice" character by character
 * 2. Shows "Parsing intent..." with typing dots
 * 3. Renders a mini TransferCard preview
 * 4. Shows "✅ Transaction Confirmed!"
 * 5. Loops with a pause between cycles
 */

const COMMAND = "Send 10 POT to Alice";
const TYPING_SPEED = 55; // ms per character
const PHASE_PAUSE = 900; // ms between phases
const RESET_PAUSE = 3500; // ms before restarting

type Phase = "typing" | "parsing" | "preview" | "confirmed";

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

  return (
    <div className="glass-card-glow p-5 max-w-lg mx-auto text-left animate-float">
      {/* Terminal header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-amber-500/70" />
          <span className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <span className="text-xs text-slate-500 font-(family-name:--font-jetbrains) ml-2">
          potdo terminal
        </span>
      </div>

      {/* Command input line */}
      <div className="font-(family-name:--font-jetbrains) text-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-cyan-500 text-xs">❯</span>
          <span className="text-slate-200">
            {COMMAND.slice(0, typedChars)}
          </span>
          {phase === "typing" && (
            <span className="w-2 h-4 bg-cyan-400 animate-blink inline-block" />
          )}
        </div>

        {/* Parsing phase */}
        {(phase === "parsing" || phase === "preview" || phase === "confirmed") && (
          <div className="flex items-center gap-2 text-purple-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Parsing intent...
          </div>
        )}

        {/* Preview card */}
        {(phase === "preview" || phase === "confirmed") && (
          <div className="bg-white/5 border border-cyan-500/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Transfer Preview</span>
              <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">⚡ Portaldot</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">To</span>
                <p className="text-slate-200 font-semibold">Alice</p>
              </div>
              <div>
                <span className="text-slate-500">Amount</span>
                <p className="text-cyan-400 font-bold">10.0000 POT</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2 mt-1">
              <span className="text-slate-500">Balance After</span>
              <span className="text-green-400">490.0000 POT</span>
            </div>
          </div>
        )}

        {/* Confirmed */}
        {phase === "confirmed" && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <span>✅</span>
            <span className="font-semibold">Transaction Confirmed!</span>
            <span className="text-slate-500 text-xs">Block #142,857</span>
          </div>
        )}
      </div>
    </div>
  );
}

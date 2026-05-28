"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { TxResult } from "@/lib/types";

interface TxConfirmationProps {
  txResult: TxResult;
}

/**
 * Canvas confetti burst effect.
 */
function useConfetti(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    canvas.width = canvas.offsetWidth || 400;
    canvas.height = canvas.offsetHeight || 300;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      life: number;
    }> = [];

    const colors = ["#06b6d4", "#22c55e", "#a855f7", "#f59e0b", "#ef4444", "#ec4899"];

    // Create particles with slightly randomized life
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 2,
        life: Math.random() * 0.4 + 0.8,
      });
    }

    let animFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.life -= 0.015;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      ctx.globalAlpha = 1;
      if (alive) {
        animFrame = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => cancelAnimationFrame(animFrame);
  }, [canvasRef]);
}

export function TxConfirmation({ txResult }: TxConfirmationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useConfetti(canvasRef);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15 }}
      className="glass-card glow-green relative mt-3 max-w-md overflow-hidden border-green-500/30 p-5"
    >
      {/* Confetti canvas */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      <div className="relative z-10 text-center">
        {/* Green checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 10 }}
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-400 bg-green-500/20"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>

        <h3 className="mb-1 text-lg font-bold text-green-400">Transaction Confirmed!</h3>

        {txResult.blockNumber && (
          <p className="font-(family-name:--font-jetbrains) text-sm text-slate-400">
            Block #{txResult.blockNumber.toLocaleString()}
          </p>
        )}

        {txResult.txHash &&
          (txResult.txHash.startsWith("0xdemo") ? (
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-amber-400">
              Demo Transaction ✨
            </span>
          ) : (
            <a
              href={txResult.explorerUrl || `#tx-${txResult.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-cyan-400 transition-colors hover:text-cyan-300"
            >
              View on Explorer →
            </a>
          ))}
      </div>
    </motion.div>
  );
}

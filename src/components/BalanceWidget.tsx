"use client";

import { motion } from "framer-motion";
import { TOKEN_SYMBOL, CHAIN_NAME } from "@/lib/constants";

interface BalanceWidgetProps {
  free?: string;
  reserved?: string;
  frozen?: string;
}

export function BalanceWidget({
  free = "—",
  reserved = "0.0000",
  frozen = "0.0000",
}: BalanceWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="glass-card mt-3 max-w-sm border-green-500/20 p-5"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">💰</span>
        <h3 className="text-sm font-semibold text-slate-200">Balance</h3>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          {CHAIN_NAME}
        </span>
      </div>

      {/* Free balance (large) */}
      <div className="mb-4 text-center">
        <p className="font-(family-name:--font-jetbrains) text-3xl font-bold text-green-400">
          {free}
        </p>
        <p className="mt-1 text-xs text-slate-500">{TOKEN_SYMBOL} (Free)</p>
      </div>

      {/* Reserved + Frozen */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/5 p-2 text-center">
          <p className="font-(family-name:--font-jetbrains) text-sm text-amber-400">{reserved}</p>
          <p className="mt-0.5 text-xs text-slate-600">Reserved</p>
        </div>
        <div className="rounded-lg bg-white/5 p-2 text-center">
          <p className="font-(family-name:--font-jetbrains) text-sm text-slate-400">{frozen}</p>
          <p className="mt-0.5 text-xs text-slate-600">Frozen</p>
        </div>
      </div>
    </motion.div>
  );
}

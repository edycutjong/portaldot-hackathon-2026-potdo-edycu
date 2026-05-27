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
      className="glass-card p-5 mt-3 max-w-sm border-green-500/20"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💰</span>
        <h3 className="text-sm font-semibold text-slate-200">
          Balance
        </h3>
        <span className="ml-auto text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          {CHAIN_NAME}
        </span>
      </div>

      {/* Free balance (large) */}
      <div className="text-center mb-4">
        <p className="text-3xl font-bold text-green-400 font-(family-name:--font-jetbrains)">
          {free}
        </p>
        <p className="text-xs text-slate-500 mt-1">{TOKEN_SYMBOL} (Free)</p>
      </div>

      {/* Reserved + Frozen */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-2 rounded-lg bg-white/5">
          <p className="text-sm text-amber-400 font-(family-name:--font-jetbrains)">
            {reserved}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">Reserved</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/5">
          <p className="text-sm text-slate-400 font-(family-name:--font-jetbrains)">
            {frozen}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">Frozen</p>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { truncateAddress, formatPot, potToPlanck } from "@/lib/format";
import { TOKEN_SYMBOL } from "@/lib/constants";
import type { TransferIntent, TxStatus } from "@/lib/types";

interface TransferCardProps {
  intent: TransferIntent;
  senderBalance?: bigint;
  isConnected?: boolean;
  status?: TxStatus;
  onExecute?: () => void;
}

export function TransferCard({
  intent,
  senderBalance,
  isConnected = false,
  status,
  onExecute,
}: TransferCardProps) {
  const amountPlanck = potToPlanck(intent.amount);
  const hasBalance = senderBalance !== undefined;
  const insufficient = hasBalance && senderBalance < amountPlanck;
  const afterBalance = hasBalance ? senderBalance - amountPlanck : undefined;
  const isProcessing = status === "pending" || status === "submitted" || status === "in_block";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`glass-card p-5 mt-3 max-w-md ${
        insufficient && isConnected ? "border-red-500/30 pulse-red-border" : "border-cyan-500/20"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🔄</span>
        <h3 className="text-sm font-semibold text-slate-200">
          Transfer Preview
        </h3>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">From</span>
          <span className="text-slate-300">You</span>
        </div>
        {hasBalance && (
          <div className="flex justify-between">
            <span className="text-slate-500">Balance</span>
            <span className="font-[family-name:var(--font-jetbrains)] text-slate-300">
              {formatPot(senderBalance)}
            </span>
          </div>
        )}
        <div className="border-t border-white/5 my-2" />
        <div className="flex justify-between">
          <span className="text-slate-500">To</span>
          <span className="text-slate-300">
            {intent.to}{" "}
            <span className="text-slate-600 font-[family-name:var(--font-jetbrains)] text-xs">
              ({truncateAddress(intent.toAddress)})
            </span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Amount</span>
          <span className="text-cyan-400 font-semibold font-[family-name:var(--font-jetbrains)]">
            {intent.amount.toFixed(2)} {TOKEN_SYMBOL}
          </span>
        </div>

        {/* After balance diff */}
        {hasBalance && !insufficient && afterBalance !== undefined && (
          <div className="flex justify-between">
            <span className="text-slate-500">⚡ After</span>
            <span className="text-amber-400 font-[family-name:var(--font-jetbrains)]">
              {formatPot(afterBalance)} →{" "}
              <span className="text-red-400">
                -{intent.amount.toFixed(2)}
              </span>
            </span>
          </div>
        )}

        {/* Gas estimate */}
        <div className="flex justify-between">
          <span className="text-slate-500">Gas</span>
          <span className="text-slate-600 font-[family-name:var(--font-jetbrains)]">
            ~0.001 {TOKEN_SYMBOL}
          </span>
        </div>
      </div>

      {/* Insufficient balance warning */}
      {insufficient && isConnected && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          ⚠️ Insufficient Balance! You have {formatPot(senderBalance)} — this
          transfer requires {intent.amount.toFixed(2)} {TOKEN_SYMBOL}
        </div>
      )}

      {/* Execute button */}
      <button
        onClick={onExecute}
        disabled={(insufficient && isConnected) || isProcessing}
        className={`mt-4 w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
          (insufficient && isConnected) || isProcessing
            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
            : "bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 hover:from-cyan-400 hover:to-cyan-300 glow-cyan"
        }`}
        id="execute-transfer"
      >
        {!isConnected
          ? "🔌 Connect Wallet to Execute"
          : isProcessing
          ? "⏳ Processing..."
          : insufficient
          ? "Cannot Execute"
          : "✅ Execute Transfer"}
      </button>
    </motion.div>
  );
}

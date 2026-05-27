"use client";

import { motion } from "framer-motion";
import { TOKEN_SYMBOL } from "@/lib/constants";
import { truncateAddress, formatPot, potToPlanck } from "@/lib/format";
import type { BatchTransferIntent, TxStatus } from "@/lib/types";

interface BatchCardProps {
  intent: BatchTransferIntent;
  senderBalance?: bigint;
  isConnected?: boolean;
  status?: TxStatus;
  onExecute?: () => void;
}

export function BatchCard({
  intent,
  senderBalance,
  isConnected = false,
  status,
  onExecute,
}: BatchCardProps) {
  const totalAmount = intent.transfers.reduce((sum, t) => sum + t.amount, 0);
  const totalAmountPlanck = potToPlanck(totalAmount);
  const hasBalance = senderBalance !== undefined;
  const insufficient = hasBalance && senderBalance < totalAmountPlanck;
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
        <span className="text-lg">📦</span>
        <h3 className="text-sm font-semibold text-slate-200">
          Batch Airdrop Preview
        </h3>
        <span className="ml-auto text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
          {intent.transfers.length} recipients
        </span>
      </div>

      {/* Transfers table */}
      <div className="rounded-lg overflow-hidden border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-slate-500 text-xs">
              <th className="text-left px-3 py-2">Recipient</th>
              <th className="text-right px-3 py-2">Amount</th>
              <th className="text-right px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {intent.transfers.map((t, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="px-3 py-2 text-slate-300">
                  {t.to}{" "}
                  <span className="text-slate-600 font-(family-name:--font-jetbrains) text-xs">
                    ({truncateAddress(t.toAddress)})
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-cyan-400 font-(family-name:--font-jetbrains)">
                  {t.amount.toFixed(2)} {TOKEN_SYMBOL}
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="text-amber-400">🟡</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-3 space-y-1.5 text-sm">
        {hasBalance && (
          <div className="flex justify-between">
            <span className="text-slate-500">Balance</span>
            <span className="font-(family-name:--font-jetbrains) text-slate-300">
              {formatPot(senderBalance)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">Total</span>
          <span className="text-cyan-400 font-semibold font-(family-name:--font-jetbrains)">
            {totalAmount.toFixed(2)} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Gas</span>
          <span className="text-slate-600 font-(family-name:--font-jetbrains)">
            ~0.003 {TOKEN_SYMBOL}
          </span>
        </div>
      </div>

      {/* Insufficient balance warning */}
      {insufficient && isConnected && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          ⚠️ Insufficient Balance! You have {formatPot(senderBalance)} — this
          batch requires {totalAmount.toFixed(2)} {TOKEN_SYMBOL}
        </div>
      )}

      {/* Execute button */}
      <button
        onClick={onExecute}
        disabled={(insufficient && isConnected) || isProcessing}
        className={`mt-4 w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
          (insufficient && isConnected) || isProcessing
            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
            : "bg-linear-to-r from-cyan-500 to-cyan-400 text-slate-900 hover:from-cyan-400 hover:to-cyan-300 glow-cyan"
        }`}
        id="execute-batch"
      >
        {!isConnected
          ? "🔌 Connect Wallet to Execute"
          : isProcessing
          ? "⏳ Processing..."
          : insufficient
          ? "Cannot Execute"
          : "📦 Execute Batch"}
      </button>
    </motion.div>
  );
}

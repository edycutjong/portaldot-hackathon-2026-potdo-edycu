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
  senderAddress?: string;
  senderName?: string;
}

export function BatchCard({
  intent,
  senderBalance,
  isConnected = false,
  status,
  onExecute,
  senderAddress,
  senderName,
}: BatchCardProps) {
  const totalAmount = intent.transfers.reduce((sum, t) => sum + t.amount, 0);
  const totalAmountPlanck = potToPlanck(totalAmount);
  const hasBalance = senderBalance !== undefined;
  const insufficient = hasBalance && senderBalance < totalAmountPlanck;
  const isProcessing = status === "pending" || status === "submitted" || status === "in_block";
  const hasSelfTransfer =
    isConnected && !!senderAddress && intent.transfers.some((t) => t.toAddress === senderAddress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`glass-card mt-3 max-w-md p-5 ${
        (insufficient || hasSelfTransfer) && isConnected
          ? "pulse-red-border border-red-500/30"
          : "border-cyan-500/20"
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">📦</span>
        <h3 className="text-sm font-semibold text-slate-200">Batch Airdrop Preview</h3>
        <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-500">
          {intent.transfers.length} recipients
        </span>
      </div>

      {/* Transfers table */}
      <div className="overflow-hidden rounded-lg border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-xs text-slate-500">
              <th className="px-3 py-2 text-left">Recipient</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {intent.transfers.map((t, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="px-3 py-2 text-slate-300">
                  {t.to}{" "}
                  <span className="font-(family-name:--font-jetbrains) text-xs text-slate-600">
                    ({truncateAddress(t.toAddress)})
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-(family-name:--font-jetbrains) text-cyan-400">
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
      <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">From</span>
          <span className="text-slate-300">
            {senderAddress ? (
              <>
                You{" "}
                <span className="ml-1 text-xs font-normal text-slate-400">
                  ({senderName || "Guest"} - {truncateAddress(senderAddress)})
                </span>
              </>
            ) : (
              "You"
            )}
          </span>
        </div>
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
          <span className="font-(family-name:--font-jetbrains) font-semibold text-cyan-400">
            {totalAmount.toFixed(2)} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Gas</span>
          <span className="font-(family-name:--font-jetbrains) text-slate-600">
            ~0.003 {TOKEN_SYMBOL}
          </span>
        </div>
      </div>

      {/* Insufficient balance warning */}
      {insufficient && isConnected && !hasSelfTransfer && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
          ⚠️ Insufficient Balance! You have {formatPot(senderBalance)} — this batch requires{" "}
          {totalAmount.toFixed(2)} {TOKEN_SYMBOL}
        </div>
      )}

      {/* Self-transfer warning */}
      {hasSelfTransfer && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
          ⚠️ Cannot send tokens to yourself! One or more recipients match the sender address.
        </div>
      )}

      {/* Execute button */}
      <button
        onClick={onExecute}
        disabled={(insufficient && isConnected) || hasSelfTransfer || isProcessing}
        className={`mt-4 w-full cursor-pointer rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
          (insufficient && isConnected) || hasSelfTransfer || isProcessing
            ? "cursor-not-allowed bg-slate-800 text-slate-600"
            : "glow-cyan bg-linear-to-r from-cyan-500 to-cyan-400 text-slate-900 hover:from-cyan-400 hover:to-cyan-300"
        }`}
        id="execute-batch"
      >
        {!isConnected
          ? "🔌 Connect Wallet to Execute"
          : isProcessing
            ? "⏳ Processing..."
            : hasSelfTransfer
              ? "Cannot Send to Yourself"
              : insufficient
                ? "Cannot Execute"
                : "📦 Execute Batch"}
      </button>
    </motion.div>
  );
}

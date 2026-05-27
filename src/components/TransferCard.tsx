"use client";

import { motion } from "framer-motion";
import { truncateAddress, formatPot, potToPlanck, planckToPot } from "@/lib/format";
import { TOKEN_SYMBOL } from "@/lib/constants";
import type { TransferIntent, TxStatus } from "@/lib/types";

interface TransferCardProps {
  intent: TransferIntent;
  senderBalance?: bigint;
  isConnected?: boolean;
  status?: TxStatus;
  onExecute?: () => void;
  senderAddress?: string;
  senderName?: string;
}

export function TransferCard({
  intent,
  senderBalance,
  isConnected = false,
  status,
  onExecute,
  senderAddress,
  senderName,
}: TransferCardProps) {
  const isMaxTransfer = intent.amount === -1;
  const gasFeePot = 0.0012; // matching WalletContext.tsx execution cost estimate
  const gasFeePlanck = potToPlanck(gasFeePot);

  const hasBalance = senderBalance !== undefined;
  const maxSendPlanck = hasBalance && senderBalance > gasFeePlanck ? senderBalance - gasFeePlanck : 0n;
  const displayAmount = isMaxTransfer ? Number(planckToPot(maxSendPlanck)) : intent.amount;

  const amountPlanck = potToPlanck(displayAmount);
  const insufficient = hasBalance && !isMaxTransfer && senderBalance < amountPlanck;
  const afterBalance = hasBalance
    ? isMaxTransfer
      ? 0n
      : senderBalance - amountPlanck >= gasFeePlanck
      ? senderBalance - amountPlanck - gasFeePlanck
      : 0n
    : undefined;
  const isProcessing = status === "pending" || status === "submitted" || status === "in_block";
  const isSelfTransfer = isConnected && !!senderAddress && intent.toAddress === senderAddress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`glass-card p-5 mt-3 max-w-md ${
        (insufficient || isSelfTransfer) && isConnected ? "border-red-500/30 pulse-red-border" : "border-cyan-500/20"
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
          <span className="text-slate-300">
            {senderAddress ? (
              <>
                You{" "}
                <span className="text-slate-400 text-xs ml-1 font-normal">
                  ({senderName || "Guest"} -{" "}
                  <span className="font-(family-name:--font-jetbrains)">
                    {truncateAddress(senderAddress)}
                  </span>
                  )
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
        <div className="border-t border-white/5 my-2" />
        <div className="flex justify-between">
          <span className="text-slate-500">To</span>
          <span className="text-slate-300">
            {intent.to}{" "}
            <span className="text-slate-600 font-(family-name:--font-jetbrains) text-xs">
              ({truncateAddress(intent.toAddress)})
            </span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Amount</span>
          <span className="text-cyan-400 font-semibold font-(family-name:--font-jetbrains)">
            {isMaxTransfer ? "Max (" : ""}{displayAmount.toFixed(4)} {TOKEN_SYMBOL}{isMaxTransfer ? ")" : ""}
          </span>
        </div>

        {/* After balance diff */}
        {hasBalance && !insufficient && afterBalance !== undefined && (
          <div className="flex justify-between">
            <span className="text-slate-500">⚡ After</span>
            <span className="text-amber-400 font-(family-name:--font-jetbrains)">
              {formatPot(senderBalance)} →{" "}
              <span className="text-slate-300">
                {formatPot(afterBalance)}
              </span>
            </span>
          </div>
        )}

        {/* Gas estimate */}
        <div className="flex justify-between">
          <span className="text-slate-500">Gas</span>
          <span className="text-slate-600 font-(family-name:--font-jetbrains)">
            ~0.0012 {TOKEN_SYMBOL}
          </span>
        </div>
      </div>

      {/* Insufficient balance warning */}
      {insufficient && isConnected && !isSelfTransfer && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          ⚠️ Insufficient Balance! You have {formatPot(senderBalance)} — this
          transfer requires {displayAmount.toFixed(4)} {TOKEN_SYMBOL}
        </div>
      )}

      {/* Self-transfer warning */}
      {isSelfTransfer && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          ⚠️ Cannot send tokens to yourself! Sender and recipient addresses are identical.
        </div>
      )}

      {/* Execute button */}
      <button
        onClick={onExecute}
        disabled={(insufficient && isConnected) || isSelfTransfer || isProcessing}
        className={`mt-4 w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
          ((insufficient && isConnected) || isSelfTransfer || isProcessing)
            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
            : "bg-linear-to-r from-cyan-500 to-cyan-400 text-slate-900 hover:from-cyan-400 hover:to-cyan-300 glow-cyan"
        }`}
        id="execute-transfer"
      >
        {!isConnected
          ? "🔌 Connect Wallet to Execute"
          : isProcessing
          ? "⏳ Processing..."
          : isSelfTransfer
          ? "Cannot Send to Yourself"
          : insufficient
          ? "Cannot Execute"
          : "✅ Execute Transfer"}
      </button>
    </motion.div>
  );
}

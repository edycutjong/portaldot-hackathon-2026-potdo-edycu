"use client";

import { motion } from "framer-motion";
import type { TxResult } from "@/lib/types";

interface TxErrorProps {
  txResult: TxResult;
}

/** Translate Substrate error codes to plain English. */
function translateError(error?: string): {
  message: string;
  suggestion: string;
} {
  if (!error) {
    return {
      message: "Transaction failed with an unknown error.",
      suggestion: "Try again or check the Portaldot explorer.",
    };
  }

  const lower = error.toLowerCase();

  if (lower.includes("insufficient") || lower.includes("balance")) {
    return {
      message: "Insufficient balance to complete this transaction.",
      suggestion:
        "Make sure you have enough POT to cover the transfer amount plus gas fees (~0.001 POT).",
    };
  }

  if (lower.includes("nonce")) {
    return {
      message: "Transaction nonce mismatch — another transaction may be pending.",
      suggestion: "Wait a few seconds for the pending transaction to finalize, then try again.",
    };
  }

  if (lower.includes("signature") || lower.includes("sign")) {
    return {
      message: "Transaction signature was rejected.",
      suggestion: "You may have cancelled the signing in your wallet. Try again and approve the signature.",
    };
  }

  if (lower.includes("cancelled") || lower.includes("rejected")) {
    return {
      message: "You cancelled the transaction.",
      suggestion: "No funds were moved. You can try again whenever you're ready.",
    };
  }

  return {
    message: error,
    suggestion: "Check the Portaldot explorer for more details.",
  };
}

export function TxError({ txResult }: TxErrorProps) {
  const { message, suggestion } = translateError(txResult.error);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 20 }}
      className="glass-card p-5 mt-3 max-w-md border-red-500/30 pulse-red-border"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
          <span className="text-red-400 text-lg">✕</span>
        </div>
        <h3 className="text-sm font-semibold text-red-400">
          Transaction Failed
        </h3>
      </div>

      <p className="text-sm text-slate-300 mb-2">{message}</p>
      <p className="text-xs text-slate-500">💡 {suggestion}</p>

      {txResult.error && (
        <div className="mt-3 p-2 rounded-md bg-white/5 border border-white/5">
          <p className="text-xs text-slate-600 font-[family-name:var(--font-jetbrains)] break-all">
            {txResult.error}
          </p>
        </div>
      )}
    </motion.div>
  );
}

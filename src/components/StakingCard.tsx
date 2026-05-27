"use client";

import type { StakeIntent, UnstakeIntent, TxStatus } from "@/lib/types";
import { TOKEN_SYMBOL } from "@/lib/constants";

interface StakingCardProps {
  intent: StakeIntent | UnstakeIntent;
  senderBalance: bigint;
  isConnected: boolean;
  status?: TxStatus;
  onExecute: () => void;
}

export function StakingCard({ intent, senderBalance, isConnected, status, onExecute }: StakingCardProps) {
  const isStake = intent.action === "stake";
  const amount = intent.amount;
  const balancePot = Number(senderBalance) / 1e14;
  const hasEnough = isStake ? balancePot >= amount : true;
  const isPending = status === "pending" || status === "submitted";

  return (
    <div className="glass-card p-4 mt-2 max-w-md" id={`${intent.action}-card`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${isStake ? "bg-indigo-400" : "bg-amber-400"}`} />
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
          {isStake ? "Stake" : "Unstake"} Preview
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Action</span>
          <span className={isStake ? "text-indigo-400 font-semibold" : "text-amber-400 font-semibold"}>
            {isStake ? "Bond & Nominate" : "Unbond"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Amount</span>
          <span className="text-slate-200 font-[family-name:var(--font-jetbrains)]">
            {amount} {TOKEN_SYMBOL}
          </span>
        </div>
        {isStake && "validator" in intent && intent.validator && (
          <div className="flex justify-between">
            <span className="text-slate-500">Validator</span>
            <span className="text-slate-200 font-[family-name:var(--font-jetbrains)] text-xs truncate max-w-[200px]">
              {intent.validator}
            </span>
          </div>
        )}
        {!isStake && (
          <div className="flex justify-between">
            <span className="text-slate-500">Note</span>
            <span className="text-amber-400 text-xs">~28 era unbonding period</span>
          </div>
        )}
      </div>

      {!hasEnough && (
        <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-400">
            Insufficient balance. You have {balancePot.toFixed(4)} {TOKEN_SYMBOL}.
          </p>
        </div>
      )}

      <button
        onClick={onExecute}
        disabled={(isConnected && !hasEnough) || isPending}
        className={`mt-3 w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
          isPending
            ? "bg-slate-700 text-slate-400 cursor-wait"
            : hasEnough
              ? isStake
                ? "bg-indigo-500 text-white hover:bg-indigo-400"
                : "bg-amber-500 text-slate-950 hover:bg-amber-400"
              : "bg-slate-800 text-slate-600 cursor-not-allowed"
        }`}
        id={`${intent.action}-execute`}
      >
        {isPending ? "Processing..." : !isConnected ? "Connect Wallet" : isStake ? "Execute Stake" : "Execute Unstake"}
      </button>
    </div>
  );
}

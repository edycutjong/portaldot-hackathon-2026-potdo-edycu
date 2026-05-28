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

export function StakingCard({
  intent,
  senderBalance,
  isConnected,
  status,
  onExecute,
}: StakingCardProps) {
  const isStake = intent.action === "stake";
  const amount = intent.amount;
  const balancePot = Number(senderBalance) / 1e14;
  const hasEnough = isStake ? balancePot >= amount : true;
  const isPending = status === "pending" || status === "submitted";

  return (
    <div className="glass-card mt-2 max-w-md p-4" id={`${intent.action}-card`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${isStake ? "bg-indigo-400" : "bg-amber-400"}`} />
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {isStake ? "Stake" : "Unstake"} Preview
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Action</span>
          <span
            className={isStake ? "font-semibold text-indigo-400" : "font-semibold text-amber-400"}
          >
            {isStake ? "Bond & Nominate" : "Unbond"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Amount</span>
          <span className="font-(family-name:--font-jetbrains) text-slate-200">
            {amount} {TOKEN_SYMBOL}
          </span>
        </div>
        {isStake && "validator" in intent && intent.validator && (
          <div className="flex justify-between">
            <span className="text-slate-500">Validator</span>
            <span className="max-w-[200px] truncate font-(family-name:--font-jetbrains) text-xs text-slate-200">
              {intent.validator}
            </span>
          </div>
        )}
        {!isStake && (
          <div className="flex justify-between">
            <span className="text-slate-500">Note</span>
            <span className="text-xs text-amber-400">~28 era unbonding period</span>
          </div>
        )}
      </div>

      {!hasEnough && (
        <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-2">
          <p className="text-xs text-red-400">
            Insufficient balance. You have {balancePot.toFixed(4)} {TOKEN_SYMBOL}.
          </p>
        </div>
      )}

      <button
        onClick={onExecute}
        disabled={(isConnected && !hasEnough) || isPending}
        className={`mt-3 w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
          isPending
            ? "cursor-wait bg-slate-700 text-slate-400"
            : hasEnough
              ? isStake
                ? "bg-indigo-500 text-white hover:bg-indigo-400"
                : "bg-amber-500 text-slate-950 hover:bg-amber-400"
              : "cursor-not-allowed bg-slate-800 text-slate-600"
        }`}
        id={`${intent.action}-execute`}
      >
        {isPending
          ? "Processing..."
          : !isConnected
            ? "Connect Wallet"
            : isStake
              ? "Execute Stake"
              : "Execute Unstake"}
      </button>
    </div>
  );
}

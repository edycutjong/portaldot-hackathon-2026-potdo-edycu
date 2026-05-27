"use client";

import type { SetIdentityIntent, TxStatus } from "@/lib/types";

interface SetIdentityCardProps {
  intent: SetIdentityIntent;
  isConnected: boolean;
  status?: TxStatus;
  onExecute: () => void;
}

export function SetIdentityCard({ intent, isConnected, status, onExecute }: SetIdentityCardProps) {
  const isPending = status === "pending" || status === "submitted";

  return (
    <div className="glass-card p-4 mt-2 max-w-md" id="set-identity-card">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-violet-400" />
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
          Set Identity Preview
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Action</span>
          <span className="text-violet-400 font-semibold">Set Display Name</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Display Name</span>
          <span className="text-slate-200 font-(family-name:--font-jetbrains)">
            {intent.displayName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Pallet</span>
          <span className="text-slate-400 text-xs font-(family-name:--font-jetbrains)">
            identity.setIdentity
          </span>
        </div>
      </div>

      <button
        onClick={onExecute}
        disabled={isPending}
        className={`mt-3 w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
          isPending
            ? "bg-slate-700 text-slate-400 cursor-wait"
            : "bg-violet-500 text-white hover:bg-violet-400"
        }`}
        id="set-identity-execute"
      >
        {isPending ? "Processing..." : !isConnected ? "Connect Wallet" : "Set Identity"}
      </button>
    </div>
  );
}

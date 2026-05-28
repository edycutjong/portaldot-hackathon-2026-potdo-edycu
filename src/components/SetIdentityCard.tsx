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
    <div className="glass-card mt-2 max-w-md p-4" id="set-identity-card">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-violet-400" />
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Set Identity Preview
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Action</span>
          <span className="font-semibold text-violet-400">Set Display Name</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Display Name</span>
          <span className="font-(family-name:--font-jetbrains) text-slate-200">
            {intent.displayName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Pallet</span>
          <span className="font-(family-name:--font-jetbrains) text-xs text-slate-400">
            identity.setIdentity
          </span>
        </div>
      </div>

      <button
        onClick={onExecute}
        disabled={isPending}
        className={`mt-3 w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
          isPending
            ? "cursor-wait bg-slate-700 text-slate-400"
            : "bg-violet-500 text-white hover:bg-violet-400"
        }`}
        id="set-identity-execute"
      >
        {isPending ? "Processing..." : !isConnected ? "Connect Wallet" : "Set Identity"}
      </button>
    </div>
  );
}

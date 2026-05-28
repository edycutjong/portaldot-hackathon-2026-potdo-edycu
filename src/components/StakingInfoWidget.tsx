"use client";

import type { StakingInfo } from "@/lib/types";
import { TOKEN_SYMBOL } from "@/lib/constants";

interface StakingInfoWidgetProps {
  info: StakingInfo;
}

export function StakingInfoWidget({ info }: StakingInfoWidgetProps) {
  return (
    <div className="glass-card mt-2 max-w-md p-4" id="staking-info-widget">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-indigo-400" />
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Staking Overview
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Bonded</span>
          <span className="font-(family-name:--font-jetbrains) font-semibold text-indigo-400">
            {info.bonded} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Active Stake</span>
          <span className="font-(family-name:--font-jetbrains) text-green-400">
            {info.active} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Unlocking</span>
          <span className="font-(family-name:--font-jetbrains) text-amber-400">
            {info.unlocking} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Rewards</span>
          <span className="text-slate-200">{info.rewardDestination}</span>
        </div>
      </div>

      {info.nominations.length > 0 && (
        <div className="mt-3 border-t border-white/5 pt-3">
          <p className="mb-2 text-xs text-slate-500">
            Nominated Validators ({info.nominations.length})
          </p>
          <div className="space-y-1">
            {info.nominations.map((addr, i) => (
              <p
                key={addr}
                className="truncate font-(family-name:--font-jetbrains) text-xs text-slate-400"
              >
                {i + 1}. {addr.slice(0, 8)}...{addr.slice(-6)}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

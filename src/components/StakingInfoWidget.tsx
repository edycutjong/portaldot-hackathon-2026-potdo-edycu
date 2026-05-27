"use client";

import type { StakingInfo } from "@/lib/types";
import { TOKEN_SYMBOL } from "@/lib/constants";

interface StakingInfoWidgetProps {
  info: StakingInfo;
}

export function StakingInfoWidget({ info }: StakingInfoWidgetProps) {
  return (
    <div className="glass-card p-4 mt-2 max-w-md" id="staking-info-widget">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-indigo-400" />
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
          Staking Overview
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Bonded</span>
          <span className="text-indigo-400 font-semibold font-(family-name:--font-jetbrains)">
            {info.bonded} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Active Stake</span>
          <span className="text-green-400 font-(family-name:--font-jetbrains)">
            {info.active} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Unlocking</span>
          <span className="text-amber-400 font-(family-name:--font-jetbrains)">
            {info.unlocking} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Rewards</span>
          <span className="text-slate-200">{info.rewardDestination}</span>
        </div>
      </div>

      {info.nominations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-slate-500 mb-2">Nominated Validators ({info.nominations.length})</p>
          <div className="space-y-1">
            {info.nominations.map((addr, i) => (
              <p
                key={addr}
                className="text-xs text-slate-400 font-(family-name:--font-jetbrains) truncate"
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

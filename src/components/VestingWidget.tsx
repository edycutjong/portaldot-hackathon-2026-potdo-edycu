"use client";

import type { VestingSchedule } from "@/lib/types";
import { TOKEN_SYMBOL } from "@/lib/constants";

interface VestingWidgetProps {
  schedule: VestingSchedule;
}

export function VestingWidget({ schedule }: VestingWidgetProps) {
  const locked = parseFloat(schedule.locked);
  const vested = parseFloat(schedule.alreadyVested);
  const total = locked + vested;
  const percentage = total > 0 ? Math.round((vested / total) * 100) : 0;

  return (
    <div className="glass-card p-4 mt-2 max-w-md" id="vesting-widget">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-teal-400" />
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
          Vesting Schedule
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-teal-400">{percentage}% Vested</span>
          <span className="text-slate-500">{vested.toFixed(4)} / {total.toFixed(4)} {TOKEN_SYMBOL}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Still Locked</span>
          <span className="text-amber-400 font-[family-name:var(--font-jetbrains)]">
            {schedule.locked} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Already Vested</span>
          <span className="text-green-400 font-[family-name:var(--font-jetbrains)]">
            {schedule.alreadyVested} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Per Period</span>
          <span className="text-slate-200 font-[family-name:var(--font-jetbrains)]">
            {schedule.perPeriod} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Starting Block</span>
          <span className="text-slate-300 font-[family-name:var(--font-jetbrains)]">
            #{schedule.startingBlock.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Total Periods</span>
          <span className="text-slate-300">{schedule.periodCount}</span>
        </div>
      </div>
    </div>
  );
}

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
    <div className="glass-card mt-2 max-w-md p-4" id="vesting-widget">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-teal-400" />
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Vesting Schedule
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-teal-400">{percentage}% Vested</span>
          <span className="text-slate-500">
            {vested.toFixed(4)} / {total.toFixed(4)} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-linear-to-r from-teal-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Still Locked</span>
          <span className="font-(family-name:--font-jetbrains) text-amber-400">
            {schedule.locked} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Already Vested</span>
          <span className="font-(family-name:--font-jetbrains) text-green-400">
            {schedule.alreadyVested} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Per Period</span>
          <span className="font-(family-name:--font-jetbrains) text-slate-200">
            {schedule.perPeriod} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Starting Block</span>
          <span className="font-(family-name:--font-jetbrains) text-slate-300">
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

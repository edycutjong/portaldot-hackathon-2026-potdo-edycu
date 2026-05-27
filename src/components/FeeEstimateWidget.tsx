"use client";

import type { FeeEstimate } from "@/lib/types";
import { TOKEN_SYMBOL } from "@/lib/constants";

interface FeeEstimateWidgetProps {
  fee: FeeEstimate;
}

export function FeeEstimateWidget({ fee }: FeeEstimateWidgetProps) {
  return (
    <div className="glass-card p-4 mt-2 max-w-md" id="fee-estimate-widget">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-orange-400" />
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
          Fee Estimate
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Estimated Fee</span>
          <span className="text-orange-400 font-semibold font-[family-name:var(--font-jetbrains)]">
            {fee.partialFee} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Weight</span>
          <span className="text-slate-300 font-[family-name:var(--font-jetbrains)] text-xs">
            {fee.weight}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Class</span>
          <span className={`text-xs font-medium ${
            fee.class === "Normal" ? "text-green-400" :
            fee.class === "Operational" ? "text-amber-400" :
            "text-red-400"
          }`}>
            {fee.class}
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-600">
        Actual fee may vary based on network congestion and transaction weight.
      </p>
    </div>
  );
}

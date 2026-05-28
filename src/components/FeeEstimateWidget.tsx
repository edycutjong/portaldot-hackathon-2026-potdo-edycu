"use client";

import type { FeeEstimate } from "@/lib/types";
import { TOKEN_SYMBOL } from "@/lib/constants";

interface FeeEstimateWidgetProps {
  fee: FeeEstimate;
}

export function FeeEstimateWidget({ fee }: FeeEstimateWidgetProps) {
  return (
    <div className="glass-card mt-2 max-w-md p-4" id="fee-estimate-widget">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-orange-400" />
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Fee Estimate
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Estimated Fee</span>
          <span className="font-(family-name:--font-jetbrains) font-semibold text-orange-400">
            {fee.partialFee} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Weight</span>
          <span className="font-(family-name:--font-jetbrains) text-xs text-slate-300">
            {fee.weight}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Class</span>
          <span
            className={`text-xs font-medium ${
              fee.class === "Normal"
                ? "text-green-400"
                : fee.class === "Operational"
                  ? "text-amber-400"
                  : "text-red-400"
            }`}
          >
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

"use client";

import type { ChainInfo } from "@/lib/types";

interface ChainInfoWidgetProps {
  info: ChainInfo;
}

export function ChainInfoWidget({ info }: ChainInfoWidgetProps) {
  return (
    <div className="glass-card p-4 mt-2 max-w-md" id="chain-info-widget">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-sky-400" />
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
          Network Status
        </span>
        <span className={`ml-auto text-xs flex items-center gap-1 ${info.isSyncing ? "text-amber-400" : "text-green-400"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${info.isSyncing ? "bg-amber-400 animate-pulse" : "bg-green-400"}`} />
          {info.isSyncing ? "Syncing" : "Online"}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Chain</span>
          <span className="text-sky-400 font-semibold">{info.chainName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Block Height</span>
          <span className="text-slate-200 font-[family-name:var(--font-jetbrains)]">
            #{info.blockNumber.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Runtime</span>
          <span className="text-slate-300 font-[family-name:var(--font-jetbrains)]">
            v{info.runtimeVersion}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Peers</span>
          <span className="text-slate-300">{info.peerCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Node Version</span>
          <span className="text-slate-300 font-[family-name:var(--font-jetbrains)]">
            {info.nodeVersion}
          </span>
        </div>
      </div>
    </div>
  );
}

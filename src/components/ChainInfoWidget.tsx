"use client";

import type { ChainInfo } from "@/lib/types";

interface ChainInfoWidgetProps {
  info: ChainInfo;
}

export function ChainInfoWidget({ info }: ChainInfoWidgetProps) {
  return (
    <div className="glass-card mt-2 max-w-md p-4" id="chain-info-widget">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-sky-400" />
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Network Status
        </span>
        <span
          className={`ml-auto flex items-center gap-1 text-xs ${info.isSyncing ? "text-amber-400" : "text-green-400"}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${info.isSyncing ? "animate-pulse bg-amber-400" : "bg-green-400"}`}
          />
          {info.isSyncing ? "Syncing" : "Online"}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Chain</span>
          <span className="font-semibold text-sky-400">{info.chainName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Block Height</span>
          <span className="font-(family-name:--font-jetbrains) text-slate-200">
            #{info.blockNumber.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Runtime</span>
          <span className="font-(family-name:--font-jetbrains) text-slate-300">
            v{info.runtimeVersion}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Peers</span>
          <span className="text-slate-300">{info.peerCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Node Version</span>
          <span className="font-(family-name:--font-jetbrains) text-slate-300">
            {info.nodeVersion}
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import type { HistoryEntry } from "@/lib/types";
import { ProxySettingsWidget } from "./ProxySettingsWidget";

interface CommandHistoryProps {
  entries: HistoryEntry[];
  onSelect?: (entry: HistoryEntry) => void;
  /** When true, renders without the aside wrapper (used inside mobile drawer) */
  isMobileDrawer?: boolean;
}

const statusIcon: Record<string, string> = {
  parsed: "🔵",
  pending: "🟡",
  submitted: "🟡",
  in_block: "🟢",
  finalized: "🟢",
  failed: "🔴",
};

function HistoryList({ entries, onSelect }: Pick<CommandHistoryProps, "entries" | "onSelect">) {
  return (
    <>
      {entries.length === 0 ? (
        <p className="text-xs text-slate-600 italic">
          No commands yet. Try typing something!
        </p>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => onSelect?.(entry)}
              className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-150 group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">
                  {statusIcon[entry.status] || "⚪"}
                </span>
                <span className="text-xs text-slate-400 truncate flex-1 group-hover:text-slate-300">
                  {entry.command}
                </span>
              </div>
              <p className="text-[10px] text-slate-600 mt-1 pl-5">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export function CommandHistory({ entries, onSelect, isMobileDrawer }: CommandHistoryProps) {
  // Mobile drawer variant: no aside wrapper
  if (isMobileDrawer) {
    return (
      <div className="p-4 overflow-y-auto flex-1">
        <ProxySettingsWidget />
        <HistoryList entries={entries} onSelect={onSelect} />
      </div>
    );
  }

  // Desktop: original aside layout
  return (
    <aside className="w-[280px] border-r border-white/5 h-full overflow-y-auto hidden lg:block">
      <div className="p-4">
        <ProxySettingsWidget />
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 mt-4">
          Command History
        </h2>
        <HistoryList entries={entries} onSelect={onSelect} />
      </div>
    </aside>
  );
}

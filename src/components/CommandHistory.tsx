"use client";

import type { HistoryEntry } from "@/lib/types";
import { ProxySettingsWidget } from "./ProxySettingsWidget";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="space-y-1.5">
      <AnimatePresence mode="popLayout" initial={false}>
        {entries.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-slate-600 italic py-2"
          >
            No commands yet. Try typing something!
          </motion.p>
        ) : (
          entries.map((entry, idx) => (
            <motion.button
              key={entry.id}
              layout="position"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  delay: Math.min(idx * 0.03, 0.3),
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                },
              }}
              exit={{ opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.15 } }}
              whileHover={{ scale: 1.02, x: 2, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect?.(entry)}
              className="w-full text-left p-2.5 rounded-lg bg-white/5 border border-transparent hover:border-white/10 transition-colors duration-150 group cursor-pointer block"
            >
              <div className="flex items-center gap-2">
                <motion.span
                  key={entry.status}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-xs shrink-0"
                >
                  {statusIcon[entry.status] || "⚪"}
                </motion.span>
                <span className="text-xs text-slate-400 truncate flex-1 group-hover:text-slate-300">
                  {entry.command}
                </span>
              </div>
              <p className="text-[10px] text-slate-600 mt-1 pl-5">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </p>
            </motion.button>
          ))
        )}
      </AnimatePresence>
    </div>
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

  // Desktop: original aside layout with slide-in fade-in animation
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-[280px] border-r border-white/5 h-full overflow-y-auto hidden lg:block"
    >
      <div className="p-4">
        <ProxySettingsWidget />
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 mt-4">
          Command History
        </h2>
        <HistoryList entries={entries} onSelect={onSelect} />
      </div>
    </motion.aside>
  );
}

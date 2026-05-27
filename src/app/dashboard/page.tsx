"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { Header } from "@/components/Header";
import { CommandHistory } from "@/components/CommandHistory";
import { useWallet } from "@/context/WalletContext";
import { formatPot } from "@/lib/format";
import { fetchHistory } from "@/lib/supabase";
import type { HistoryEntry, TxStatus } from "@/lib/types";

export default function DashboardPage() {
  const {
    connected,
    address,
    balance,
    connect,
    disconnect,
    isDemoMode,
    connecting,
    accounts,
    selectAccount,
  } = useWallet();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [pendingInput, setPendingInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const triggerHistoryReload = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const loadHistory = async () => {
      try {
        const data = await fetchHistory(address || undefined);
        const formatted = (
          data as Array<{
            id: number | string;
            command: string;
            status: TxStatus | "parsed";
            created_at?: string;
          }>
        ).map((row) => ({
          id: row.id.toString(),
          command: row.command,
          status: row.status,
          timestamp: new Date(row.created_at || Date.now()),
        }));
        if (active) {
          setHistory(formatted);
        }
      } catch (e) {
        console.warn("Failed to load history:", e);
      }
    };
    loadHistory();
    return () => {
      active = false;
    };
  }, [address, reloadTrigger]);

  const balanceStr = connected ? formatPot(balance) : undefined;

  return (
    <div className="h-screen flex flex-col grid-bg">
      <Header
        connected={connected}
        address={address || undefined}
        balance={balanceStr}
        isDemoMode={isDemoMode}
        connecting={connecting}
        accounts={accounts}
        onConnect={() => connect(false)}
        onDisconnect={disconnect}
        onSelectAccount={selectAccount}
      />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar toggle button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-20 left-3 z-40 p-2.5 rounded-xl bg-[#111118]/90 border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-all duration-200 backdrop-blur-sm shadow-lg cursor-pointer"
          aria-label="Open command history"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar drawer */}
        <div
          className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0a0a0f] border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              History
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all cursor-pointer"
              aria-label="Close sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <CommandHistory
            entries={history}
            onSelect={(entry) => {
              setPendingInput(entry.command);
              setSidebarOpen(false);
            }}
            isMobileDrawer
          />
        </div>

        {/* Desktop sidebar (unchanged) */}
        <CommandHistory entries={history} onSelect={(entry) => setPendingInput(entry.command)} />

        <main className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            externalInput={pendingInput}
            onExternalInputConsumed={() => setPendingInput("")}
            onCommandExecuted={triggerHistoryReload}
          />
        </main>
      </div>
    </div>
  );
}

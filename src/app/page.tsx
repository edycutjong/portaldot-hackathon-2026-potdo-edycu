"use client";

import { useEffect, useState, useCallback } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { Header } from "@/components/Header";
import { CommandHistory } from "@/components/CommandHistory";
import { useWallet } from "@/context/WalletContext";
import { formatPot } from "@/lib/format";
import { fetchHistory } from "@/lib/supabase";
import type { HistoryEntry, TxStatus } from "@/lib/types";

export default function Home() {
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
      <div className="flex flex-1 overflow-hidden">
        <CommandHistory entries={history} />
        <main className="flex-1 flex flex-col min-w-0">
          <ChatInterface onCommandExecuted={triggerHistoryReload} />
        </main>
      </div>
    </div>
  );
}


"use client";

import type { InjectedAccount } from "@/context/WalletContext";

interface HeaderProps {
  connected?: boolean;
  address?: string;
  balance?: string;
  isDemoMode?: boolean;
  connecting?: boolean;
  accounts?: InjectedAccount[];
  onConnect?: () => void;
  onDisconnect?: () => void;
  onSelectAccount?: (addr: string) => void;
}

export function Header({
  connected = false,
  address,
  balance,
  isDemoMode = true,
  connecting = false,
  accounts = [],
  onConnect,
  onDisconnect,
  onSelectAccount,
}: HeaderProps) {
  return (
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon.svg"
          alt="Potdo Icon"
          className="w-7 h-7"
        />
        <h1 className="text-base font-bold text-slate-100">Potdo</h1>
        {connected && isDemoMode && (
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 select-none ml-1.5">
            Demo Mode ⚡
          </span>
        )}
      </div>

      {/* Wallet status */}
      <div className="flex items-center gap-3">
        {connected && address ? (
          <div className="flex items-center gap-3">
            {balance && (
              <span className="text-xs text-slate-400 font-(family-name:--font-jetbrains)">
                {balance}
              </span>
            )}
            
            {accounts.length > 1 ? (
              <select
                value={address}
                onChange={(e) => onSelectAccount?.(e.target.value)}
                className="bg-[#111118] border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer font-(family-name:--font-jetbrains)"
              >
                {accounts.map((acc) => (
                  <option key={acc.address} value={acc.address}>
                    {acc.meta.name || "Account"} ({acc.address.slice(0, 4)}...{acc.address.slice(-4)})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-xs text-slate-400 font-(family-name:--font-jetbrains)">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            )}

            <button
              onClick={onDisconnect}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-200 cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-linear-to-r from-purple-500 to-purple-400 text-white hover:from-purple-400 hover:to-purple-300 disabled:opacity-55 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            id="connect-wallet"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </header>
  );
}

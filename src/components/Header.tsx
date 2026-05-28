"use client";

import Link from "next/link";
import type { InjectedAccount } from "@/context/WalletContext";

interface HeaderProps {
  connected?: boolean;
  address?: string;
  balance?: string;
  isDemoMode?: boolean;
  connecting?: boolean;
  accounts?: InjectedAccount[];
  chainName?: string;
  targetChainName?: string;
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
  chainName = "Demo Network",
  targetChainName = "Portaldot Network",
  onConnect,
  onDisconnect,
  onSelectAccount,
}: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-white/5 px-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="Potdo Icon" className="h-7 w-7" />
          <h1 className="text-base font-bold text-slate-100">Potdo</h1>
        </Link>
        {connected && isDemoMode && (
          <span className="ml-1.5 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase select-none">
            Demo Mode ⚡
          </span>
        )}
        {connected && !isDemoMode && (
          <span className="ml-1.5 rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 uppercase select-none">
            {chainName} 🌐
          </span>
        )}
      </div>

      {/* Wallet status */}
      <div className="flex items-center gap-3">
        {process.env.NEXT_PUBLIC_BACKEND_URL && (
          <a
            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1.5 text-xs font-semibold text-cyan-400 transition-all duration-200 select-none hover:bg-cyan-500/10"
            id="api-docs-link"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            API Docs
          </a>
        )}

        {connected && address ? (
          <div className="flex items-center gap-3">
            {balance && (
              <span className="font-(family-name:--font-jetbrains) text-xs text-slate-400">
                {balance}
              </span>
            )}

            {accounts.length > 1 ? (
              <select
                value={address}
                onChange={(e) => onSelectAccount?.(e.target.value)}
                className="cursor-pointer rounded-lg border border-white/10 bg-[#111118] px-2 py-1 font-(family-name:--font-jetbrains) text-xs text-slate-300 focus:border-cyan-500/50 focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.address} value={acc.address}>
                    {acc.meta.name || "Account"} ({acc.address.slice(0, 4)}...
                    {acc.address.slice(-4)})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                <span className="font-(family-name:--font-jetbrains) text-xs text-slate-400">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            )}

            <button
              onClick={onDisconnect}
              className="cursor-pointer rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-slate-200"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 select-none">
              Target Node: <span className="font-semibold text-slate-400">{targetChainName}</span>
            </span>
            <button
              onClick={onConnect}
              disabled={connecting}
              className="cursor-pointer rounded-lg bg-linear-to-r from-purple-500 to-purple-400 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:from-purple-400 hover:to-purple-300 disabled:cursor-not-allowed disabled:opacity-55"
              id="connect-wallet"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

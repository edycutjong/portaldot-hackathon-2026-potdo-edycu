"use client";

import type { OnChainIdentity } from "@/lib/types";

interface IdentityCardProps {
  identity: OnChainIdentity;
}

export function IdentityCard({ identity }: IdentityCardProps) {
  const shortAddr = identity.address
    ? `${identity.address.slice(0, 8)}...${identity.address.slice(-6)}`
    : "—";

  return (
    <div className="glass-card p-4 mt-2 max-w-md" id="identity-card">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-violet-400" />
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
          On-Chain Identity
        </span>
        {identity.isVerified && (
          <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Verified
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Display Name</span>
          <span className="text-violet-400 font-semibold">{identity.display || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Address</span>
          <span className="text-slate-300 font-(family-name:--font-jetbrains) text-xs">
            {shortAddr}
          </span>
        </div>
        {identity.web && (
          <div className="flex justify-between">
            <span className="text-slate-500">Web</span>
            <span className="text-cyan-400 text-xs truncate max-w-[200px]">{identity.web}</span>
          </div>
        )}
        {identity.email && (
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span className="text-slate-300 text-xs">{identity.email}</span>
          </div>
        )}
        {identity.twitter && (
          <div className="flex justify-between">
            <span className="text-slate-500">Twitter</span>
            <span className="text-sky-400 text-xs">{identity.twitter}</span>
          </div>
        )}
      </div>
    </div>
  );
}

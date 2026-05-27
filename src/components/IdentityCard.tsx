"use client";

import { useState } from "react";
import type { OnChainIdentity } from "@/lib/types";

interface IdentityCardProps {
  identity: OnChainIdentity;
}

export function IdentityCard({ identity }: IdentityCardProps) {
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const shortAddr = identity.address
    ? `${identity.address.slice(0, 8)}...${identity.address.slice(-6)}`
    : "—";

  const handleCopyAddr = () => {
    if (!identity.address) return;
    navigator.clipboard.writeText(identity.address);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 1500);
  };

  const handleCopyEmail = () => {
    if (!identity.email) return;
    navigator.clipboard.writeText(identity.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1500);
  };

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
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Display Name</span>
          <span className="text-violet-400 font-semibold">{identity.display || "—"}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Address</span>
          {identity.address ? (
            <div 
              onClick={handleCopyAddr}
              className="flex items-center gap-1.5 cursor-pointer hover:text-violet-300 text-slate-300 transition-colors"
              title="Click to copy full address"
            >
              <span className="font-(family-name:--font-jetbrains) text-xs">
                {shortAddr}
              </span>
              {copiedAddr ? (
                <span className="text-[10px] text-green-400 font-medium">Copied!</span>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </div>
          ) : (
            <span className="text-slate-500 text-xs">—</span>
          )}
        </div>

        {identity.web && (
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Web</span>
            <a 
              href={identity.web.startsWith("http") ? identity.web : `https://${identity.web}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 text-xs truncate max-w-[200px] hover:text-cyan-300 hover:underline transition-colors flex items-center gap-1"
            >
              {identity.web}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        )}

        {identity.email && (
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Email</span>
            <div 
              onClick={handleCopyEmail}
              className="flex items-center gap-1.5 cursor-pointer hover:text-violet-300 text-slate-300 transition-colors"
              title="Click to copy email address"
            >
              <span className="text-xs">{identity.email}</span>
              {copiedEmail ? (
                <span className="text-[10px] text-green-400 font-medium">Copied!</span>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </div>
          </div>
        )}

        {identity.twitter && (
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Twitter</span>
            <span className="text-sky-400 text-xs">{identity.twitter}</span>
          </div>
        )}
      </div>
    </div>
  );
}

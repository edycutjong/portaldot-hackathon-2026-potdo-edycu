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
    navigator.clipboard.writeText(identity.address);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 1500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(identity.email!);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1500);
  };

  return (
    <div className="glass-card mt-2 max-w-md p-4" id="identity-card">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-violet-400" />
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          On-Chain Identity
        </span>
        {identity.isVerified && (
          <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path
                d="M5 8l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Verified
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Display Name</span>
          <span className="font-semibold text-violet-400">{identity.display || "—"}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Address</span>
          {identity.address ? (
            <div
              onClick={handleCopyAddr}
              className="flex cursor-pointer items-center gap-1.5 text-slate-300 transition-colors hover:text-violet-300"
              title="Click to copy full address"
            >
              <span className="font-(family-name:--font-jetbrains) text-xs">{shortAddr}</span>
              {copiedAddr ? (
                <span className="text-[10px] font-medium text-green-400">Copied!</span>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-60"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-500">—</span>
          )}
        </div>

        {identity.web && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Web</span>
            <a
              href={identity.web.startsWith("http") ? identity.web : `https://${identity.web}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex max-w-[200px] items-center gap-1 truncate text-xs text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
            >
              {identity.web}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-60"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        )}

        {identity.email && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Email</span>
            <div
              onClick={handleCopyEmail}
              className="flex cursor-pointer items-center gap-1.5 text-slate-300 transition-colors hover:text-violet-300"
              title="Click to copy email address"
            >
              <span className="text-xs">{identity.email}</span>
              {copiedEmail ? (
                <span className="text-[10px] font-medium text-green-400">Copied!</span>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-60"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </div>
          </div>
        )}

        {identity.twitter && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Twitter</span>
            <span className="text-xs text-sky-400">{identity.twitter}</span>
          </div>
        )}
      </div>
    </div>
  );
}

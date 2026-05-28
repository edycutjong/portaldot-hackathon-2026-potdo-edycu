"use client";

import { useState, useContext } from "react";
import { WalletContext } from "@/context/WalletContext";

export function ProxySettingsWidget() {
  const wallet = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  if (!wallet) {
    return null;
  }

  const {
    connected,
    isProxyActive,
    agentAddress,
    checkingProxy,
    addProxyDelegate,
    removeProxyDelegate,
  } = wallet;

  const handleToggleProxy = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    setStatusText(isProxyActive ? "Revoking delegation..." : "Authorizing agent...");
    try {
      if (isProxyActive) {
        await removeProxyDelegate("Any", (status, txHash, blockNumber, error) => {
          if (status === "pending") setStatusText("Submitting revoke transaction...");
          if (status === "submitted") setStatusText("Revocation submitted...");
          if (status === "finalized") {
            setStatusText(null);
            setLoading(false);
          }
          if (status === "failed") {
            setStatusText(`Error: ${error}`);
            setLoading(false);
          }
        });
      } else {
        await addProxyDelegate("Any", (status, txHash, blockNumber, error) => {
          if (status === "pending") setStatusText("Submitting delegation transaction...");
          if (status === "submitted") setStatusText("Delegation submitted...");
          if (status === "finalized") {
            setStatusText(null);
            setLoading(false);
          }
          if (status === "failed") {
            setStatusText(`Error: ${error}`);
            setLoading(false);
          }
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setStatusText(`Error: ${errMsg}`);
      setLoading(false);
    }
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="glass-card group relative mb-6 overflow-hidden rounded-xl border border-white/5 bg-[#111118]/70 p-4 backdrop-blur-md">
      {/* Background radial glow */}
      <div
        className={`absolute -top-16 -right-16 h-32 w-32 rounded-full opacity-20 blur-3xl transition-all duration-300 ${
          isProxyActive ? "bg-cyan-500" : "bg-purple-500"
        }`}
      />

      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-300 uppercase">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-purple-400"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Secure Delegation
        </h3>

        {checkingProxy ? (
          <span className="text-[10px] text-slate-500">Checking...</span>
        ) : isProxyActive ? (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
            </span>
            <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
              Guarded
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Inactive
          </span>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-slate-400">
          {isProxyActive
            ? "AI Agent has secure proxy execution permission. Transactions are executed instantly without extension popups."
            : "Delegate restricted authority (e.g. Staking/Identity) to the agent. Prevents theft while enabling frictionless AI execution."}
        </p>

        {agentAddress && (
          <div className="rounded-lg border border-white/5 bg-white/5 p-2">
            <span className="mb-0.5 block text-[9px] font-semibold tracking-wider text-slate-500 uppercase">
              Agent Delegate Address
            </span>
            <code className="font-mono text-[10px] break-all text-slate-300 select-all">
              {agentAddress}
            </code>
          </div>
        )}

        {statusText && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-400/10 bg-amber-400/5 p-2 text-[11px] text-amber-400">
            <span className="animate-pulse">⏳</span>
            <span>{statusText}</span>
          </div>
        )}

        <button
          onClick={handleToggleProxy}
          disabled={loading || checkingProxy}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
            isProxyActive
              ? "border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10"
              : "bg-linear-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/10 hover:opacity-90"
          }`}
        >
          {loading ? (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : isProxyActive ? (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
              Revoke Agent Authority
            </>
          ) : (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Enable Secure Delegation
            </>
          )}
        </button>
      </div>
    </div>
  );
}

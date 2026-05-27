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
    if (loading) return;
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
      const errMsg = err instanceof Error ? err.message : "Failed";
      setStatusText(`Error: ${errMsg}`);
      setLoading(false);
    }
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="glass-card p-4 rounded-xl border border-white/5 bg-[#111118]/70 backdrop-blur-md mb-6 relative overflow-hidden group">
      {/* Background radial glow */}
      <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full blur-3xl opacity-20 transition-all duration-300 ${
        isProxyActive ? "bg-cyan-500" : "bg-purple-500"
      }`} />

      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-purple-400">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Secure Delegation
        </h3>
        
        {checkingProxy ? (
          <span className="text-[10px] text-slate-500">Checking...</span>
        ) : isProxyActive ? (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
              Guarded
            </span>
          </div>
        ) : (
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Inactive
          </span>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs text-slate-400 leading-relaxed">
          {isProxyActive
            ? "AI Agent has secure proxy execution permission. Transactions are executed instantly without extension popups."
            : "Delegate restricted authority (e.g. Staking/Identity) to the agent. Prevents theft while enabling frictionless AI execution."}
        </p>

        {agentAddress && (
          <div className="p-2 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider block mb-0.5">
              Agent Delegate Address
            </span>
            <code className="text-[10px] text-slate-300 font-mono break-all select-all">
              {agentAddress}
            </code>
          </div>
        )}

        {statusText && (
          <div className="text-[11px] text-amber-400 bg-amber-400/5 border border-amber-400/10 rounded-lg p-2 flex items-center gap-2">
            <span className="animate-pulse">⏳</span>
            <span>{statusText}</span>
          </div>
        )}

        <button
          onClick={handleToggleProxy}
          disabled={loading || checkingProxy}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
            isProxyActive
              ? "border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400"
              : "bg-linear-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 shadow-lg shadow-cyan-500/10"
          }`}
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isProxyActive ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
              </svg>
              Revoke Agent Authority
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Enable Secure Delegation
            </>
          )}
        </button>
      </div>
    </div>
  );
}

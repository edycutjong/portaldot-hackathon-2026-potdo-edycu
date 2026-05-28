"use client";

import { motion } from "framer-motion";
import { useWallet } from "@/context/WalletContext";

export function ConnectWalletModal() {
  const {
    targetChainName,
    rpcEndpoint,
    setShowConnectModal,
    connectExtension,
    connectDemo,
    connecting,
  } = useWallet();

  // Helper to determine network type
  const isTargetTestnet =
    rpcEndpoint.includes("127.0.0.1") ||
    rpcEndpoint.includes("localhost") ||
    rpcEndpoint.includes("testnet") ||
    rpcEndpoint.includes("dev") ||
    targetChainName.toLowerCase().includes("testnet") ||
    targetChainName.toLowerCase().includes("dev") ||
    targetChainName.toLowerCase().includes("local");

  const handleClose = () => {
    setShowConnectModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        data-testid="connect-modal-backdrop"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10]/95 p-6 shadow-2xl backdrop-blur-md"
        data-testid="connect-modal-content"
      >
        {/* Glow effect */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 cursor-pointer rounded-lg p-1.5 text-slate-500 transition-all hover:bg-white/5 hover:text-slate-300"
          aria-label="Close modal"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Title */}
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 text-purple-400">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-100">Connect Wallet</h2>
            <p className="text-xs text-slate-500">Configure your wallet connection network</p>
          </div>
        </div>

        {/* Network target details */}
        <div className="mb-5 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Target Node</span>
            <span className="font-semibold text-slate-300">{targetChainName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">RPC Endpoint</span>
            <span
              className="max-w-[200px] truncate font-mono text-[11px] text-slate-400"
              title={rpcEndpoint}
            >
              {rpcEndpoint}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Network Mode</span>
            {isTargetTestnet ? (
              <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                Testnet / Local Dev
              </span>
            ) : (
              <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                Mainnet
              </span>
            )}
          </div>
        </div>

        {/* Instructions Warning box */}
        <div
          className={`mb-6 rounded-xl border p-4 text-xs ${
            isTargetTestnet
              ? "border-cyan-500/15 bg-cyan-500/5 text-cyan-400/90"
              : "border-amber-500/15 bg-amber-500/5 text-amber-400/90"
          }`}
        >
          <div className="flex gap-2.5">
            <span className="mt-0.5 text-sm">{isTargetTestnet ? "🔧" : "⚠️"}</span>
            <div className="space-y-1.5">
              <p className="font-semibold text-slate-200">
                {isTargetTestnet ? "Testnet Node Configured" : "Mainnet Node Configured"}
              </p>
              <p className="leading-relaxed text-slate-400">
                {isTargetTestnet
                  ? "This instance points to a test or dev environment. Ensure your wallet extension (Talisman, SubWallet, Polkadot.js) is connected to a local/testnet node. Standard developer accounts (Alice, Bob, Charlie, Dave) are active."
                  : "This instance is connected to the live Portaldot Mainnet. Please make sure your Substrate wallet extension is set to Portaldot Mainnet and has real POT tokens."}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={connectExtension}
            disabled={connecting}
            className="glow-cyan font-heading w-full cursor-pointer rounded-xl bg-linear-to-r from-cyan-500 to-cyan-400 py-3 text-sm font-semibold text-slate-900 transition-all duration-200 hover:from-cyan-400 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {connecting ? "Enabling Extension..." : "Connect Substrate Extension"}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="mx-4 flex-shrink font-mono text-[10px] tracking-widest text-slate-600 uppercase">
              or
            </span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <button
            onClick={connectDemo}
            disabled={connecting}
            className="font-heading w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            Enter Demo Mode (Simulation)
          </button>
        </div>
      </motion.div>
    </div>
  );
}

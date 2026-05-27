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
        className="relative w-full max-w-md bg-[#0b0b10]/95 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md overflow-hidden z-10"
        data-testid="connect-modal-content"
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-heading">Connect Wallet</h2>
            <p className="text-xs text-slate-500">Configure your wallet connection network</p>
          </div>
        </div>

        {/* Network target details */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Target Node</span>
            <span className="text-slate-300 font-semibold">{targetChainName}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">RPC Endpoint</span>
            <span className="text-slate-400 font-mono text-[11px] truncate max-w-[200px]" title={rpcEndpoint}>
              {rpcEndpoint}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Network Mode</span>
            {isTargetTestnet ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Testnet / Local Dev
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Mainnet
              </span>
            )}
          </div>
        </div>

        {/* Instructions Warning box */}
        <div className={`p-4 rounded-xl border text-xs mb-6 ${
          isTargetTestnet
            ? "bg-cyan-500/5 border-cyan-500/15 text-cyan-400/90"
            : "bg-amber-500/5 border-amber-500/15 text-amber-400/90"
        }`}>
          <div className="flex gap-2.5">
            <span className="text-sm mt-0.5">{isTargetTestnet ? "🔧" : "⚠️"}</span>
            <div className="space-y-1.5">
              <p className="font-semibold text-slate-200">
                {isTargetTestnet ? "Testnet Node Configured" : "Mainnet Node Configured"}
              </p>
              <p className="leading-relaxed text-slate-400">
                {isTargetTestnet
                  ? "This instance points to a test or dev environment. Ensure your wallet extension (Talisman, SubWallet, Polkadot.js) is connected to a local/testnet node. Standard developer accounts (Alice, Bob, Charlie, Dave) are active."
                  : "This instance is connected to the live Portaldot Mainnet. Please make sure your Substrate wallet extension is set to Portaldot Mainnet and has real POT tokens."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={connectExtension}
            disabled={connecting}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-linear-to-r from-cyan-500 to-cyan-400 text-slate-900 hover:from-cyan-400 hover:to-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 glow-cyan font-heading cursor-pointer"
          >
            {connecting ? "Enabling Extension..." : "Connect Substrate Extension"}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-600 uppercase tracking-widest font-mono">or</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <button
            onClick={connectDemo}
            disabled={connecting}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200 font-heading cursor-pointer"
          >
            Enter Demo Mode (Simulation)
          </button>
        </div>
      </motion.div>
    </div>
  );
}

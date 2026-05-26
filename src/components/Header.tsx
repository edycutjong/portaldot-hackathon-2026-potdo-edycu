"use client";

interface HeaderProps {
  connected?: boolean;
  address?: string;
  balance?: string;
  onConnect?: () => void;
}

export function Header({
  connected = false,
  address,
  balance,
  onConnect,
}: HeaderProps) {
  return (
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
          P
        </div>
        <h1 className="text-base font-bold text-slate-100">Potdo</h1>
      </div>

      {/* Wallet status */}
      <div className="flex items-center gap-3">
        {connected && address ? (
          <div className="flex items-center gap-2">
            {balance && (
              <span className="text-xs text-slate-400 font-[family-name:var(--font-jetbrains)]">
                {balance}
              </span>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-slate-400 font-[family-name:var(--font-jetbrains)]">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-500 to-purple-400 text-white hover:from-purple-400 hover:to-purple-300 transition-all duration-200 cursor-pointer"
            id="connect-wallet"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}

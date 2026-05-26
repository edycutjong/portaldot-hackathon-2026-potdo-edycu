import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center grid-bg text-slate-100 p-4">
      <div className="relative max-w-md w-full text-center space-y-6 bg-slate-900/60 backdrop-blur-md border border-cyan-500/20 p-8 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.1)]">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000 -z-10 animate-pulse"></div>

        {/* 404 Title */}
        <div className="space-y-2">
          <h1 className="text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-mono animate-pulse">
            404
          </h1>
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold">
            Transaction Path Unknown
          </p>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          The requested page or resource could not be resolved. This endpoint might be under development or the route is invalid.
        </p>

        {/* Command input aesthetic */}
        <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 text-left font-mono text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-cyan-500">&gt;</span>
            <span>potdo --route query</span>
          </div>
          <div className="text-red-400">Error: Route not found. Invalid destination.</div>
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-cyan-500/30 rounded-xl text-sm font-medium text-cyan-400 bg-cyan-950/20 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 transition-all duration-300 font-mono shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

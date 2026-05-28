import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid-bg flex min-h-screen flex-col items-center justify-center p-4 text-slate-100">
      <div className="relative w-full max-w-md space-y-6 rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-8 text-center shadow-[0_0_50px_rgba(6,182,212,0.1)] backdrop-blur-md">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 -z-10 animate-pulse rounded-2xl bg-linear-to-r from-cyan-500 to-purple-600 opacity-20 blur-xl transition duration-1000 group-hover:opacity-30"></div>

        {/* 404 Title */}
        <div className="space-y-2">
          <h1 className="animate-pulse bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text font-mono text-8xl font-black tracking-widest text-transparent">
            404
          </h1>
          <p className="font-mono text-xs font-bold tracking-widest text-cyan-400 uppercase">
            Transaction Path Unknown
          </p>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-slate-400 md:text-base">
          The requested page or resource could not be resolved. This endpoint might be under
          development or the route is invalid.
        </p>

        {/* Command input aesthetic */}
        <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-left font-mono text-xs text-slate-400">
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
            className="inline-flex items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-6 py-3 font-mono text-sm font-medium text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500 hover:text-slate-950 hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

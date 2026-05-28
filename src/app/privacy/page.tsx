import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Privacy Policy — Potdo",
  description: "Privacy policy for Potdo, the AI copilot for Portaldot blockchain transactions.",
};

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-[20%] left-[15%] h-[400px] w-[400px] rounded-full bg-cyan-500/4 blur-[100px]" />
        <div className="absolute right-[10%] bottom-[20%] h-[350px] w-[350px] rounded-full bg-purple-500/3 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <Image
              src="/icon.svg"
              alt="Potdo"
              width={28}
              height={28}
              className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
            />
            <span className="font-(family-name:--font-display) text-lg font-bold tracking-tight">
              Potdo
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-400 transition-colors duration-200 hover:text-cyan-400"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        {/* Page Title */}
        <div className="mb-12">
          <p className="mb-3 font-(family-name:--font-jetbrains) text-sm tracking-[0.2em] text-cyan-400 uppercase">
            Legal
          </p>
          <h1 className="font-(family-name:--font-display) text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy{" "}
            <span className="bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="mt-3 font-(family-name:--font-jetbrains) text-sm text-slate-500">
            Last updated: May 27, 2026
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8">
          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-cyan-400">
              1. Overview
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Potdo (&quot;we,&quot; &quot;our,&quot; or &quot;the app&quot;) is an open-source AI
              copilot for the Portaldot blockchain, built for the DoraHacks Portaldot Online S1
              Hackathon 2026. This Privacy Policy describes how we handle information when you use
              Potdo. We are committed to protecting your privacy and being transparent about our
              data practices.
            </p>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-cyan-400">
              2. Information We Do Not Collect
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed text-slate-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-green-400">✓</span>
                <span>
                  <strong className="text-slate-200">Private Keys &amp; Seed Phrases</strong> —
                  Potdo never accesses, stores, or transmits your private keys or mnemonic seed
                  phrases. All transaction signing happens locally through your browser wallet
                  extension.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-green-400">✓</span>
                <span>
                  <strong className="text-slate-200">Personal Identifying Information</strong> — We
                  do not collect names, email addresses, phone numbers, or any government-issued
                  identifiers.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-green-400">✓</span>
                <span>
                  <strong className="text-slate-200">Tracking &amp; Analytics</strong> — We do not
                  use cookies, analytics trackers, advertising pixels, or fingerprinting
                  technologies.
                </span>
              </li>
            </ul>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-cyan-400">
              3. Information That May Be Processed
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed text-slate-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-amber-400">⚡</span>
                <span>
                  <strong className="text-slate-200">Public Wallet Addresses</strong> — When you
                  connect your wallet or query balances, your public SS58 address is sent to the
                  Portaldot RPC endpoint to fetch on-chain data. This is publicly available
                  blockchain data.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-amber-400">⚡</span>
                <span>
                  <strong className="text-slate-200">Natural Language Commands</strong> — Your chat
                  commands (e.g., &quot;Send 10 POT to Alice&quot;) are parsed locally using our
                  deterministic NLP engine. In demo mode, no data leaves your browser. When the
                  optional AI backend is enabled, commands may be sent to OpenAI&apos;s API for
                  processing.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-amber-400">⚡</span>
                <span>
                  <strong className="text-slate-200">Transaction History</strong> — When Supabase is
                  configured, transaction metadata (command text, tx hash, block number, status) may
                  be stored for your command history. This data is associated with your public
                  wallet address only.
                </span>
              </li>
            </ul>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-cyan-400">
              4. Third-Party Services
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-400">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-4 text-left font-medium text-slate-300">Service</th>
                    <th className="py-2 pr-4 text-left font-medium text-slate-300">Purpose</th>
                    <th className="py-2 text-left font-medium text-slate-300">When Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2 pr-4 font-(family-name:--font-jetbrains) text-cyan-400">
                      Portaldot RPC
                    </td>
                    <td className="py-2 pr-4">On-chain queries &amp; transaction submission</td>
                    <td className="py-2">Connected mode only</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-(family-name:--font-jetbrains) text-purple-400">
                      OpenAI API
                    </td>
                    <td className="py-2 pr-4">AI intent parsing (optional)</td>
                    <td className="py-2">Only if OPENAI_API_KEY is configured</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-(family-name:--font-jetbrains) text-green-400">
                      Supabase
                    </td>
                    <td className="py-2 pr-4">Transaction history storage</td>
                    <td className="py-2">Only if Supabase keys are configured</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-(family-name:--font-jetbrains) text-amber-400">
                      Vercel
                    </td>
                    <td className="py-2 pr-4">Hosting &amp; CDN</td>
                    <td className="py-2">Always (production deployment)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-cyan-400">
              5. Demo Mode
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              By default, Potdo runs in <strong className="text-slate-200">demo mode</strong> with
              no external API connections. All data is generated locally with deterministic mock
              values. No data is transmitted to any server, no blockchain connections are made, and
              no third-party APIs are called. Demo mode is fully self-contained in your browser.
            </p>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-cyan-400">
              6. Open Source Transparency
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Potdo is fully open source under the MIT License. You can audit every line of code at{" "}
              <a
                href="https://github.com/edycutjong/potdo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 underline underline-offset-2 transition-colors hover:text-cyan-300"
              >
                github.com/edycutjong/potdo
              </a>
              . We encourage security researchers and developers to review our data handling
              practices directly in the source code.
            </p>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-cyan-400">
              7. Contact
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              For privacy inquiries, please open an issue on our{" "}
              <a
                href="https://github.com/edycutjong/potdo/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 underline underline-offset-2 transition-colors hover:text-cyan-300"
              >
                GitHub repository
              </a>{" "}
              or reach out to the project maintainer.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#080810]">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
          <p className="text-xs text-slate-600">© 2026 Edy Cu. MIT License.</p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <Link href="/privacy" className="text-slate-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-slate-400">
              Terms
            </Link>
            <Link href="/" className="transition-colors hover:text-slate-400">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

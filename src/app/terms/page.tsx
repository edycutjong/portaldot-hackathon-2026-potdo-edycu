import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Terms of Service — Potdo",
  description: "Terms of service for Potdo, the AI copilot for Portaldot blockchain transactions.",
};

export default function TermsPage() {
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
        <div className="absolute top-[20%] right-[15%] h-[400px] w-[400px] rounded-full bg-purple-500/4 blur-[100px]" />
        <div className="absolute bottom-[20%] left-[10%] h-[350px] w-[350px] rounded-full bg-cyan-500/3 blur-[100px]" />
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
          <p className="mb-3 font-(family-name:--font-jetbrains) text-sm tracking-[0.2em] text-purple-400 uppercase">
            Legal
          </p>
          <h1 className="font-(family-name:--font-display) text-3xl font-bold tracking-tight sm:text-4xl">
            Terms of{" "}
            <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Service
            </span>
          </h1>
          <p className="mt-3 font-(family-name:--font-jetbrains) text-sm text-slate-500">
            Last updated: May 27, 2026
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8">
          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-purple-400">
              1. Acceptance of Terms
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              By accessing or using Potdo (&quot;the app&quot;), you agree to be bound by these
              Terms of Service. Potdo is an open-source hackathon project provided as-is. If you do
              not agree to these terms, please do not use the application.
            </p>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-purple-400">
              2. Description of Service
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Potdo is an AI-powered transaction copilot for the Portaldot blockchain. It parses
              natural language commands into structured transaction intents and renders interactive
              UI previews before execution. The application provides:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-slate-400">
              <li>Natural language intent parsing for Portaldot transactions</li>
              <li>Visual transaction preview cards (balance diffs, fee estimates)</li>
              <li>Wallet integration for transaction signing</li>
              <li>On-chain query tools (balance, staking, identity, vesting)</li>
              <li>Demo mode for exploring the app without a wallet</li>
            </ul>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-purple-400">
              3. No Financial Advice
            </h2>
            <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-sm font-medium text-amber-400">⚠️ Important Disclaimer</p>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Potdo is a{" "}
              <strong className="text-slate-200">developer tool and hackathon prototype</strong>,
              not a financial advisor. Nothing in this application constitutes financial,
              investment, tax, or legal advice. You are solely responsible for your own blockchain
              transactions. Always verify transaction details before signing.
            </p>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-purple-400">
              4. User Responsibilities
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed text-slate-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-cyan-400">→</span>
                <span>
                  <strong className="text-slate-200">Wallet Security</strong> — You are solely
                  responsible for the security of your wallet, private keys, and seed phrases. Potdo
                  never requests or stores these.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-cyan-400">→</span>
                <span>
                  <strong className="text-slate-200">Transaction Verification</strong> — While Potdo
                  provides preview cards, you must independently verify all transaction parameters
                  before signing with your wallet.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-cyan-400">→</span>
                <span>
                  <strong className="text-slate-200">Compliance</strong> — You are responsible for
                  complying with all applicable laws and regulations in your jurisdiction regarding
                  cryptocurrency transactions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-cyan-400">→</span>
                <span>
                  <strong className="text-slate-200">No Misuse</strong> — You agree not to use Potdo
                  for any illegal, fraudulent, or harmful activities.
                </span>
              </li>
            </ul>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-purple-400">
              5. Limitation of Liability
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Potdo is provided{" "}
              <strong className="text-slate-200">
                &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;
              </strong>{" "}
              without warranties of any kind, either express or implied. To the maximum extent
              permitted by law:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-slate-400">
              <li>We are not liable for any loss of funds, tokens, or digital assets</li>
              <li>
                We do not guarantee the accuracy of transaction previews, fee estimates, or balance
                displays
              </li>
              <li>We are not responsible for failed, delayed, or incorrect transactions</li>
              <li>We are not liable for Portaldot network downtime or RPC endpoint failures</li>
              <li>
                We are not responsible for any third-party service outages (OpenAI, Supabase,
                Vercel)
              </li>
            </ul>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-purple-400">
              6. Intellectual Property
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Potdo is released under the <strong className="text-slate-200">MIT License</strong>.
              You are free to use, modify, and distribute the source code in accordance with the
              license terms. The Potdo name, logo, and brand assets are the property of the project
              maintainer. &quot;Portaldot&quot; is a trademark of its respective owners.
            </p>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-purple-400">
              7. Blockchain Transactions Are Irreversible
            </h2>
            <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm font-medium text-red-400">🔴 Critical Notice</p>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              All transactions submitted through Potdo to the Portaldot blockchain are{" "}
              <strong className="text-slate-200">final and irreversible</strong>. Once a transaction
              is signed and included in a block, it cannot be undone. Potdo provides pre-flight
              checks (balance verification, fee estimation) to help prevent errors, but the ultimate
              responsibility for signing rests with you.
            </p>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-purple-400">
              8. Modifications
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              We reserve the right to modify these Terms of Service at any time. Changes will be
              reflected by updating the &quot;Last updated&quot; date. Continued use of Potdo after
              changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="mb-3 font-(family-name:--font-display) text-lg font-semibold text-purple-400">
              9. Contact
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              For questions about these terms, please open an issue on our{" "}
              <a
                href="https://github.com/edycutjong/potdo/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 underline underline-offset-2 transition-colors hover:text-purple-300"
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
            <Link href="/privacy" className="transition-colors hover:text-slate-400">
              Privacy
            </Link>
            <Link href="/terms" className="text-slate-400 transition-colors">
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

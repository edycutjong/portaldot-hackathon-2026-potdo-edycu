import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Terms of Service — Potdo",
  description:
    "Terms of service for Potdo, the AI copilot for Portaldot blockchain transactions.",
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] bg-purple-500/4 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-cyan-500/3 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/icon.svg"
              alt="Potdo"
              width={28}
              height={28}
              className="group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all duration-300"
            />
            <span className="text-lg font-bold tracking-tight font-(family-name:--font-display)">
              Potdo
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Page Title */}
        <div className="mb-12">
          <p className="text-sm font-(family-name:--font-jetbrains) text-purple-400 uppercase tracking-[0.2em] mb-3">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-(family-name:--font-display)">
            Terms of{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">
              Service
            </span>
          </h1>
          <p className="mt-3 text-sm text-slate-500 font-(family-name:--font-jetbrains)">
            Last updated: May 27, 2026
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8">
          <section className="glass-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-purple-400 font-(family-name:--font-display) mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              By accessing or using Potdo (&quot;the app&quot;), you agree to be
              bound by these Terms of Service. Potdo is an open-source hackathon
              project provided as-is. If you do not agree to these terms, please
              do not use the application.
            </p>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-purple-400 font-(family-name:--font-display) mb-3">
              2. Description of Service
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Potdo is an AI-powered transaction copilot for the Portaldot
              blockchain. It parses natural language commands into structured
              transaction intents and renders interactive UI previews before
              execution. The application provides:
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-400 list-disc list-inside">
              <li>Natural language intent parsing for Portaldot transactions</li>
              <li>
                Visual transaction preview cards (balance diffs, fee estimates)
              </li>
              <li>Wallet integration for transaction signing</li>
              <li>
                On-chain query tools (balance, staking, identity, vesting)
              </li>
              <li>Demo mode for exploring the app without a wallet</li>
            </ul>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-purple-400 font-(family-name:--font-display) mb-3">
              3. No Financial Advice
            </h2>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 mb-3">
              <p className="text-sm text-amber-400 font-medium">
                ⚠️ Important Disclaimer
              </p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Potdo is a{" "}
              <strong className="text-slate-200">
                developer tool and hackathon prototype
              </strong>
              , not a financial advisor. Nothing in this application constitutes
              financial, investment, tax, or legal advice. You are solely
              responsible for your own blockchain transactions. Always verify
              transaction details before signing.
            </p>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-purple-400 font-(family-name:--font-display) mb-3">
              4. User Responsibilities
            </h2>
            <ul className="space-y-2 text-sm text-slate-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5 shrink-0">→</span>
                <span>
                  <strong className="text-slate-200">Wallet Security</strong> —
                  You are solely responsible for the security of your wallet,
                  private keys, and seed phrases. Potdo never requests or stores
                  these.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5 shrink-0">→</span>
                <span>
                  <strong className="text-slate-200">
                    Transaction Verification
                  </strong>{" "}
                  — While Potdo provides preview cards, you must independently
                  verify all transaction parameters before signing with your
                  wallet.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5 shrink-0">→</span>
                <span>
                  <strong className="text-slate-200">Compliance</strong> — You
                  are responsible for complying with all applicable laws and
                  regulations in your jurisdiction regarding cryptocurrency
                  transactions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5 shrink-0">→</span>
                <span>
                  <strong className="text-slate-200">No Misuse</strong> — You
                  agree not to use Potdo for any illegal, fraudulent, or harmful
                  activities.
                </span>
              </li>
            </ul>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-purple-400 font-(family-name:--font-display) mb-3">
              5. Limitation of Liability
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Potdo is provided{" "}
              <strong className="text-slate-200">
                &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;
              </strong>{" "}
              without warranties of any kind, either express or implied. To the
              maximum extent permitted by law:
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-400 list-disc list-inside">
              <li>
                We are not liable for any loss of funds, tokens, or digital
                assets
              </li>
              <li>
                We do not guarantee the accuracy of transaction previews, fee
                estimates, or balance displays
              </li>
              <li>
                We are not responsible for failed, delayed, or incorrect
                transactions
              </li>
              <li>
                We are not liable for Portaldot network downtime or RPC endpoint
                failures
              </li>
              <li>
                We are not responsible for any third-party service outages
                (OpenAI, Supabase, Vercel)
              </li>
            </ul>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-purple-400 font-(family-name:--font-display) mb-3">
              6. Intellectual Property
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Potdo is released under the{" "}
              <strong className="text-slate-200">MIT License</strong>. You are
              free to use, modify, and distribute the source code in accordance
              with the license terms. The Potdo name, logo, and brand assets
              are the property of the project maintainer. &quot;Portaldot&quot;
              is a trademark of its respective owners.
            </p>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-purple-400 font-(family-name:--font-display) mb-3">
              7. Blockchain Transactions Are Irreversible
            </h2>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 mb-3">
              <p className="text-sm text-red-400 font-medium">
                🔴 Critical Notice
              </p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              All transactions submitted through Potdo to the Portaldot
              blockchain are{" "}
              <strong className="text-slate-200">
                final and irreversible
              </strong>
              . Once a transaction is signed and included in a block, it cannot
              be undone. Potdo provides pre-flight checks (balance verification,
              fee estimation) to help prevent errors, but the ultimate
              responsibility for signing rests with you.
            </p>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-purple-400 font-(family-name:--font-display) mb-3">
              8. Modifications
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time.
              Changes will be reflected by updating the &quot;Last updated&quot;
              date. Continued use of Potdo after changes constitutes acceptance
              of the modified terms.
            </p>
          </section>

          <section className="glass-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-purple-400 font-(family-name:--font-display) mb-3">
              9. Contact
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              For questions about these terms, please open an issue on our{" "}
              <a
                href="https://github.com/edycutjong/potdo/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
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
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            © 2026 Edy Cu. MIT License.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <Link
              href="/privacy"
              className="hover:text-slate-400 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-slate-400 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/"
              className="hover:text-slate-400 transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

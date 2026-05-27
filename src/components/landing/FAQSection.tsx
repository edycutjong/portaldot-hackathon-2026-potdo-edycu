"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "Do I need an API key to try Potdo?",
    answer: "No! Demo mode works out of the box with deterministic intent parsing. Just clone the repo, run npm install && npm run dev, and start typing commands. No OpenAI key, no wallet extension required.",
  },
  {
    question: "How does the AI understand my transaction intent?",
    answer: "Potdo uses a deterministic NLP intent parser that recognizes patterns like \"Send X POT to Y\" and \"Airdrop X POT to A, B, and C\". In production mode with an OpenAI API key, it upgrades to GPT-4o-mini with Structured Outputs for more flexible parsing.",
  },
  {
    question: "Is this safe to use with real tokens?",
    answer: "Potdo never has access to your private keys. All signing happens through the Portaldot browser wallet extension. Before every transaction, you see a full preview card with amount, recipient, gas fee, and balance diff — so you know exactly what you're signing.",
  },
  {
    question: "What is Portaldot?",
    answer: "Portaldot is a Substrate-based Layer 1 blockchain. POT is the native gas token with 14 decimal places. Potdo is built specifically for Portaldot's runtime, using its native pallets (balances, utility, system) for all on-chain operations.",
  },
  {
    question: "Can I batch multiple transfers?",
    answer: "Yes! Type something like \"Airdrop 5 POT to Alice, Bob, and Charlie\" and Potdo will parse all recipients, create a utility.batch extrinsic, and show you a BatchCard preview with all transfers listed before you sign.",
  },
  {
    question: "What happens if I don't have enough balance?",
    answer: "Potdo checks your balance before rendering the preview card. If you have insufficient funds, the card renders with a red border and a clear warning message. The Execute button is blocked so you can't accidentally waste gas on a failing transaction.",
  },
  {
    question: "Is the code open source?",
    answer: "Yes, Potdo is MIT-licensed and fully open source on GitHub. The entire codebase has 100% test coverage with 148 tests across 14 suites.",
  },
];

function ChevronIcon({ className, isOpen }: { className: string; isOpen: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="glass-card overflow-hidden transition-all duration-300 hover:border-white/10"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"
              aria-expanded={isOpen}
            >
              <span className="text-sm sm:text-base font-medium text-slate-200">
                {item.question}
              </span>
              <ChevronIcon className="w-5 h-5 text-slate-500 shrink-0" isOpen={isOpen} />
            </button>
            <div
              className="accordion-content"
              data-open={isOpen}
            >
              <div className="accordion-inner">
                <div className="px-5 pb-5 pt-0">
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

# ⚡ Potdo — Agent Instructions

## Project
AI copilot that turns plain English into secure, visual Portaldot transactions. Uses Generative UI (Vercel AI SDK) to stream interactive React components into a chat interface — see the state change before you sign.

## Hackathon
**DoraHacks Portaldot Online S1 Hackathon 2026** — Targeting "AI-Powered Onchain Workflows" (primary) and "Native Onchain Apps" (secondary).

## Structure
- `src/app/` — Next.js 16 App Router pages (dashboard, API routes)
- `src/components/` — React 19 components (ChatInterface, TransferCard, BatchCard, BalanceWidget, TxConfirmation, TxError, Header, CommandHistory, MessageBubble)
- `src/lib/` — Shared types, constants, formatting utilities, intent parser, Supabase client
- `src/__tests__/` — Jest test suites (23 suites, 244 tests, 100% coverage)

## Tech Stack
| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19 |
| **Styling** | Tailwind CSS v4 |
| **AI Engine** | Vercel AI SDK (streamUI Generative UI) |
| **LLM** | OpenAI GPT-4o-mini (Structured Outputs) |
| **Chain SDK** | Portaldot JS SDK |
| **Database** | Supabase (PostgreSQL) |
| **Animation** | Framer Motion |
| **Testing** | Jest + React Testing Library |
| **Deploy** | Vercel |

## Key Rules
- **Frontend** = ESM (import), Next.js 16, React 19, Tailwind v4
- **Tests** = Jest globals (describe/it/expect), NOT vitest
- **Demo Mode** = No env vars = graceful no-ops (no wallet/API needed)
- **CI** = npm run ci = lint + typecheck + test:coverage
- **Build** = npm run build with Node.js >= 20.9.0
- **Colors** = Cyan (#06b6d4) primary, Purple (#a855f7) AI, Green (#22c55e) success, Red (#ef4444) errors, Amber (#f59e0b) pending
- **Typography** = Inter (body), JetBrains Mono (data/addresses/amounts)
- **Aesthetic** = Dark mode, glassmorphism cards, grid background, glow effects

## Critical Patterns
- All state initialization uses lazy initializers (not setState-in-useEffect)
- Components using hooks must have 'use client' directive
- params is a Promise in Next.js 16 — must await
- RouteContext for route handler context typing
- Unused catch variables use underscore prefix (_err)
- POT token uses 14 decimals (not 12!)
- RPC endpoint: wss://mainnet.portaldot.io

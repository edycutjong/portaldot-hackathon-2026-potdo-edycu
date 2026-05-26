<div align="center">
  <img src="public/icon.svg" alt="Potdo Icon" width="80" height="80">
  <h1>Potdo ⚡</h1>
  <p><em>AI copilot that turns plain English into secure, visual Portaldot transactions — see the state change before you sign.</em></p>
  <img src="docs/readme-hero.png" alt="Potdo" width="100%">

  <br/>

  [![Live Demo](https://img.shields.io/badge/🚀_Live-Demo-06b6d4?style=for-the-badge)](https://potdo.edycu.dev)
  [![Pitch Video](https://img.shields.io/badge/🎬_Pitch-Video-ef4444?style=for-the-badge)](https://youtu.be/your-video)
  [![Built for Portaldot](https://img.shields.io/badge/DoraHacks-Portaldot_Online_S1-8b5cf6?style=for-the-badge)](https://dorahacks.io/hackathon/portaldot-online-s1/detail)

  <br/>

  ![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat&logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
  ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
  ![Tailwind](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=flat&logo=tailwindcss&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
  ![ChatGPT](https://img.shields.io/badge/ChatGPT-74AA9C?style=flat&logo=openai&logoColor=white)
  ![Polkadot](https://img.shields.io/badge/Polkadot_API-E6007A?style=flat&logo=polkadot&logoColor=white)
  [![CI](https://github.com/edycutjong/potdo/actions/workflows/ci.yml/badge.svg)](https://github.com/edycutjong/potdo/actions/workflows/ci.yml)

</div>

---

## 💡 The Problem & Solution

**Blind signing kills trust.** Substrate wallets show raw hex extrinsics that 99% of users can't read. Newcomers have no idea what they're approving, and even experienced users make costly mistakes.

**Potdo** eliminates blind signing on Portaldot by letting users describe transactions in plain English. The AI intent parser converts natural language into structured transaction previews — interactive React cards that show sender, receiver, amount, gas, and balance diff — all before you sign.

**Key Features:**
- ⚡ **Natural Language Transactions** — Type "Send 10 POT to Alice" and get an interactive transfer preview card
- 📦 **Batch Airdrops** — "Airdrop 5 POT to Alice, Bob, and Charlie" processes multiple recipients in one command
- 💰 **Live Balance Checks** — "What's my balance?" renders a real-time balance widget with free/reserved/frozen breakdown
- 🔴 **Smart Error Translation** — Substrate errors decoded into plain English with actionable suggestions
- 🎉 **Celebration UX** — Canvas confetti burst on successful transactions
- 🛡️ **Insufficient Balance Protection** — Red-bordered cards with clear warnings before you can execute

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19 |
| **Styling** | Tailwind CSS v4 |
| **AI Intent Parser** | Deterministic NLP (pattern matching + word-to-number) |
| **Chain SDK** | `@polkadot/api` + `@polkadot/extension-dapp` |
| **Database** | Supabase (PostgreSQL) — transaction logging |
| **Animation** | Framer Motion + Canvas API (confetti) |
| **Testing** | Jest + React Testing Library (97%+ coverage) |

```
User Input → Intent Parser → Structured Intent → Generative UI Card → Execute on Chain
    ↓              ↓                 ↓                    ↓                    ↓
"Send 10     parse regex +      TransferIntent      TransferCard        @polkadot/api
 POT to      word numbers       { to, amount,       with balance        extrinsic.sign()
 Alice"                          toAddress }         diff + gas
```

## 🏆 Hackathon Tracks Targeted

- **AI-Powered Onchain Workflows** — Potdo is the AI → on-chain pipeline. Natural language in, signed extrinsic out.
- **Native Onchain Apps** — Full Portaldot-native experience using `@polkadot/api` with 14-decimal POT precision.

## ⛓️ Portaldot Native Integration (Sponsor Criteria)

### Thesis
Potdo is architecturally inseparable from Portaldot. Every component is hardwired to Portaldot's Substrate runtime, RPC layer, and native token economics. Removing Portaldot would require a complete rewrite of the entire application.

### Portaldot API Methods Used (8 total)

| # | Feature | Usage |
|---|---------|-------|
| 1 | `api.query.system.account(address)` | Pre-flight balance simulation |
| 2 | `api.tx.balances.transferKeepAlive(dest, amount)` | Core transfer execution |
| 3 | `api.tx.utility.batch([...calls])` | Multi-recipient batch airdrop |
| 4 | `tx.signAndSend(account, { signer }, callback)` | Transaction lifecycle streaming |
| 5 | `@polkadot/extension-dapp` (web3Enable + web3Accounts) | Wallet integration |
| 6 | WebSocket RPC subscription | Live balance updates |
| 7 | POT native gas token | Every tx pays gas in POT |
| 8 | Substrate SS58 address format | AI validates against SS58 prefix |

### Without Portaldot
- **Balance simulation** → Custom API adapter per chain
- **Token transfer** → Different ABI per chain + gas estimation
- **Batch airdrop** → Multicall contract deployment OR sequential txs
- **Wallet signing** → MetaMask OR custom signer per chain
- **Transaction status** → Custom event polling

Take Portaldot out and you'd need 3 separate systems + a bridge layer. Potdo is built for Portaldot from the ground up.

## 📐 Technical Architecture

### System Flow
```mermaid
graph TB
    subgraph Client["Browser"]
        UI["Next.js 16 Frontend"]
        Wallet["Polkadot.js Extension"]
    end

    subgraph Server["Vercel Edge / Serverless"]
        RSC["React Server Components"]
        AI["Vercel AI SDK"]
        Parser["Intent Parser"]
    end

    subgraph External["External Services"]
        OpenAI["OpenAI API (GPT-4o-mini)"]
        RPC["Portaldot RPC (wss://mainnet.portaldot.io)"]
        Supa["Supabase (Tx History)"]
    end

    UI -->|"User types command"| RSC
    RSC --> AI
    AI -->|"Structured Output"| OpenAI
    OpenAI -->|"Intent JSON"| Parser
    Parser -->|"Fetch balance"| RPC
    Parser -->|"Stream UI Card"| RSC
    RSC -->|"Generative UI"| UI
    UI -->|"User clicks Execute"| Wallet
    Wallet -->|"Sign extrinsic"| RPC
    RPC -->|"Tx hash"| Supa
    Supa -->|"Tx status"| UI

    style Client fill:#0f172a,color:#e2e8f0,stroke:#06b6d4
    style Server fill:#1e293b,color:#e2e8f0,stroke:#a855f7
    style External fill:#0f172a,color:#e2e8f0,stroke:#22c55e
```

### Sequence Flow
```mermaid
sequenceDiagram
    actor User
    participant UI as Next.js Frontend
    participant RSC as Server Components
    participant AI as OpenAI API
    participant RPC as Portaldot RPC
    participant Wallet as Polkadot.js Ext

    User->>UI: "Send 10 POT to Alice"
    UI->>RSC: Stream request
    RSC->>AI: Parse intent (Structured Outputs)
    AI-->>RSC: { action: "transfer", amount: 10, to: "5Grw..." }
    RSC->>RPC: Query sender balance
    RPC-->>RSC: { free: 100.5 POT }
    RSC-->>UI: Stream <TransferCard> component
    Note over UI: User sees:<br/>From: You (100.5 POT)<br/>To: Alice<br/>Amount: 10 POT<br/>After: 90.5 POT<br/>[Execute]
    User->>UI: Clicks "Execute"
    UI->>Wallet: Sign extrinsic
    Wallet-->>UI: Signed payload
    UI->>RPC: Submit extrinsic
    RPC-->>UI: Tx hash + block
    Note over UI: 🎉 Confetti animation<br/>+ Explorer link
```

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20
- npm

### Installation
```bash
git clone https://github.com/edycutjong/potdo.git
cd potdo
npm install
cp .env.example .env.local  # Add your API keys
npm run dev
```

> **For Judges:** No API keys needed! Demo mode works out of the box with deterministic intent parsing. Just `npm install && npm run dev`.

### Supabase Setup (Optional for Persistence)

Potdo uses Supabase to persist transaction history. To set it up:

1. Create a project in [Supabase](https://supabase.com).
2. Go to the SQL Editor and execute the schema located in [db/schema.sql](db/schema.sql) to create the `potdo_transactions` table and configure Row Level Security (RLS).
3. Copy your project URL and Anon Key and add them to your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

#### Database Schema

```mermaid
erDiagram
    POTDO_TRANSACTIONS {
        bigint id PK "Auto-incrementing ID"
        text sender "Sender account address"
        text command "User natural language query"
        jsonb intent "Parsed structured intent metadata"
        text tx_hash "On-chain extrinsic transaction hash"
        bigint block_number "Blockchain block height containing the tx"
        text status "Transaction state (pending | finalized | failed)"
        text error_message "Plain-text error log if transaction failed"
        text gas_fee "Fee cost in POT"
        timestamp_tz created_at "Timestamp of creation in UTC"
    }
```

## 📊 Demo & Seed Data

For a seamless demonstration, the application is pre-configured with canonical Substrate development accounts. 

### Named Accounts (Address Book)
| Name | Purpose | Pre-funded POT | Address |
|---|---|---|---|
| **Demo Wallet** | The sender (connected via Polkadot.js) | 500 POT | `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY` (Alice Seed) |
| **Alice** | Primary recipient for single transfers | 10 POT | `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY` |
| **Bob** | Batch transfer recipient #2 | 5 POT | `5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty` |
| **Charlie** | Batch transfer recipient #3 | 0 POT | `5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y` |
| **Dave** | Error validation demonstration target | 0 POT | `5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYUM3aUNew` |

### Core Demo Scenarios
1. **Single Transfer Flow**: *"Send 10 POT to Alice"*
   * Checks sender balance (500 POT) -> streams `<TransferCard>` showing post-transaction balance simulation (490 POT) -> click **Execute** to sign and finalize.
2. **Batch Airdrop Flow**: *"Airdrop 5 POT to Alice, Bob, and Charlie"*
   * Parses multiple recipients -> streams `<BatchCard>` showing a table of transfers -> click **Execute Batch** to sign and submit a single `utility.batch` extrinsic.
3. **Error Protection**: *"Send 5000 POT to Dave"*
   * Checks sender balance (475 POT) -> streams `<TransferCard>` with a **red warning** of insufficient funds -> blocks wallet popup to prevent gas waste.

## 🧪 Testing & CI

```bash
npm run lint          # ESLint
npm run typecheck     # TypeScript check
npm run test          # Run 136 tests
npm run test:coverage # Coverage report (100%)
npm run ci            # Full CI pipeline
```

**Coverage Report:**
| Module | Stmts | Branch | Funcs | Lines |
|---|---|---|---|---|
| **Overall** | 100% | 100% | 100% | 100% |
| `lib/` | 100% | 100% | 100% | 100% |
| `components/` | 100% | 100% | 100% | 100% |

## 📁 Project Structure
```
potdo/
├── docs/                # README assets (hero banner)
├── public/              # App icon, OG image
├── src/
│   ├── app/
│   │   ├── api/chat/     # Chat API route (intent parsing)
│   │   ├── layout.tsx    # Root layout with fonts + metadata
│   │   ├── page.tsx      # Main dashboard page
│   │   └── not-found.tsx # 404 page with cybernetic theme
│   ├── components/
│   │   ├── ChatInterface.tsx   # Main chat with message rendering
│   │   ├── TransferCard.tsx    # Single transfer preview
│   │   ├── BatchCard.tsx       # Multi-recipient airdrop preview
│   │   ├── BalanceWidget.tsx   # Balance display widget
│   │   ├── TxConfirmation.tsx  # Success card with confetti
│   │   ├── TxError.tsx         # Error card with translation
│   │   ├── Header.tsx          # App header with wallet status
│   │   ├── CommandHistory.tsx  # Sidebar command history
│   │   └── MessageBubble.tsx   # Chat message bubble
│   ├── lib/
│   │   ├── constants.ts       # Chain constants (14 decimals!)
│   │   ├── types.ts           # TypeScript types
│   │   ├── format.ts          # POT conversion, address validation
│   │   ├── intent-parser.ts   # Core NLP intent parser
│   │   ├── ai-tools.ts        # Server-only re-export
│   │   └── supabase.ts        # Supabase client with demo fallback
│   └── __tests__/             # 14 test suites, 136 tests
├── .env.example         # Environment template
├── .github/             # CI, CodeQL, Dependabot
├── AGENTS.md            # Agent instructions
├── LICENSE              # MIT
├── SECURITY.md          # Security policy
└── README.md            # You are here
```

## 📄 License

[MIT](LICENSE) © 2026 Edy Cu

## 🙏 Acknowledgments

Built for the [Portaldot Online S1 Hackathon](https://dorahacks.io/hackathon/portaldot-online-s1/detail) on DoraHacks. Thank you to the Portaldot team for the chain infrastructure and documentation.

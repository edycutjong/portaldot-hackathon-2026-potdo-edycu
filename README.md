<div align="center">
  <img src="public/icon.svg" alt="Potdo Icon" width="80" height="80">
  <h1>Potdo ⚡</h1>
  <p><em>AI copilot that turns plain English into secure, visual Portaldot transactions — see the state change before you sign.</em></p>
  <img src="docs/readme-hero.png" alt="Potdo" width="100%">

  <br/>

[![Live Demo](https://img.shields.io/badge/🚀_Live-Demo-06b6d4?style=for-the-badge)](https://potdo.edycu.dev)
[![Pitch Video](https://img.shields.io/badge/🎬_Pitch-Video-ef4444?style=for-the-badge)](#)
[![Pitch Deck](https://img.shields.io/badge/📊_Pitch-Deck-a855f7?style=for-the-badge)](docs/pitch_deck.md)
[![Demo Guide](https://img.shields.io/badge/📖_Demo-Guide-22c55e?style=for-the-badge)](DEMO.md)
[![Built for Portaldot](https://img.shields.io/badge/DoraHacks-Portaldot_Online_S1-8b5cf6?style=for-the-badge)](https://dorahacks.io/hackathon/portaldot-online-s1/detail)

  <br/>

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=flat&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![ChatGPT](https://img.shields.io/badge/ChatGPT-74AA9C?style=flat&logo=openai&logoColor=white)
![Portaldot](https://img.shields.io/badge/Portaldot_SDK-E6007A?style=flat)
[![CI](https://github.com/edycutjong/potdo/actions/workflows/ci.yml/badge.svg)](https://github.com/edycutjong/potdo/actions/workflows/ci.yml)

</div>

---

## 💡 The Problem & Solution

**Blind signing kills trust.** Substrate wallets show raw hex extrinsics that 99% of users can't read. Newcomers have no idea what they're approving, and even experienced users make costly mistakes.

**Potdo** eliminates blind signing on Portaldot by letting users describe transactions in plain English. The AI intent parser converts natural language into structured transaction previews — interactive React cards that show sender, receiver, amount, gas, and balance diff — all before you sign.

**Key Features:**

- ⚡ **Natural Language Transactions** — Type "Send 10 POT to Alpha" and get an interactive transfer preview card
- 📦 **Batch Airdrops** — "Airdrop 5 POT to Alpha, Beta, and Gamma" processes multiple recipients in one command
- 💰 **Live Balance Checks** — "What's my balance?" renders a real-time balance widget with free/reserved/frozen breakdown
- 🔴 **Smart Error Translation** — Substrate errors decoded into plain English with actionable suggestions
- 🎉 **Celebration UX** — Canvas confetti burst on successful transactions
- 🛡️ **Insufficient Balance Protection** — Red-bordered cards with clear warnings before you can execute
- 🛡️ **Secure Delegation (Guarded AI Proxy)** — Delegate restricted execution authority to the agent. Send transactions instantly without browser wallet signature popups, fully guarded by the Substrate proxy pallet.

## 📸 Screenshots

<div align="center">

### Landing Page

<img src="docs/screenshots/01-landing.png" alt="Potdo Landing Page" width="100%">

### TransferCard — Generative UI in Action

<img src="docs/screenshots/02-transfer-card.png" alt="TransferCard in Chat" width="100%">

### Transaction Confirmed 🎉

<img src="docs/screenshots/03-success.png" alt="Success State with Confetti" width="100%">

</div>

## 🏗️ Architecture & Tech Stack

| Layer                | Technology                                                 |
| -------------------- | ---------------------------------------------------------- |
| **Frontend**         | Next.js 16 (App Router), React 19                          |
| **Backend API**      | Python 3.12 (FastAPI), substrate-interface (100% coverage) |
| **Styling**          | Tailwind CSS v4                                            |
| **AI Intent Parser** | Deterministic NLP (pattern matching + word-to-number)      |
| **Chain SDK**        | Portaldot SDK                                              |
| **Database**         | Supabase (PostgreSQL) — transaction logging                |
| **Animation**        | Framer Motion + Canvas API (confetti)                      |
| **Testing**          | Jest + React Testing Library (99.8% coverage)              |

```
User Input → Intent Parser → Structured Intent → Generative UI Card → Execute on Chain
    ↓              ↓                 ↓                    ↓                    ↓
"Send 10     parse regex +      TransferIntent      TransferCard        Portaldot SDK
 POT to      word numbers       { to, amount,       with balance        extrinsic.sign()
 Alice"                          toAddress }         diff + gas
```

## 🏆 Hackathon Tracks Targeted

- **AI-Powered Onchain Workflows** — Potdo is the AI → on-chain pipeline. Natural language in, signed extrinsic out.
- **Native Onchain Apps** — Full Portaldot-native experience using the Portaldot SDK with 14-decimal POT precision.

## ⛓️ Portaldot Native Integration (Sponsor Criteria)

### Thesis

Potdo is architecturally inseparable from Portaldot. Every component is hardwired to Portaldot's Substrate runtime, RPC layer, and native token economics. Removing Portaldot would require a complete rewrite of the entire application.

### Portaldot API Methods Used (12 total)

| #   | Feature                                           | Usage                                    |
| --- | ------------------------------------------------- | ---------------------------------------- |
| 1   | `api.query.system.account(address)`               | Pre-flight balance simulation            |
| 2   | `api.tx.balances.transferKeepAlive(dest, amount)` | Core transfer execution                  |
| 3   | `api.tx.utility.batch([...calls])`                | Multi-recipient batch airdrop            |
| 4   | `tx.signAndSend(account, { signer }, callback)`   | Transaction lifecycle streaming          |
| 5   | Portaldot Wallet SDK                              | Wallet integration                       |
| 6   | WebSocket RPC subscription                        | Live balance updates                     |
| 7   | POT native gas token                              | Every tx pays gas in POT                 |
| 8   | Substrate SS58 address format                     | AI validates against SS58 prefix         |
| 9   | `api.query.proxy.proxies(address)`                | Pre-flight proxy delegation status       |
| 10  | `api.tx.proxy.addProxy(delegate, type, delay)`    | Delegate restricted proxy authority      |
| 11  | `api.tx.proxy.removeProxy(delegate, type, delay)` | Revoke delegated proxy authority         |
| 12  | `api.tx.proxy.proxy(real, force_type, call)`      | Wrap and execute call via proxy delegate |

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
        Wallet["Portaldot compatible Wallet"]
    end

    subgraph Server["Vercel Edge / FastAPI Backend"]
        RSC["React Server Components"]
        API["FastAPI Backend (Python)"]
        Parser["Intent Parser"]
    end

    subgraph External["External Services"]
        OpenAI["OpenAI API (GPT-4o-mini)"]
        RPC["Portaldot RPC (wss://mainnet.portaldot.io)"]
        Supa["Supabase (Tx History)"]
    end

    UI -->|"User types command"| RSC
    RSC --> Parser
    Parser -->|"Structured Output"| OpenAI
    OpenAI -->|"Intent JSON"| Parser
    Parser -->|"Fetch balance"| RPC
    Parser -->|"Stream UI Card"| RSC
    RSC -->|"Generative UI"| UI

    UI -->|"1. Standard: Sign Extrinsic"| Wallet
    Wallet -->|"Broadcast"| RPC

    UI -->|"2. Guarded Proxy: Direct Execution"| API
    API -->|"Sign with Agent Key & Wrap proxy.proxy"| RPC

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
    participant API as FastAPI Backend (Python)
    participant RPC as Portaldot RPC
    participant Wallet as Portaldot Wallet

    User->>UI: "Send 10 POT to Alpha"
    UI->>RSC: Stream request
    RSC->>API: Fetch sender balance & proxy status
    API->>RPC: Query state
    RPC-->>API: { balance: 100.5 POT, proxied: true/false }
    API-->>RSC: { balance: 100.5 POT, isProxyActive: true/false }
    RSC-->>UI: Stream <TransferCard> component

    alt Option A: Guarded Proxy Enabled
        User->>UI: Click "Execute" (popup-free)
        UI->>API: POST /transfer { proxied: true }
        API->>RPC: Submit proxy(real, transferKeepAlive) signed by Agent Key
        RPC-->>API: Tx Hash
        API-->>UI: Confirmed (finalized)
    else Option B: Standard Wallet Signing
        User->>UI: Click "Execute"
        UI->>Wallet: Request Signature (popup)
        Wallet-->>UI: Signed payload
        UI->>API: POST /submit-transfer { signature }
        API->>RPC: Submit signed extrinsic
        RPC-->>API: Tx Hash
        API-->>UI: Confirmed (finalized)
    end
    Note over UI: 🎉 Confetti animation + Explorer link
```

### 🌐 System Environments & Deployment Tiers

Potdo runs in three distinct environments designed for different phases of the lifecycle:

1. **Demo Mode (In-Memory Simulation)**
   - **Architecture**: **Frontend Only** (pure in-memory browser simulation).
   - **Operation**: All actions (balances, transfers, staking, name updates) are simulated instantly inside React state and persisted to the browser's `localStorage`. No network request to the backend or external RPC is required.
   - **Target Deployment**: Hosted on **Vercel** for instant, zero-setup public testing.

2. **Testnet Mode (Local Dev/Judging)**
   - **Architecture**: **Frontend** + **FastAPI Backend (Python SDK)** + **Local Portaldot Dev Node**.
   - **Operation**: Frontend forwards requests to the FastAPI backend. The backend uses the Portaldot Python SDK (`substrate-interface`) to construct, sign, and submit extrinsics directly to the local dev node running at `ws://127.0.0.1:9944`.
   - **Target Deployment**: Run locally using the preconfigured `Makefile` or Docker compose. The backend can also be hosted on **Railway** pointed to a public VPS chain node.

3. **Mainnet Mode (Production)**
   - **Architecture**: **Frontend** + **FastAPI Backend (Python SDK)** + **Portaldot Mainnet RPC**.
   - **Operation**: Same as Testnet mode, but the backend connects directly to the live production mainnet nodes (e.g. `wss://mainnet.portaldot.io`).
   - **Target Deployment**: Hosted on **Vercel** (Frontend) + **Railway** (Backend API).

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- npm
- Docker (optional, for containerized execution)

### Installation

```bash
git clone https://github.com/edycutjong/potdo.git
cd potdo
make install
```

### 🧑‍⚖️ Judging & Local Verification Guide

To allow a thorough evaluation of all features (including local testnet execution with the Python SDK backend), you can run the entire system locally.

#### Method A: Multi-Terminal Native Run (Recommended)

Open three separate terminal windows/tabs:

1. **Terminal 1: Start the Portaldot Dev Node**

   ```bash
   make testnet
   ```

   _(Launches the local Portaldot testnet node on `ws://127.0.0.1:9944` using the `./testnet/portaldot_dev` binary)._

2. **Terminal 2: Start the FastAPI Python Backend**

   ```bash
   make dev-backend
   ```

   _(Starts the FastAPI server on `http://localhost:8000`, connected directly to the local testnet node)._

3. **Terminal 3: Start the Next.js Web App**
   ```bash
   make dev-frontend
   ```
   _(Starts the UI dev server on `http://localhost:3000` with hot reloading)._

#### Method B: One-Command Docker Compose Run

If you have Docker installed, you can spin up all three services in containerized mode with a single command:

```bash
make docker-up
```

- **Verify status**: `make docker-logs` to watch live node block production and server requests.
- **Stop services**: `make docker-down` to clean up.

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

| Name            | Purpose                                     | Pre-funded POT | Address                                                         |
| --------------- | ------------------------------------------- | -------------- | --------------------------------------------------------------- |
| **Demo Wallet** | The sender (connected via Portaldot Wallet) | 1000 POT       | `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY` (Alice Seed) |
| **Alice**       | Primary recipient for single transfers      | 10 POT         | `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`              |
| **Bob**         | Batch transfer recipient #2                 | 5 POT          | `5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty`              |
| **Charlie**     | Batch transfer recipient #3                 | 0 POT          | `5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y`              |
| **Dave**        | Error validation demonstration target       | 0 POT          | `5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYUM3aUNew`              |

### Core Demo Scenarios

1. **Single Transfer Flow**: _"Send 10 POT to Alpha"_
   - Checks sender balance (1000 POT) -> streams `<TransferCard>` showing post-transaction balance simulation (990 POT) -> click **Execute** to sign and finalize.
2. **Batch Airdrop Flow**: _"Airdrop 5 POT to Alpha, Beta, and Gamma"_
   - Parses multiple recipients -> streams `<BatchCard>` showing a table of transfers -> click **Execute Batch** to sign and submit a single `utility.batch` extrinsic.
3. **Error Protection**: _"Send 5000 POT to Delta"_
   - Checks sender balance (1000 POT) -> streams `<TransferCard>` with a **red warning** of insufficient funds -> blocks wallet popup to prevent gas waste.

## 🧪 Testing & CI

```bash
npm run lint          # ESLint
npm run typecheck     # TypeScript check
npm run test          # Run 282 tests
npm run test:coverage # Coverage report (99.8%)
npm run ci            # Full CI pipeline
```

**Coverage Report:**
| Module | Stmts | Branch | Funcs | Lines |
|---|---|---|---|---|
| **Overall** | 99.81% | 99.60% | 100% | 100% |
| `lib/` | 100% | 100% | 100% | 100% |
| `components/` | 99.70% | 99.42% | 100% | 100% |

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
│   └── __tests__/             # 24 test suites, 282 tests
├── .env.example         # Environment template
├── .github/             # CI, CodeQL, Dependabot
├── AGENTS.md            # Agent instructions
├── DEMO.md              # Step-by-step demo walkthrough for judges
├── LICENSE              # MIT
├── SECURITY.md          # Security policy
├── scripts/             # Verification scripts
└── README.md            # You are here
```

## ⚡ Portaldot Integration Depth

Potdo is architecturally inseparable from Portaldot. Every component is hardwired to Portaldot's Substrate runtime, RPC layer, and native token economics.

| #   | Portaldot API                                     | Usage in Potdo                   |
| --- | ------------------------------------------------- | -------------------------------- |
| 1   | `api.query.system.account(address)`               | Pre-flight balance simulation    |
| 2   | `api.tx.balances.transferKeepAlive(dest, amount)` | Core transfer execution          |
| 3   | `api.tx.utility.batch([...calls])`                | Multi-recipient batch airdrop    |
| 4   | `tx.signAndSend(account, { signer }, callback)`   | Transaction lifecycle streaming  |
| 5   | Portaldot Wallet SDK                              | Wallet integration               |
| 6   | WebSocket RPC subscription                        | Live balance updates             |
| 7   | POT native gas token (14 decimals)                | Every tx pays gas in POT         |
| 8   | Substrate SS58 address format                     | AI validates against SS58 prefix |

> Remove Portaldot and Potdo ceases to function. No fallback, no abstraction layer. This is a **Portaldot-native** application.

## 🪞 Honest Limitations

We believe transparency builds trust — especially in a hackathon:

1. **No custom ink! contracts** — MVP uses only native pallets (`balances`, `utility`, `system`). Deliberate choice for demo reliability over complexity.
2. **RPC endpoint dependency** — Demo depends on a working Portaldot RPC (`wss://mainnet.portaldot.io`). Fallback: demo mode with deterministic mock data.
3. **AI is pattern matching (demo mode)** — Without an OpenAI API key, the intent parser uses deterministic word-to-number NLP rather than LLM inference. This is _honest_ — the demo should work without external dependencies.
4. **POT token acquisition unresolved** — No public faucet or exchange listing exists. On-chain transactions require organizer-provided tokens.

## 📄 License

[MIT](LICENSE) © 2026 Edy Cu

## 🙏 Acknowledgments

Built for the [Portaldot Online S1 Hackathon](https://dorahacks.io/hackathon/portaldot-online-s1/detail) on DoraHacks. Thank you to the Portaldot team for the chain infrastructure and documentation.

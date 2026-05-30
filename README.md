# 🌀 Potdo DEMO

## Project Overview

- **Problem Statement:** Blind signing is the #1 UX barrier in the Portaldot ecosystem. When Substrate wallets display raw hex extrinsics like `0x060003d43...`, 99% of users cannot understand what they are approving. This leads to costly mistakes, phishing vulnerability, and prevents new user onboarding.

- **Solution:** Potdo is an AI copilot that transforms plain English commands into interactive, visual transaction previews. Users type "Send 10 POT to Alpha" and receive a rich UI card showing sender, recipient, amount, gas estimate, and post-transaction balance simulation — all before signing. Core features include natural language transfers, batch airdrops (`utility.batch`), live balance queries, staking/unstaking, identity management, vesting schedule viewing, gas fee estimation, and a Guarded AI Proxy for popup-free execution via the Substrate `proxy` pallet.

- **Blockchain Relevance:** Potdo is a Portaldot-native application built directly on Substrate. It integrates with 12 Portaldot SDK API methods across 6 Substrate pallets (`balances`, `utility`, `staking`, `identity`, `vesting`, `proxy`). All transactions execute on the Portaldot chain using POT as the native gas token with 14-decimal precision. The application connects to the Portaldot RPC endpoint (`wss://mainnet.portaldot.io`) and validates addresses against the SS58 format. Removing Portaldot would require a complete application rewrite.

### Technical Architecture

```
User Input → Intent Parser → Structured Intent → Generative UI Card → Execute on Chain
    ↓              ↓                 ↓                    ↓                    ↓
"Send 10     parse regex +      TransferIntent      TransferCard        Portaldot SDK
 POT to      word numbers       { to, amount,       with balance        extrinsic.sign()
 Alice"                          toAddress }         diff + gas
```

**Three-Tier Deployment:**

1. **Demo Mode** — Pure in-memory browser simulation (Vercel). No setup needed.
2. **Testnet Mode** — Frontend + FastAPI backend + local Portaldot dev node (`ws://127.0.0.1:9944`).
3. **Mainnet Mode** — Frontend (Vercel) + Backend (Railway) + Portaldot mainnet RPC.

**Core Tech Stack:**

| Layer                       | Technology                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| **Blockchain platform**     | Portaldot (Substrate-based chain)                                                          |
| **Smart contract language** | N/A — uses native Substrate pallets (balances, utility, staking, identity, vesting, proxy) |
| **Frontend framework**      | Next.js 16 (App Router), React 19, Tailwind CSS v4                                         |
| **Backend**                 | Python 3.12 (FastAPI), substrate-interface SDK                                             |
| **AI Engine**               | Deterministic NLP Parser + Vercel AI SDK (OpenAI GPT-4o-mini fallback)                     |
| **Database**                | Supabase (PostgreSQL) — transaction audit log                                              |
| **Animation**               | Framer Motion + Canvas API (confetti)                                                      |
| **Testing**                 | Jest + React Testing Library (282 tests, 99.8% coverage) + pytest (100% backend coverage)  |
| **CI/CD**                   | GitHub Actions — 6-stage pipeline (Quality → Security → Build → E2E → Perf → Deploy)       |
| **Security**                | CodeQL SAST + TruffleHog + Dependabot + npm/pip audit                                      |

**Portaldot API Methods Used (12 total):**

| #   | API Method                                        | Usage                                    |
| --- | ------------------------------------------------- | ---------------------------------------- |
| 1   | `api.query.system.account(address)`               | Pre-flight balance simulation            |
| 2   | `api.tx.balances.transferKeepAlive(dest, amount)` | Core transfer execution                  |
| 3   | `api.tx.utility.batch([...calls])`                | Multi-recipient batch airdrop            |
| 4   | `tx.signAndSend(account, { signer }, callback)`   | Transaction lifecycle streaming          |
| 5   | Portaldot Wallet SDK                              | Wallet integration                       |
| 6   | WebSocket RPC subscription                        | Live balance updates                     |
| 7   | POT native gas token (14 decimals)                | Every tx pays gas in POT                 |
| 8   | Substrate SS58 address format                     | AI validates against SS58 prefix         |
| 9   | `api.query.proxy.proxies(address)`                | Pre-flight proxy delegation status       |
| 10  | `api.tx.proxy.addProxy(delegate, type, delay)`    | Delegate restricted proxy authority      |
| 11  | `api.tx.proxy.removeProxy(delegate, type, delay)` | Revoke delegated proxy authority         |
| 12  | `api.tx.proxy.proxy(real, force_type, call)`      | Wrap and execute call via proxy delegate |

### Smart Contracts

N/A — Potdo uses native Substrate pallets only. This is a deliberate design decision for MVP reliability. No ink! contracts are deployed.

### Installation & Setup

#### Requirements

- Node.js ≥ 20
- npm
- Python 3.12 (for backend)
- Docker (optional, for containerized execution)

#### Steps

**1. Clone the repository**

```bash
git clone https://github.com/edycutjong/portaldot-hackathon-2026-potdo-edycu.git
cd portaldot-hackathon-2026-potdo-edycu
```

**2. Install dependencies**

```bash
make install
# Or manually:
npm install
python3 -m pip install -r backend/requirements.txt
```

**3. Launch (Demo Mode — no setup needed)**

```bash
npm run dev
# Visit http://localhost:3000
```

**4. Launch (Testnet Mode — full onchain)**

Open three terminals:

```bash
# Terminal 1: Start local Portaldot dev node
make testnet

# Terminal 2: Start FastAPI backend
make dev-backend

# Terminal 3: Start Next.js frontend
make dev-frontend
```

**5. Launch (Docker — one command)**

```bash
make docker-up
# Testnet → ws://localhost:9944
# Backend → http://localhost:8000
# Frontend → http://localhost:3000
```

### Demo

- **Video:** https://youtu.be/UULsuxPz9XY
- **Live demo:** https://potdo.edycu.dev
- **Pitch deck:** https://potdo.edycu.dev/pitch

**Test accounts (Demo Mode — pre-configured):**

| Name                     | Pre-funded POT | Purpose            |
| ------------------------ | -------------- | ------------------ |
| Demo Wallet (Alice seed) | 1000 POT       | Sender             |
| Alpha / Alice            | 10 POT         | Transfer recipient |
| Beta / Bob               | 5 POT          | Batch recipient    |
| Gamma / Charlie          | 0 POT          | Batch recipient    |
| Delta / Dave             | 0 POT          | Error test target  |

**Core Demo Flow (60 seconds):**

1. Type `Send 10 POT to Alpha` → TransferCard with balance simulation → Execute → Confetti 🎉
2. Type `Airdrop 5 POT to Alpha, Beta, and Gamma` → BatchCard → Execute Batch → Confetti 🎉
3. Type `Send 5000 POT to Delta` → Red warning: insufficient balance → Execute blocked ❌
4. Type `What's my balance?` → BalanceWidget (free/reserved/frozen)

**⚠️ Mock Disclosure:** In Demo Mode (no wallet connected), all balances, transfers, staking, and identity lookups use deterministic in-memory simulation. The core NLP intent parser, UI components, and Generative UI streaming are fully real. In Testnet Mode, all transactions execute on a real local Portaldot dev node.

### Roadmap

**✅ Completed:**

- Natural language intent parser (deterministic NLP + AI fallback)
- 19 React components (TransferCard, BatchCard, BalanceWidget, StakingCard, IdentityCard, VestingWidget, ProxySettingsWidget, etc.)
- FastAPI Python backend with substrate-interface SDK (12 Portaldot API methods)
- Guarded AI Proxy — popup-free execution via Substrate proxy pallet
- 282 unit tests (99.8% coverage) + E2E tests (Playwright) + backend tests (100% coverage)
- 6-stage CI/CD pipeline + CodeQL + Dependabot + TruffleHog
- Docker Compose for one-command local judging
- Pitch deck + demo video

**🔮 Next phase:**

- Multi-chain expansion (Kusama, Astar, other Substrate chains)
- Transaction templates marketplace (share and reuse common workflows)
- Mobile-responsive PWA with offline-first architecture

### Team

- **Team name:** Potdo
- **Members:** Edy Cu (Solo) — Full-stack engineer
- **Contact:** GitHub [@edycutjong](https://github.com/edycutjong)

### License

MIT — see [LICENSE](LICENSE)

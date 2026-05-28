# Potdo Features & Integration Documentation

Potdo is an AI transaction copilot specifically built for the **Portaldot** blockchain. It uses natural language intent parsing (Generative UI via the Vercel AI SDK) to turn English commands into interactive, visual on-chain transactions and state queries.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion
- **AI Engine:** Deterministic NLP Parser + Vercel AI SDK (`streamUI`)
- **Portaldot SDK:** Portaldot JS SDK
- **RPC Endpoint:** `wss://mainnet.portaldot.io`
- **Token:** **POT** (using 14 decimals)
- **Database:** Supabase (for transaction log tracking)

---

## 📖 Command & Feature Reference

Below is the complete guide to all natural language commands supported by Potdo, categorized by their corresponding Substrate pallet.

### 1. Pallet: `balances` (Token Transfers)

Handles simple token transfers and balance queries.

- **Commands:**
  - _"Send 10 POT to Alpha"_
  - _"Transfer all POT to Bob"_
  - _"What's my balance?"_ / _"Check balance"_
- **Pallet Extrinsic:** `api.tx.balances.transferKeepAlive(recipient, amountPlanck)`
- **Pallet Query:** `api.query.system.account(address)`
- **UI Card:** `TransferCard` & `BalanceWidget`
- **Details:** Potdo uses a predefined address book for easy lookup (e.g., Alpha, Beta) and verifies that recipient addresses are valid SS58 formats. It estimates transaction fees and checks if the sender's balance is sufficient before showing the execute button.

---

### 2. Pallet: `utility` (Batch Actions)

Allows bundling multiple transactions into a single atomic signature, saving gas fees.

- **Commands:**
  - _"Airdrop 5 POT to Alpha, Beta, and Gamma"_
  - _"Send 1.5 POT to Alpha and 2.5 POT to Delta"_
- **Pallet Extrinsic:** `api.tx.utility.batch([extrinsics])`
- **UI Card:** `BatchCard`
- **Details:** Potdo parses multiple names separated by commas or "and", aggregates them, computes the cumulative POT amount, and executes a batch extrinsic.

---

### 3. Pallet: `staking` (On-Chain Bonding)

Handles staking (bonding) POT tokens to secure the network and earning rewards.

- **Commands:**
  - _"Stake 100 POT"_ / _"Bond 50 POT to validator Delta"_
  - _"Unstake 50 POT"_ / _"Unbond 20 POT"_
  - _"Show staking info"_ / _"Check my nominations"_
- **Pallet Extrinsic:**
  - Stake: `api.tx.staking.bond(amountPlanck, "Staked")` (optionally batched with `api.tx.staking.nominate([validator])`)
  - Unstake: `api.tx.staking.unbond(amountPlanck)`
- **Pallet Query:** `api.query.staking.bonded` and `api.query.staking.ledger`
- **UI Card:** `StakingCard` (Execution) & `StakingInfoWidget` (Queries)

---

### 4. Pallet: `identity` (On-Chain Profile)

Allows users to associate real-world display names and metadata with their cryptographic addresses.

- **Commands:**
  - _"Set display name to Edy"_ / _"Set my identity display as Antigravity"_
  - _"Who is Alpha?"_ / _"Lookup Bob"_ / _"Check my identity"_
- **Pallet Extrinsic:** `api.tx.identity.setIdentity(identityInfo)`
- **Pallet Query:** `api.query.identity.identityOf(address)`
- **UI Card:** `IdentityCard` (Lookup display)

---

### 5. Pallet: `vesting` (Token Vesting)

Tracks locked schedules and unlocks tokens over time.

- **Commands:**
  - _"Show vesting schedule"_ / _"Check vested tokens"_
- **Pallet Query:** `api.query.vesting.vesting(address)`
- **UI Card:** `VestingWidget`
- **Details:** Reads locked amount, per-period unlocks, and starting block from the vesting schedule, then dynamically calculates elapsed block periods to display how many POT tokens have vested and are ready to claim.

---

### 6. System & RPC Queries

General utilities for network diagnostics and transaction preparation.

- **Fee Estimation:**
  - _Commands:_ _"How much is gas?"_ / _"Estimate fee to send 10 POT"_
  - _Implementation:_ Calls `tx.paymentInfo(address)` to get real dispatch info from the RPC node.
  - _UI Card:_ `FeeEstimateWidget`
- **Chain Info:**
  - _Commands:_ _"Chain info"_ / _"Network status"_ / _"Block height"_
  - _Implementation:_ Queries `rpc.system.chain()`, `rpc.chain.getHeader()`, and `rpc.system.version()` to pull live metadata.
  - _UI Card:_ `ChainInfoWidget`

---

## ⚡ Execution Modes (Demo Mode vs. Connected Mode)

To provide an optimal developer and testing experience, Potdo automatically toggles between two operating modes:

### 1. Connected Network Mode (Live)

Triggered when a browser wallet extension (such as Portaldot compatible wallet) is installed, active, and containing accounts:

- Connects dynamically to the live Portaldot mainnet RPC endpoint (`wss://mainnet.portaldot.io`).
- Queries all balances, staking status, identity registry, and vesting schedules directly from the chain.
- Requests transaction signing through the browser extension wallet.

### 2. Demo Mode (Mocked Fallback)

If no browser wallet is detected or if "Demo Mode" is explicitly selected:

- All balance, staking, and identity lookups fall back to realistic, deterministic mock states.
- Transaction execution displays a mock countdown and finalizes automatically with a simulated transaction hash.
- Allows developers and reviewers to test the entire application interface, NLP commands, and generative UI animations instantly without requiring real network connection, testnet tokens, or wallet setup.

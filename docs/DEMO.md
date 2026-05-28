# Potdo — Demo Walkthrough

> **For Judges**: No API keys needed! Demo mode works out of the box.
> Just `npm install && npm run dev` → visit `http://localhost:3000`.

---

## Quick Start

```bash
git clone https://github.com/edycutjong/potdo.git
cd potdo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Flow (3 scenarios)

### Scenario 1: Single Transfer

**Input**: Type `Send 10 POT to Alpha` in the chat input

**Expected**:

1. ✨ AI parses the intent (purple dot + "Parsing intent...")
2. 📋 A **TransferCard** slides into the chat showing:
   - **From**: Demo Wallet (`5Grw...utQY`)
   - **Balance**: 1000.0000 POT
   - **To**: Alice
   - **Amount**: 10.0000 POT
   - **After**: 990.0000 POT
3. 🔵 Click **"Execute Transfer"** → wallet signing popup
4. 🎉 **Confetti burst** + green TxConfirmation card with block number + explorer link

### Scenario 2: Batch Airdrop

**Input**: Type `Airdrop 5 POT to Alpha, Beta, and Gamma`

**Expected**:

1. ✨ AI parses 3 recipients
2. 📋 A **BatchCard** slides in showing a table:
   | Recipient | Amount |
   |---|---|
   | Alpha | 5.0000 POT |
   | Beta | 5.0000 POT |
   | Gamma | 5.0000 POT |
   | **Total** | **15.0000 POT** |
3. 🔵 Click **"Execute Batch"** → single `utility.batch` extrinsic
4. 🎉 Confetti + confirmation for all 3 transfers

### Scenario 3: Error Protection

**Input**: Type `Send 5000 POT to Delta`

**Expected**:

1. ✨ AI parses the intent
2. 🔴 A **TransferCard** appears with a **RED warning border**:
   - "Insufficient balance! You have 1000.0000 POT but need 5000.0000 POT"
3. ❌ The **Execute** button is **disabled** — preventing gas waste
4. No wallet popup appears (blocked by pre-flight check)

### Scenario 4: Balance Check

**Input**: Type `What's my balance?`

**Expected**:

1. 📋 A **BalanceWidget** card slides in showing:
   - **Free**: 1000.0000 POT
   - **Reserved**: 0 POT
   - **Chain**: Portaldot ⚡

---

## Additional Features to Explore

| Feature                | How to Trigger                                                         |
| ---------------------- | ---------------------------------------------------------------------- |
| **Command History**    | Look at the left sidebar — past commands are listed with status badges |
| **Click to Replay**    | Click any past command in the sidebar → it fills the chat input        |
| **Suggested Commands** | Click a suggestion chip above the input bar                            |
| **Landing Page**       | Visit `/` to see the animated landing page                             |
| **Dashboard**          | Visit `/dashboard` for the full chat interface                         |
| **404 Page**           | Visit `/nonexistent` for the custom cybernetic 404 page                |

---

## Technical Verification

```bash
npm run lint          # ESLint — 0 errors
npm run typecheck     # TypeScript — 0 errors
npm run test          # 24 suites, 282 tests
npm run test:coverage # 99.8% statement coverage / 100% line coverage
npm run ci            # Full pipeline (lint + typecheck + test:coverage)
npm run build         # Production build — static prerender
```

---

## Environment Variables (Optional)

For full functionality with live AI + blockchain + persistence:

```bash
cp .env.example .env.local
# Edit .env.local with your keys
```

| Variable                        | Required? | Purpose                                                      |
| ------------------------------- | --------- | ------------------------------------------------------------ |
| `OPENAI_API_KEY`                | Optional  | Live AI intent parsing (demo mode uses deterministic parser) |
| `NEXT_PUBLIC_SUPABASE_URL`      | Optional  | Transaction history persistence                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional  | Supabase auth                                                |
| `PORTALDOT_RPC`                 | Optional  | Custom RPC endpoint (default: `wss://mainnet.portaldot.io`)  |

> **Without any env vars**, the app runs in full demo mode with deterministic intent parsing and mock wallet integration.

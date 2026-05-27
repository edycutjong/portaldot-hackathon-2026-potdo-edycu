// Portaldot chain configuration and types

export const PORTALDOT_RPC =
  process.env.NEXT_PUBLIC_PORTALDOT_RPC || "wss://mainnet.portaldot.io";

export const TOKEN_SYMBOL = "POT";
export const TOKEN_DECIMALS = 14;
export const TOKEN_UNIT = BigInt(10) ** BigInt(TOKEN_DECIMALS); // 1 POT = 10^14 planck

export const CHAIN_NAME = "Portaldot";

// SS58 address prefix for Portaldot (Substrate default = 42)
export const SS58_PREFIX = 42;

// Named demo accounts (address book)
export const ADDRESS_BOOK: Record<string, string> = {
  Alice: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  Bob: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
  Charlie: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
  Dave: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYUM3aUNew",
};

// Suggested commands for the chat input — covers all 11 capabilities
export const SUGGESTED_COMMANDS = [
  "Send 10 POT to Alice",
  "Check my balance",
  "Airdrop 5 POT to Alice, Bob, and Charlie",
  "Stake 100 POT",
  "Show my staking info",
  "Set my name to Edy",
  "Show vesting schedule",
  "How much gas for Send 10 POT to Alice?",
  "Chain info",
];

// Slash commands shown when user types "/" in the chat input
export const SLASH_COMMANDS = [
  { command: "/send", description: "Transfer POT tokens", example: "Send 10 POT to Alice" },
  { command: "/balance", description: "Check your balance", example: "Check my balance" },
  { command: "/airdrop", description: "Batch send to multiple recipients", example: "Airdrop 5 POT to Alice, Bob, and Charlie" },
  { command: "/stake", description: "Stake POT tokens", example: "Stake 100 POT" },
  { command: "/unstake", description: "Unstake bonded POT", example: "Unstake 50 POT" },
  { command: "/staking", description: "View staking info", example: "Show my staking info" },
  { command: "/identity", description: "Set your on-chain name", example: "Set my name to Edy" },
  { command: "/whois", description: "Look up an account identity", example: "Who is Alice?" },
  { command: "/vesting", description: "View vesting schedule", example: "Show vesting schedule" },
  { command: "/fee", description: "Estimate gas fee", example: "How much gas for Send 10 POT to Alice?" },
  { command: "/chain", description: "View chain info & block height", example: "Chain info" },
  { command: "/sendall", description: "Send entire balance", example: "Send everything to Alice" },
];

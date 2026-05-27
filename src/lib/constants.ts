// Portaldot chain configuration and types

export const PORTALDOT_RPC =
  process.env.NEXT_PUBLIC_PORTALDOT_RPC || "wss://mainnet.portaldot.io";

export const TOKEN_SYMBOL = "POT";
export const TOKEN_DECIMALS = 14;
export const TOKEN_UNIT = BigInt(10) ** BigInt(TOKEN_DECIMALS); // 1 POT = 10^14 planck

export const CHAIN_NAME = "Portaldot";

// SS58 address prefix for Portaldot (Substrate default = 42)
export const SS58_PREFIX = 42;

// Named demo accounts (Greek alphabet) - Address -> Name mapping
export const DEMO_ADDRESS_BOOK: Record<string, string> = {
  "5DRcc5Jf3rvuLQHEbuvDZtXMfmS9WS3NETFP2h1W8r2j1KUm": "Alpha",
  "5FBjUb4p6yzvcWsCDHxoeeppJjJ7vZW675sPgrNFK3acMQ5o": "Beta",
  "5E1oSt5YAdzq6RdEHt1UyMFcLqQVQMq9TiF3TAfxDvsDjp3P": "Gamma",
  "5CfPKgVHzzi7thpNYf5kKRDQ676mVmsYtAQsTWaRqoaX4eQX": "Delta",
};

// Named testnet accounts (Substrate defaults) - Address -> Name mapping
export const TESTNET_ADDRESS_BOOK: Record<string, string> = {
  "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY": "Alice",
  "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty": "Bob",
  "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y": "Charlie",
  "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYUM3aUNew": "Dave",
};

// Default address book for compatibility
export const ADDRESS_BOOK = DEMO_ADDRESS_BOOK;

// Suggested commands for the chat input — covers all 11 capabilities
export const SUGGESTED_COMMANDS = [
  "Send 10 POT to Alpha",
  "Check my balance",
  "Airdrop 5 POT to Alpha, Beta, and Gamma",
  "Stake 100 POT",
  "Show my staking info",
  "Set my name to Edy",
  "Show vesting schedule",
  "How much gas for Send 10 POT to Alpha?",
  "Chain info",
];

// Slash commands shown when user types "/" in the chat input
export const SLASH_COMMANDS = [
  { command: "/send", description: "Transfer POT tokens", example: "Send 10 POT to Alpha" },
  { command: "/balance", description: "Check your balance", example: "Check my balance" },
  { command: "/airdrop", description: "Batch send to multiple recipients", example: "Airdrop 5 POT to Alpha, Beta, and Gamma" },
  { command: "/stake", description: "Stake POT tokens", example: "Stake 100 POT" },
  { command: "/unstake", description: "Unstake bonded POT", example: "Unstake 50 POT" },
  { command: "/staking", description: "View staking info", example: "Show my staking info" },
  { command: "/identity", description: "Set your on-chain name", example: "Set my name to Edy" },
  { command: "/whois", description: "Look up an account identity", example: "Who is Alpha?" },
  { command: "/vesting", description: "View vesting schedule", example: "Show vesting schedule" },
  { command: "/fee", description: "Estimate gas fee", example: "How much gas for Send 10 POT to Alpha?" },
  { command: "/chain", description: "View chain info & block height", example: "Chain info" },
  { command: "/sendall", description: "Send entire balance", example: "Send everything to Alpha" },
];

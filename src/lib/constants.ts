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

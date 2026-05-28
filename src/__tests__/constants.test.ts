import {
  TOKEN_DECIMALS,
  TOKEN_SYMBOL,
  TOKEN_UNIT,
  CHAIN_NAME,
  SS58_PREFIX,
  ADDRESS_BOOK,
  DEMO_ADDRESS_BOOK,
  TESTNET_ADDRESS_BOOK,
  SUGGESTED_COMMANDS,
  PORTALDOT_RPC,
} from "@/lib/constants";

describe("constants", () => {
  it("uses 14 decimals for POT", () => {
    expect(TOKEN_DECIMALS).toBe(14);
  });

  it("TOKEN_UNIT equals 10^14", () => {
    expect(TOKEN_UNIT).toBe(100000000000000n);
  });

  it("TOKEN_SYMBOL is POT", () => {
    expect(TOKEN_SYMBOL).toBe("POT");
  });

  it("CHAIN_NAME is Portaldot", () => {
    expect(CHAIN_NAME).toBe("Portaldot");
  });

  it("SS58_PREFIX is 42", () => {
    expect(SS58_PREFIX).toBe(42);
  });

  it("ADDRESS_BOOK has Alpha, Beta, Gamma, Delta", () => {
    expect(Object.values(ADDRESS_BOOK)).toEqual(["Alpha", "Beta", "Gamma", "Delta"]);
  });

  it("DEMO_ADDRESS_BOOK has Alpha, Beta, Gamma, Delta", () => {
    expect(Object.values(DEMO_ADDRESS_BOOK)).toEqual(["Alpha", "Beta", "Gamma", "Delta"]);
    expect(DEMO_ADDRESS_BOOK["5DRcc5Jf3rvuLQHEbuvDZtXMfmS9WS3NETFP2h1W8r2j1KUm"]).toBe("Alpha");
    expect(DEMO_ADDRESS_BOOK["5FBjUb4p6yzvcWsCDHxoeeppJjJ7vZW675sPgrNFK3acMQ5o"]).toBe("Beta");
    expect(DEMO_ADDRESS_BOOK["5E1oSt5YAdzq6RdEHt1UyMFcLqQVQMq9TiF3TAfxDvsDjp3P"]).toBe("Gamma");
    expect(DEMO_ADDRESS_BOOK["5CfPKgVHzzi7thpNYf5kKRDQ676mVmsYtAQsTWaRqoaX4eQX"]).toBe("Delta");
  });

  it("TESTNET_ADDRESS_BOOK has Alice, Bob, Charlie, Dave", () => {
    expect(Object.values(TESTNET_ADDRESS_BOOK)).toEqual(["Alice", "Bob", "Charlie", "Dave"]);
    expect(TESTNET_ADDRESS_BOOK["5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"]).toBe("Alice");
    expect(TESTNET_ADDRESS_BOOK["5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"]).toBe("Bob");
    expect(TESTNET_ADDRESS_BOOK["5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y"]).toBe(
      "Charlie"
    );
    expect(TESTNET_ADDRESS_BOOK["5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYUM3aUNew"]).toBe("Dave");
  });

  it("SUGGESTED_COMMANDS has 9 entries covering all capabilities", () => {
    expect(SUGGESTED_COMMANDS).toHaveLength(9);
    expect(SUGGESTED_COMMANDS[0]).toContain("Send");
    expect(SUGGESTED_COMMANDS[1]).toContain("balance");
    expect(SUGGESTED_COMMANDS[2]).toContain("Airdrop");
    expect(SUGGESTED_COMMANDS[3]).toContain("Stake");
    expect(SUGGESTED_COMMANDS[4]).toContain("staking");
    expect(SUGGESTED_COMMANDS[5]).toContain("name");
    expect(SUGGESTED_COMMANDS[6]).toContain("vesting");
    expect(SUGGESTED_COMMANDS[7]).toContain("gas");
    expect(SUGGESTED_COMMANDS[8]).toContain("Chain");
  });

  it("PORTALDOT_RPC uses mainnet.portaldot.io", () => {
    expect(PORTALDOT_RPC).toBe("wss://mainnet.portaldot.io");
  });
});

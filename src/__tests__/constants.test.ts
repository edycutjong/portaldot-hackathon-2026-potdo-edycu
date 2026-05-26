import {
  TOKEN_DECIMALS,
  TOKEN_SYMBOL,
  TOKEN_UNIT,
  CHAIN_NAME,
  SS58_PREFIX,
  ADDRESS_BOOK,
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

  it("ADDRESS_BOOK has Alice, Bob, Charlie, Dave", () => {
    expect(Object.keys(ADDRESS_BOOK)).toEqual(["Alice", "Bob", "Charlie", "Dave"]);
    expect(ADDRESS_BOOK.Alice).toBe("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
    expect(ADDRESS_BOOK.Bob).toBe("5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty");
    expect(ADDRESS_BOOK.Charlie).toBe("5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y");
    expect(ADDRESS_BOOK.Dave).toBe("5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYUM3aUNew");
  });

  it("SUGGESTED_COMMANDS has 3 entries", () => {
    expect(SUGGESTED_COMMANDS).toHaveLength(3);
    expect(SUGGESTED_COMMANDS[0]).toContain("Send");
    expect(SUGGESTED_COMMANDS[1]).toContain("balance");
    expect(SUGGESTED_COMMANDS[2]).toContain("Airdrop");
  });

  it("PORTALDOT_RPC uses mainnet.portaldot.io", () => {
    expect(PORTALDOT_RPC).toBe("wss://mainnet.portaldot.io");
  });
});

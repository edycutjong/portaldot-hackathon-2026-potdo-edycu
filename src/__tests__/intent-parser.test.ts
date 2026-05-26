import { parseIntent, validateIntent } from "@/lib/intent-parser";

describe("parseIntent", () => {
  // === Balance checks ===
  it("parses 'What's my balance?' as check_balance", () => {
    const result = parseIntent("What's my balance?");
    expect(result).toEqual({ action: "check_balance" });
  });

  it("parses 'how much POT do I have' as check_balance", () => {
    const result = parseIntent("how much POT do I have");
    expect(result).toEqual({ action: "check_balance" });
  });

  it("parses 'Check my balance' as check_balance", () => {
    const result = parseIntent("Check my balance");
    expect(result).toEqual({ action: "check_balance" });
  });

  // === Single transfers ===
  it("parses 'Send 10 POT to Alice'", () => {
    const result = parseIntent("Send 10 POT to Alice");
    expect(result).toEqual({
      action: "transfer",
      to: "Alice",
      toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      amount: 10,
    });
  });

  it("parses 'transfer 50 tokens to Bob'", () => {
    const result = parseIntent("transfer 50 tokens to Bob");
    expect(result).toEqual({
      action: "transfer",
      to: "Bob",
      toAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      amount: 50,
    });
  });

  it("parses 'pay 5.5 pot to charlie'", () => {
    const result = parseIntent("pay 5.5 pot to charlie");
    expect(result).toEqual({
      action: "transfer",
      to: "Charlie",
      toAddress: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
      amount: 5.5,
    });
  });

  it("strips trailing punctuation from recipient name", () => {
    const result = parseIntent("Send 10 POT to Alice.");
    expect(result?.action).toBe("transfer");
    if (result?.action === "transfer") {
      expect(result.to).toBe("Alice");
    }
  });

  // === Send everything ===
  it("parses 'Send everything to Alice'", () => {
    const result = parseIntent("Send everything to Alice");
    expect(result).toEqual({
      action: "transfer",
      to: "Alice",
      toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      amount: -1,
    });
  });

  it("parses 'transfer all to Bob'", () => {
    const result = parseIntent("transfer all to Bob");
    expect(result).toEqual({
      action: "transfer",
      to: "Bob",
      toAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      amount: -1,
    });
  });

  it("returns null for send everything with unknown recipient", () => {
    expect(parseIntent("Send everything to Zack")).toBeNull();
  });

  // === Batch transfers ===
  it("parses 'Airdrop 5 POT to Alice, Bob, and Charlie'", () => {
    const result = parseIntent("Airdrop 5 POT to Alice, Bob, and Charlie");
    expect(result?.action).toBe("batch_transfer");
    if (result?.action === "batch_transfer") {
      expect(result.transfers).toHaveLength(3);
      expect(result.transfers[0].to).toBe("Alice");
      expect(result.transfers[0].amount).toBe(5);
      expect(result.transfers[1].to).toBe("Bob");
      expect(result.transfers[2].to).toBe("Charlie");
    }
  });

  it("parses 'send 10 to Alice and Bob'", () => {
    const result = parseIntent("send 10 to Alice and Bob");
    expect(result?.action).toBe("batch_transfer");
    if (result?.action === "batch_transfer") {
      expect(result.transfers).toHaveLength(2);
    }
  });

  // === Failure cases ===
  it("returns null for gibberish", () => {
    expect(parseIntent("hello world")).toBeNull();
  });

  it("returns null for unknown recipient", () => {
    expect(parseIntent("Send 10 POT to Zack")).toBeNull();
  });

  it("returns null for invalid amount", () => {
    expect(parseIntent("Send xyz POT to Alice")).toBeNull();
  });

  it("returns null for batch transfer with unresolved recipient", () => {
    expect(parseIntent("Airdrop 5 POT to Alice and Zack")).toBeNull();
  });

  it("returns null for batch transfer with invalid amount string", () => {
    expect(parseIntent("Airdrop xyz to Alice and Bob")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseIntent("")).toBeNull();
  });

  it("returns null for whitespace-only", () => {
    expect(parseIntent("   ")).toBeNull();
  });
});

describe("validateIntent", () => {
  it("validates a correct transfer intent", () => {
    const result = validateIntent({
      action: "transfer",
      to: "Alice",
      toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      amount: 10,
    });
    expect(result.valid).toBe(true);
  });

  it("rejects transfer with invalid address", () => {
    const result = validateIntent({
      action: "transfer",
      to: "Alice",
      toAddress: "invalid",
      amount: 10,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid address");
  });

  it("rejects transfer with zero amount", () => {
    const result = validateIntent({
      action: "transfer",
      to: "Alice",
      toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      amount: 0,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("greater than 0");
  });

  it("accepts amount -1 (max transfer)", () => {
    const result = validateIntent({
      action: "transfer",
      to: "Alice",
      toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      amount: -1,
    });
    expect(result.valid).toBe(true);
  });

  it("validates a correct batch intent", () => {
    const result = validateIntent({
      action: "batch_transfer",
      transfers: [
        {
          to: "Alice",
          toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
          amount: 5,
        },
        {
          to: "Bob",
          toAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
          amount: 5,
        },
      ],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects batch with empty transfers", () => {
    const result = validateIntent({
      action: "batch_transfer",
      transfers: [],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("No recipients");
  });

  it("rejects batch with >10 transfers", () => {
    const transfers = Array.from({ length: 11 }, (_, i) => ({
      to: `User${i}`,
      toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      amount: 1,
    }));
    const result = validateIntent({ action: "batch_transfer", transfers });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Maximum 10");
  });

  it("rejects batch with invalid address", () => {
    const result = validateIntent({
      action: "batch_transfer",
      transfers: [{ to: "Alice", toAddress: "bad", amount: 5 }],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid address");
  });

  it("rejects batch with zero amount", () => {
    const result = validateIntent({
      action: "batch_transfer",
      transfers: [
        {
          to: "Alice",
          toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
          amount: 0,
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid amount");
  });

  it("validates check_balance", () => {
    const result = validateIntent({ action: "check_balance" });
    expect(result.valid).toBe(true);
  });

  it("rejects transfer with negative amount other than -1", () => {
    const result = validateIntent({
      action: "transfer",
      to: "Alice",
      toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      amount: -5,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("greater than 0");
  });

  it("rejects batch with negative amount", () => {
    const result = validateIntent({
      action: "batch_transfer",
      transfers: [
        {
          to: "Alice",
          toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
          amount: -2,
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid amount");
  });

  it("rejects unknown action", () => {
    const result = validateIntent({
      action: "unknown" as "check_balance",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unknown");
  });
});

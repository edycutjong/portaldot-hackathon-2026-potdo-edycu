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

  it("returns null for stake with invalid amount", () => {
    expect(parseIntent("stake abc POT")).toBeNull();
  });

  it("returns null for unstake with invalid amount", () => {
    expect(parseIntent("unstake abc POT")).toBeNull();
  });

  // === Staking ===
  it("parses 'Stake 100 POT'", () => {
    const result = parseIntent("Stake 100 POT");
    expect(result).toEqual({ action: "stake", amount: 100 });
  });

  it("parses 'stake 50 pot to ValidatorX'", () => {
    const result = parseIntent("stake 50 pot to ValidatorX");
    expect(result?.action).toBe("stake");
    if (result?.action === "stake") {
      expect(result.amount).toBe(50);
      expect(result.validator).toBe("ValidatorX");
    }
  });

  it("parses 'bond 200 POT'", () => {
    const result = parseIntent("bond 200 POT");
    expect(result?.action).toBe("stake");
    if (result?.action === "stake") {
      expect(result.amount).toBe(200);
    }
  });

  it("parses 'Unstake 50 POT'", () => {
    const result = parseIntent("Unstake 50 POT");
    expect(result).toEqual({ action: "unstake", amount: 50 });
  });

  it("parses 'unbond 30 tokens'", () => {
    const result = parseIntent("unbond 30 tokens");
    expect(result).toEqual({ action: "unstake", amount: 30 });
  });

  it("parses 'Show my staking info'", () => {
    const result = parseIntent("Show my staking info");
    expect(result).toEqual({ action: "check_staking" });
  });

  it("parses 'staking' as check_staking", () => {
    const result = parseIntent("staking");
    expect(result).toEqual({ action: "check_staking" });
  });

  it("parses 'check my staked'", () => {
    const result = parseIntent("check my staked");
    expect(result).toEqual({ action: "check_staking" });
  });

  it("parses 'view nominations'", () => {
    const result = parseIntent("view nominations");
    expect(result).toEqual({ action: "check_staking" });
  });

  // === Identity ===
  it("parses 'Set my name to Edy'", () => {
    const result = parseIntent("Set my name to Edy");
    expect(result).toEqual({ action: "set_identity", displayName: "Edy" });
  });

  it("parses 'set identity to Potdo User'", () => {
    const result = parseIntent("set identity to Potdo User");
    expect(result).toEqual({ action: "set_identity", displayName: "Potdo User" });
  });

  it("parses 'set display name as TestName'", () => {
    const result = parseIntent("set display name as TestName");
    expect(result).toEqual({ action: "set_identity", displayName: "TestName" });
  });

  it("returns null for set identity with empty or pure punctuation displayName", () => {
    const result = parseIntent("Set my name to !?!");
    expect(result).toBeNull();
  });

  it("parses 'Who is Alice?'", () => {
    const result = parseIntent("Who is Alice?");
    expect(result?.action).toBe("check_identity");
    if (result?.action === "check_identity") {
      expect(result.name).toBe("Alice");
      expect(result.address).toBe("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
    }
  });

  it("parses 'identity of Bob'", () => {
    const result = parseIntent("identity of Bob");
    expect(result?.action).toBe("check_identity");
    if (result?.action === "check_identity") {
      expect(result.name).toBe("Bob");
    }
  });

  it("parses 'my identity' as check_identity (self)", () => {
    const result = parseIntent("my identity");
    expect(result).toEqual({ action: "check_identity" });
  });

  it("parses 'lookup Dave'", () => {
    const result = parseIntent("lookup Dave");
    expect(result?.action).toBe("check_identity");
    if (result?.action === "check_identity") {
      expect(result.name).toBe("Dave");
    }
  });

  it("parses identity checks for unresolved recipient correctly", () => {
    const result = parseIntent("Who is Zack?");
    expect(result).toEqual({
      action: "check_identity",
      address: undefined,
      name: "Zack",
    });
  });

  // === Vesting ===
  it("parses 'Show vesting schedule'", () => {
    const result = parseIntent("Show vesting schedule");
    expect(result).toEqual({ action: "check_vesting" });
  });

  it("parses 'vesting' as check_vesting", () => {
    const result = parseIntent("vesting");
    expect(result).toEqual({ action: "check_vesting" });
  });

  it("parses 'vested tokens'", () => {
    const result = parseIntent("vested tokens");
    expect(result).toEqual({ action: "check_vesting" });
  });

  // === Fee Estimation ===
  it("parses 'How much gas for Send 10 POT to Alice?'", () => {
    const result = parseIntent("How much gas for Send 10 POT to Alice?");
    expect(result?.action).toBe("estimate_fee");
    if (result?.action === "estimate_fee") {
      expect(result.command).toContain("Send 10 POT to Alice");
    }
  });

  it("parses 'estimate fee' (without subcommand) using command fallback", () => {
    const result = parseIntent("estimate fee");
    expect(result).toEqual({ action: "estimate_fee", command: "estimate fee" });
  });

  it("parses 'estimate fee for transfer 50 to Bob'", () => {
    const result = parseIntent("estimate fee for transfer 50 to Bob");
    expect(result?.action).toBe("estimate_fee");
  });

  it("parses 'gas for staking 100 POT'", () => {
    const result = parseIntent("gas for staking 100 POT");
    expect(result?.action).toBe("estimate_fee");
  });

  it("parses 'how much cost to send 10 POT'", () => {
    const result = parseIntent("how much cost to send 10 POT");
    expect(result?.action).toBe("estimate_fee");
  });

  // === Chain Info ===
  it("parses 'Chain info'", () => {
    const result = parseIntent("Chain info");
    expect(result).toEqual({ action: "check_chain_info" });
  });

  it("parses 'network status'", () => {
    const result = parseIntent("network status");
    expect(result).toEqual({ action: "check_chain_info" });
  });

  it("parses 'block height'", () => {
    const result = parseIntent("block height");
    expect(result).toEqual({ action: "check_chain_info" });
  });

  it("parses 'chain status'", () => {
    const result = parseIntent("chain status");
    expect(result).toEqual({ action: "check_chain_info" });
  });

  // === Slash Commands ===
  it("parses '/send 10 POT to Alice'", () => {
    const result = parseIntent("/send 10 POT to Alice");
    expect(result).toEqual({
      action: "transfer",
      to: "Alice",
      toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      amount: 10,
    });
  });

  it("parses '/balance'", () => {
    const result = parseIntent("/balance");
    expect(result).toEqual({ action: "check_balance" });
  });

  it("parses '/airdrop 5 POT to Alice, Bob, and Charlie'", () => {
    const result = parseIntent("/airdrop 5 POT to Alice, Bob, and Charlie");
    expect(result?.action).toBe("batch_transfer");
    if (result?.action === "batch_transfer") {
      expect(result.transfers).toHaveLength(3);
    }
  });

  it("parses '/stake 100 POT'", () => {
    const result = parseIntent("/stake 100 POT");
    expect(result).toEqual({ action: "stake", amount: 100 });
  });

  it("parses '/unstake 50 POT'", () => {
    const result = parseIntent("/unstake 50 POT");
    expect(result).toEqual({ action: "unstake", amount: 50 });
  });

  it("parses '/staking'", () => {
    const result = parseIntent("/staking");
    expect(result).toEqual({ action: "check_staking" });
  });

  it("parses '/identity Edy'", () => {
    const result = parseIntent("/identity Edy");
    expect(result).toEqual({ action: "set_identity", displayName: "Edy" });
  });

  it("parses '/identity' without args as check_identity (self)", () => {
    const result = parseIntent("/identity");
    expect(result).toEqual({ action: "check_identity" });
  });

  it("parses '/whois Alice'", () => {
    const result = parseIntent("/whois Alice");
    expect(result?.action).toBe("check_identity");
    if (result?.action === "check_identity") {
      expect(result.name).toBe("Alice");
    }
  });

  it("parses '/vesting'", () => {
    const result = parseIntent("/vesting");
    expect(result).toEqual({ action: "check_vesting" });
  });

  it("parses '/fee Send 10 POT to Alice'", () => {
    const result = parseIntent("/fee Send 10 POT to Alice");
    expect(result?.action).toBe("estimate_fee");
  });

  it("parses '/chain'", () => {
    const result = parseIntent("/chain");
    expect(result).toEqual({ action: "check_chain_info" });
  });

  it("parses '/sendall Alice'", () => {
    const result = parseIntent("/sendall Alice");
    expect(result).toEqual({
      action: "transfer",
      to: "Alice",
      toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      amount: -1,
    });
  });

  it("returns null for empty slash command arguments when arguments are required", () => {
    expect(parseIntent("/send")).toBeNull();
    expect(parseIntent("/airdrop")).toBeNull();
    expect(parseIntent("/stake")).toBeNull();
    expect(parseIntent("/unstake")).toBeNull();
    expect(parseIntent("/whois")).toBeNull();
    expect(parseIntent("/sendall")).toBeNull();
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

  // === New intent validations ===
  it("validates stake with positive amount", () => {
    const result = validateIntent({ action: "stake", amount: 100 });
    expect(result.valid).toBe(true);
  });

  it("rejects stake with zero amount", () => {
    const result = validateIntent({ action: "stake", amount: 0 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("greater than 0");
  });

  it("rejects stake with negative amount", () => {
    const result = validateIntent({ action: "stake", amount: -5 });
    expect(result.valid).toBe(false);
  });

  it("validates unstake with positive amount", () => {
    const result = validateIntent({ action: "unstake", amount: 50 });
    expect(result.valid).toBe(true);
  });

  it("rejects unstake with zero amount", () => {
    const result = validateIntent({ action: "unstake", amount: 0 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("greater than 0");
  });

  it("validates set_identity with valid name", () => {
    const result = validateIntent({ action: "set_identity", displayName: "Edy" });
    expect(result.valid).toBe(true);
  });

  it("rejects set_identity with empty name", () => {
    const result = validateIntent({ action: "set_identity", displayName: "" });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("empty");
  });

  it("rejects set_identity with name > 32 chars", () => {
    const result = validateIntent({ action: "set_identity", displayName: "A".repeat(33) });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("32 characters");
  });

  it("validates check_staking", () => {
    expect(validateIntent({ action: "check_staking" }).valid).toBe(true);
  });

  it("validates check_identity", () => {
    expect(validateIntent({ action: "check_identity" }).valid).toBe(true);
  });

  it("validates check_vesting", () => {
    expect(validateIntent({ action: "check_vesting" }).valid).toBe(true);
  });

  it("validates estimate_fee", () => {
    expect(validateIntent({ action: "estimate_fee", command: "test" }).valid).toBe(true);
  });

  it("validates check_chain_info", () => {
    expect(validateIntent({ action: "check_chain_info" }).valid).toBe(true);
  });
});

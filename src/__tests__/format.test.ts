import {
  planckToPot,
  potToPlanck,
  formatPot,
  isValidSS58Address,
  truncateAddress,
  resolveRecipient,
  parseAmount,
} from "@/lib/format";

describe("planckToPot", () => {
  it("converts 0 planck to 0.0000", () => {
    expect(planckToPot(0n)).toBe("0.0000");
  });

  it("converts 1 POT (10^14 planck) to 1.0000", () => {
    expect(planckToPot(100000000000000n)).toBe("1.0000");
  });

  it("converts 10 POT to 10.0000", () => {
    expect(planckToPot(1000000000000000n)).toBe("10.0000");
  });

  it("converts fractional amounts correctly", () => {
    // 1.5 POT = 1.5 * 10^14 = 150000000000000
    expect(planckToPot(150000000000000n)).toBe("1.5000");
  });

  it("handles large amounts", () => {
    // 500 POT
    expect(planckToPot(50000000000000000n)).toBe("500.0000");
  });

  it("truncates to 4 decimal places", () => {
    // 1.123456... POT
    expect(planckToPot(112345600000000n)).toBe("1.1234");
  });
});

describe("potToPlanck", () => {
  it("converts 1 POT to 10^14 planck", () => {
    expect(potToPlanck(1)).toBe(100000000000000n);
  });

  it("converts 10 POT correctly", () => {
    expect(potToPlanck(10)).toBe(1000000000000000n);
  });

  it("converts fractional amounts", () => {
    expect(potToPlanck(0.5)).toBe(50000000000000n);
  });

  it("converts 500 POT correctly", () => {
    expect(potToPlanck(500)).toBe(50000000000000000n);
  });

  it("handles toFixed returning a string without dot (fallback branch)", () => {
    const originalToFixed = Number.prototype.toFixed;
    try {
      Number.prototype.toFixed = jest.fn().mockReturnValue("100");
      expect(potToPlanck(100)).toBe(10000000000000000n);
    } finally {
      Number.prototype.toFixed = originalToFixed;
    }
  });
});

describe("formatPot", () => {
  it("formats with POT suffix", () => {
    expect(formatPot(100000000000000n)).toBe("1.0000 POT");
  });

  it("formats zero balance", () => {
    expect(formatPot(0n)).toBe("0.0000 POT");
  });
});

describe("isValidSS58Address", () => {
  it("validates correct Alpha address", () => {
    expect(isValidSS58Address("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")).toBe(true);
  });

  it("validates correct Beta address", () => {
    expect(isValidSS58Address("5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isValidSS58Address("")).toBe(false);
  });

  it("rejects too short string", () => {
    expect(isValidSS58Address("5Grw")).toBe(false);
  });

  it("rejects null/undefined", () => {
    expect(isValidSS58Address(null as unknown as string)).toBe(false);
    expect(isValidSS58Address(undefined as unknown as string)).toBe(false);
  });

  it("rejects non-string", () => {
    expect(isValidSS58Address(123 as unknown as string)).toBe(false);
  });

  it("rejects addresses with invalid characters", () => {
    // 0, O, I, l are not in base58
    expect(isValidSS58Address("0GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")).toBe(false);
  });
});

describe("truncateAddress", () => {
  it("truncates long addresses", () => {
    expect(truncateAddress("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")).toBe(
      "5Grwva...GKutQY"
    );
  });

  it("returns full address if short", () => {
    expect(truncateAddress("5Grw1234", 4)).toBe("5Grw1234");
  });

  it("handles empty string", () => {
    expect(truncateAddress("")).toBe("");
  });

  it("uses custom char count", () => {
    expect(truncateAddress("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", 4)).toBe(
      "5Grw...utQY"
    );
  });
});

describe("resolveRecipient", () => {
  const addressBook = {
    "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY": "Alpha",
    "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty": "Beta",
  };

  it("resolves name to address (case-insensitive)", () => {
    const result = resolveRecipient("alpha", addressBook);
    expect(result).toEqual({
      name: "Alpha",
      address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    });
  });

  it("resolves uppercase name", () => {
    const result = resolveRecipient("ALPHA", addressBook);
    expect(result?.name).toBe("Alpha");
  });

  it("resolves a raw SS58 address", () => {
    const addr = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
    const result = resolveRecipient(addr, addressBook);
    expect(result).toEqual({ name: "Alpha", address: addr });
  });

  it("resolves unknown SS58 address with truncated name", () => {
    const addr = "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y";
    const result = resolveRecipient(addr, addressBook);
    expect(result?.name).toBe("5FLSig...XcS59Y");
    expect(result?.address).toBe(addr);
  });

  it("returns null for unknown name", () => {
    expect(resolveRecipient("UnknownPerson", addressBook)).toBeNull();
  });
});

describe("parseAmount", () => {
  it("parses integer strings", () => {
    expect(parseAmount("10")).toBe(10);
  });

  it("parses decimal strings", () => {
    expect(parseAmount("5.5")).toBe(5.5);
  });

  it("parses word numbers", () => {
    expect(parseAmount("fifty")).toBe(50);
    expect(parseAmount("ten")).toBe(10);
    expect(parseAmount("one")).toBe(1);
    expect(parseAmount("hundred")).toBe(100);
  });

  it("returns null for invalid input", () => {
    expect(parseAmount("xyz")).toBeNull();
    expect(parseAmount("")).toBeNull();
  });

  it("returns null for zero", () => {
    expect(parseAmount("0")).toBeNull();
  });

  it("returns null for negative", () => {
    expect(parseAmount("-5")).toBeNull();
  });
});

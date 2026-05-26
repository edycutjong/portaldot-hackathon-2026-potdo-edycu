/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test supabase.ts in demo mode (no env vars = graceful no-ops).
 */

// Mock the supabase client module
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({})),
}));

import { logTransaction, fetchHistory } from "@/lib/supabase";

describe("supabase (demo mode — no config)", () => {
  it("logTransaction returns null when supabase is not configured", async () => {
    const result = await logTransaction({
      sender: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      command: "Send 10 POT to Alice",
      intent: { action: "transfer" },
      status: "pending",
    });
    expect(result).toBeNull();
  });

  it("fetchHistory returns empty array when supabase is not configured", async () => {
    const result = await fetchHistory();
    expect(result).toEqual([]);
  });

  it("fetchHistory with sender returns empty array", async () => {
    const result = await fetchHistory("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
    expect(result).toEqual([]);
  });
});

describe("supabase initialization branches", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    jest.resetModules();
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it("initializes client when both are present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    const { supabase } = require("@/lib/supabase");
    expect(supabase).not.toBeNull();
  });

  it("initializes to null when URL is present but key is missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { supabase, logTransaction, fetchHistory } = require("@/lib/supabase");
    expect(supabase).toBeNull();
    expect(await logTransaction({ sender: "t", command: "c", intent: {}, status: "p" })).toBeNull();
    expect(await fetchHistory()).toEqual([]);
  });

  it("initializes to null when URL is missing but key is present", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    const { supabase, logTransaction, fetchHistory } = require("@/lib/supabase");
    expect(supabase).toBeNull();
    expect(await logTransaction({ sender: "t", command: "c", intent: {}, status: "p" })).toBeNull();
    expect(await fetchHistory()).toEqual([]);
  });

  it("initializes to null when both env vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { supabase, logTransaction, fetchHistory } = require("@/lib/supabase");
    expect(supabase).toBeNull();
    expect(await logTransaction({ sender: "t", command: "c", intent: {}, status: "p" })).toBeNull();
    expect(await fetchHistory()).toEqual([]);
  });
});


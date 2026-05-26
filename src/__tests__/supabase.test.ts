/**
 * Test supabase.ts in demo mode (no env vars = graceful no-ops).
 */

// Mock the supabase client module
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => null),
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

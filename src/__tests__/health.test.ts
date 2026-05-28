/**
 * Tests for GET /api/health
 *
 * Uses a mock for NextResponse since the route handler
 * runs in the Next.js server runtime which isn't available in Jest.
 */

// Mock NextResponse before importing the route
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => {
      const headers = new Map(Object.entries(init?.headers || {}));
      return {
        status: init?.status || 200,
        json: async () => body,
        headers: {
          get: (key: string) => headers.get(key) || null,
        },
      };
    },
  },
}));

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("should return 200 with status ok", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
  });

  it("should include version string", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.version).toBeDefined();
    expect(typeof body.version).toBe("string");
  });

  it("should include uptime with ms and human-readable format", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.uptime).toBeDefined();
    expect(body.uptime.ms).toBeGreaterThanOrEqual(0);
    expect(typeof body.uptime.human).toBe("string");
  });

  it("should include timestamp in ISO format", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.timestamp).toBeDefined();
    const date = new Date(body.timestamp);
    expect(date.toISOString()).toBe(body.timestamp);
  });

  it("should include environment", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.environment).toBeDefined();
    expect(typeof body.environment).toBe("string");
  });

  it("should set no-cache headers", async () => {
    const response = await GET();

    expect(response.headers.get("Cache-Control")).toBe("no-cache, no-store, must-revalidate");
  });
});

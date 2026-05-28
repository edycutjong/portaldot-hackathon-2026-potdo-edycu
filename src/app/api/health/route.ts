import { NextResponse } from "next/server";

const startTime = Date.now();

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring and deployment verification.
 * Returns system status, version, uptime, and environment info.
 *
 * Usage:
 *   - Uptime monitors (UptimeRobot, Better Stack)
 *   - Kubernetes liveness/readiness probes
 *   - Post-deploy smoke test verification
 *   - Load balancer health checks
 */
export async function GET() {
  const uptimeMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: "ok",
      version: process.env.npm_package_version || "0.1.0",
      uptime: {
        ms: uptimeMs,
        human: formatUptime(uptimeMs),
      },
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

#!/usr/bin/env python3
"""
Potdo — Intent Parsing Latency Benchmark
=========================================
Measures p50/p95/mean/min/max for the /api/chat endpoint.

Usage:
  python3 scripts/bench.py              # 50 iterations (default)
  python3 scripts/bench.py --n 100      # 100 iterations

Requires:
  - pip install requests
  - Potdo dev server running: npm run dev
"""

import time
import statistics
import argparse
import sys

try:
    import requests
except ImportError:
    print("❌ Missing dependency: pip install requests")
    sys.exit(1)

ENDPOINT = "http://localhost:3000/api/chat"
COMMANDS = [
    "Send 10 POT to Alice",
    "Airdrop 5 POT to Alice, Bob, and Charlie",
    "What's my balance?",
    "Transfer fifty tokens to Bob",
    "Send 25 POT to Charlie",
]


def bench(n: int = 50) -> None:
    """Run n iterations of intent parsing and report latency stats."""
    print(f"\n⚡ Potdo Intent Parsing Benchmark")
    print(f"   Endpoint: {ENDPOINT}")
    print(f"   Iterations: {n}")
    print(f"   Commands: {len(COMMANDS)} unique\n")

    # Warm-up request
    try:
        r = requests.post(ENDPOINT, json={"message": "ping"}, timeout=5)
        if r.status_code >= 500:
            print(f"❌ Server error ({r.status_code}). Is `npm run dev` running?")
            sys.exit(1)
    except requests.ConnectionError:
        print("❌ Cannot connect to localhost:3000. Start the server with `npm run dev`.")
        sys.exit(1)

    latencies: list[float] = []
    errors = 0

    for i in range(n):
        cmd = COMMANDS[i % len(COMMANDS)]
        start = time.perf_counter()
        try:
            r = requests.post(ENDPOINT, json={"message": cmd}, timeout=10)
            elapsed = (time.perf_counter() - start) * 1000
            if r.status_code < 400:
                latencies.append(elapsed)
            else:
                errors += 1
        except Exception:
            errors += 1

        # Progress indicator
        pct = int((i + 1) / n * 100)
        bar = "█" * (pct // 5) + "░" * (20 - pct // 5)
        print(f"\r   [{bar}] {pct}% ({i+1}/{n})", end="", flush=True)

    print("\n")

    if not latencies:
        print("❌ No successful requests. Check the server.")
        sys.exit(1)

    latencies.sort()
    p50_idx = len(latencies) // 2
    p95_idx = int(len(latencies) * 0.95)

    print("─────────────────────────────────")
    print(f"  Results ({len(latencies)} successful, {errors} errors)")
    print("─────────────────────────────────")
    print(f"  p50:   {latencies[p50_idx]:>8.1f} ms")
    print(f"  p95:   {latencies[p95_idx]:>8.1f} ms")
    print(f"  mean:  {statistics.mean(latencies):>8.1f} ms")
    print(f"  min:   {min(latencies):>8.1f} ms")
    print(f"  max:   {max(latencies):>8.1f} ms")
    print(f"  stdev: {statistics.stdev(latencies):>8.1f} ms" if len(latencies) > 1 else "")
    print("─────────────────────────────────\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Potdo intent parsing benchmark")
    parser.add_argument("--n", type=int, default=50, help="Number of iterations (default: 50)")
    args = parser.parse_args()
    bench(args.n)

#!/usr/bin/env python3
"""
Potdo — Demo Environment Verifier
==================================
Checks that all required files, dependencies, and configurations exist.

Usage: python3 scripts/verify_demo.py
"""

import sys
import os
import json
import subprocess

PASS = 0
FAIL = 0


def check(name: str, ok: bool) -> None:
    global PASS, FAIL
    status = "✅" if ok else "❌"
    if ok:
        PASS += 1
    else:
        FAIL += 1
    print(f"  {status} {name}")


def main() -> None:
    print()
    print("🔍 Potdo Demo Environment Verifier")
    print("───────────────────────────────────")

    # ── 1. Critical files ────────────────────────────────
    print("\n📁 Required Files:")
    critical_files = [
        ("README.md", "README.md"),
        ("DEMO.md", "DEMO.md"),
        ("LICENSE", "LICENSE"),
        ("package.json", "package.json"),
        (".env.example", ".env.example"),
        ("db/schema.sql", "db/schema.sql"),
        ("public/icon.svg", "public/icon.svg"),
        ("public/og-image.png", "public/og-image.png"),
        ("src/app/page.tsx", "src/app/page.tsx (Landing)"),
        ("src/app/dashboard/page.tsx", "src/app/dashboard/page.tsx"),
    ]
    for filepath, label in critical_files:
        check(label, os.path.isfile(filepath))

    # ── 2. Source components ─────────────────────────────
    print("\n🧩 UI Components:")
    components = [
        "ChatInterface", "TransferCard", "BatchCard", "BalanceWidget",
        "TxConfirmation", "TxError", "Header", "CommandHistory",
        "MessageBubble", "TerminalDemo",
    ]
    for comp in components:
        check(comp, os.path.isfile(f"src/components/{comp}.tsx"))

    # ── 3. Node modules ──────────────────────────────────
    print("\n📦 Dependencies:")
    check("node_modules exists", os.path.isdir("node_modules"))

    # ── 4. TypeScript compiles ───────────────────────────
    print("\n🔧 Build Checks:")
    try:
        result = subprocess.run(
            ["npx", "tsc", "--noEmit"],
            capture_output=True, timeout=30
        )
        check("TypeScript compiles", result.returncode == 0)
    except Exception:
        check("TypeScript compiles", False)

    # ── 5. Tests pass ────────────────────────────────────
    try:
        result = subprocess.run(
            ["npx", "jest", "--passWithNoTests", "--silent"],
            capture_output=True, timeout=60
        )
        check("Tests pass", result.returncode == 0)
    except Exception:
        check("Tests pass", False)

    # ── 6. Named accounts in constants ───────────────────
    print("\n👥 Seed Data:")
    try:
        with open("src/lib/constants.ts") as f:
            content = f.read()
        for name in ["Alice", "Bob", "Charlie", "Dave"]:
            check(f"Named account: {name}", name in content)
    except FileNotFoundError:
        check("constants.ts exists", False)

    # ── 7. .env.local (optional — demo mode works without) ─
    print("\n🔐 Environment (optional):")
    if os.path.isfile(".env.local"):
        with open(".env.local") as f:
            env = f.read()
        check("OPENAI_API_KEY configured", "OPENAI_API_KEY" in env and "sk-" in env)
        check("SUPABASE_URL configured", "SUPABASE_URL" in env and "supabase" in env)
    else:
        print("  ℹ️  .env.local not found — demo mode will be used (OK for judges)")

    # ── Results ──────────────────────────────────────────
    print()
    print("───────────────────────────────────")
    print(f"  Results: {PASS} passed, {FAIL} failed")

    if FAIL > 0:
        print("  ⚠️  Some checks failed. Fix before demo.")
        sys.exit(1)
    else:
        print("  🎉 All checks passed! Demo environment ready.")
        sys.exit(0)


if __name__ == "__main__":
    main()

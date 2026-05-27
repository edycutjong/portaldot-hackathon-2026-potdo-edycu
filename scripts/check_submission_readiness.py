#!/usr/bin/env python3
"""
Potdo — Submission Readiness Checker
======================================
Fails if any placeholder fields remain in submission-critical files.
Run before submitting to DoraHacks.

Usage: python3 scripts/check_submission_readiness.py
"""

import sys
import os
import re
import json

PASS = 0
FAIL = 0
WARN = 0


def check(name: str, ok: bool) -> None:
    global PASS, FAIL
    if ok:
        PASS += 1
        print(f"  ✅ {name}")
    else:
        FAIL += 1
        print(f"  ❌ {name}")


def warn(name: str) -> None:
    global WARN
    WARN += 1
    print(f"  ⚠️  {name}")


# Patterns that indicate unfilled placeholders
PLACEHOLDER_PATTERNS = [
    r"your-.*-here",
    r"TODO",
    r"FIXME",
    r"PLACEHOLDER",
    r"TBD(?!\s*based)",  # Allow "TBD based on..." in context
    r"xxx",
    r"example\.com",
    r"your-project",
]


def scan_for_placeholders(filepath: str) -> list[str]:
    """Scan a file for placeholder patterns."""
    found = []
    try:
        with open(filepath) as f:
            for i, line in enumerate(f, 1):
                for pattern in PLACEHOLDER_PATTERNS:
                    if re.search(pattern, line, re.IGNORECASE):
                        found.append(f"  L{i}: {line.strip()[:80]}")
    except FileNotFoundError:
        pass
    return found


def main() -> None:
    print()
    print("📋 Potdo Submission Readiness Check")
    print("────────────────────────────────────")

    # ── 1. Critical files exist ──────────────────────────
    print("\n📁 Required Submission Files:")
    required = [
        "README.md",
        "DEMO.md",
        "LICENSE",
        "db/schema.sql",
        "public/icon.svg",
        "public/og-image.png",
        ".env.example",
    ]
    for filepath in required:
        check(f"  {filepath}", os.path.isfile(filepath))

    # ── 2. README has key sections ───────────────────────
    print("\n📝 README Sections:")
    if os.path.isfile("README.md"):
        with open("README.md") as fh:
            readme = fh.read()

        sections = [
            ("Problem & Solution", "Problem"),
            ("Architecture & Tech Stack", "Architecture"),
            ("How It Works", "How It Works"),
            ("Quick Start", "Quick Start"),
            ("Portaldot Integration", "Portaldot Integration"),
            ("Honest Limitations", "Honest Limitations"),
            ("License", "License"),
        ]
        for label, keyword in sections:
            check(label, keyword in readme)

        # Check badges
        check("Live Demo badge", "Live" in readme and "badge" in readme.lower())
        check("DoraHacks badge", "DoraHacks" in readme)
    else:
        check("README.md exists", False)

    # ── 3. Scan for placeholders ─────────────────────────
    print("\n🔍 Placeholder Scan:")
    files_to_scan = ["README.md", "DEMO.md", ".env.example", "package.json"]
    clean = True
    for filepath in files_to_scan:
        hits = scan_for_placeholders(filepath)
        if hits:
            # .env.example is expected to have placeholders
            if filepath == ".env.example":
                continue
            warn(f"{filepath} has {len(hits)} placeholder(s):")
            for h in hits[:3]:
                print(f"    {h}")
            clean = False

    if clean:
        check("No placeholders in submission files", True)

    # ── 4. Package.json fields ───────────────────────────
    print("\n📦 package.json:")
    if os.path.isfile("package.json"):
        with open("package.json") as fh:
            pkg = json.load(fh)
        check(f"name: {pkg.get('name', 'MISSING')}", bool(pkg.get("name")))
        check(f"version: {pkg.get('version', 'MISSING')}", bool(pkg.get("version")))
        check("scripts.dev exists", "dev" in pkg.get("scripts", {}))
        check("scripts.build exists", "build" in pkg.get("scripts", {}))
        check("scripts.ci exists", "ci" in pkg.get("scripts", {}))
    else:
        check("package.json exists", False)

    # ── 5. Git status ────────────────────────────────────
    print("\n🔀 Git:")
    import subprocess
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True, text=True, timeout=5
        )
        uncommitted = len(result.stdout.strip().splitlines()) if result.stdout.strip() else 0
        check(f"Clean working tree ({uncommitted} uncommitted)", uncommitted == 0)

        result = subprocess.run(
            ["git", "remote", "-v"],
            capture_output=True, text=True, timeout=5
        )
        check("Remote origin configured", "origin" in result.stdout)
    except Exception:
        warn("Git not available")

    # ── Results ──────────────────────────────────────────
    print()
    print("────────────────────────────────────")
    print(f"  Results: {PASS} passed, {FAIL} failed, {WARN} warnings")

    if FAIL > 0:
        print("  🚫 NOT READY — fix the failures above before submitting.")
        sys.exit(1)
    elif WARN > 0:
        print("  ⚠️  Ready with warnings — review before submitting.")
        sys.exit(0)
    else:
        print("  🎉 Submission ready! Ship it.")
        sys.exit(0)


if __name__ == "__main__":
    main()

#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# Potdo — Demo Environment Verifier
# Checks that the demo environment is ready for judges.
# Usage: ./scripts/verify_demo.sh
# ─────────────────────────────────────────────────────────

set -euo pipefail

PASS=0
FAIL=0

check() {
  local name="$1"
  local result="$2"
  if [ "$result" = "true" ]; then
    echo "  ✅ $name"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $name"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "🔍 Potdo Demo Environment Check"
echo "─────────────────────────────────"

# 1. Node.js version
NODE_VER=$(node -v 2>/dev/null || echo "none")
check "Node.js installed ($NODE_VER)" "$([ "$NODE_VER" != "none" ] && echo true || echo false)"

# 2. npm install
check "node_modules exists" "$([ -d node_modules ] && echo true || echo false)"

# 3. Build artifacts
check "Next.js builds successfully" "$(npm run build --silent 2>/dev/null && echo true || echo false)"

# 4. Tests pass
check "All tests pass" "$(npm test --silent 2>/dev/null && echo true || echo false)"

# 5. Key files exist
check "README.md exists" "$([ -f README.md ] && echo true || echo false)"
check "DEMO.md exists" "$([ -f DEMO.md ] && echo true || echo false)"
check "LICENSE exists" "$([ -f LICENSE ] && echo true || echo false)"
check "db/schema.sql exists" "$([ -f db/schema.sql ] && echo true || echo false)"
check ".env.example exists" "$([ -f .env.example ] && echo true || echo false)"
check "public/icon.svg exists" "$([ -f public/icon.svg ] && echo true || echo false)"
check "public/og-image.png exists" "$([ -f public/og-image.png ] && echo true || echo false)"

# 6. Landing page route
check "Landing page (src/app/page.tsx)" "$([ -f src/app/page.tsx ] && echo true || echo false)"
check "Dashboard page (src/app/dashboard/page.tsx)" "$([ -f src/app/dashboard/page.tsx ] && echo true || echo false)"

echo ""
echo "─────────────────────────────────"
echo "Results: $PASS passed, $FAIL failed"

if [ "$FAIL" -gt 0 ]; then
  echo "⚠️  Some checks failed. Fix before demo."
  exit 1
else
  echo "🎉 All checks passed! Demo environment ready."
  exit 0
fi

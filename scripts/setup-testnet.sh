#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Potdo — Portaldot Local Dev Node Setup
# ─────────────────────────────────────────────────────────────
# Detects OS and copies the correct Portaldot dev node binary.
#
# Usage:
#   ./scripts/setup-testnet.sh                  # auto-detect
#   ./scripts/setup-testnet.sh /path/to/binary  # specify custom path
#   ./scripts/setup-testnet.sh --docker         # setup Linux binary for Docker
# ─────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TESTNET_DIR="$PROJECT_ROOT/testnet"

# Detect target platform
DOCKER_MODE=false
if [ "${1:-}" = "--docker" ]; then
    DOCKER_MODE=true
    shift
fi

OS="$(uname -s)"
ARCH="$(uname -m)"

echo "╔══════════════════════════════════════════════════════╗"
echo "║     Potdo — Portaldot Dev Node Setup                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

if [ "$DOCKER_MODE" = true ]; then
    echo "🐳 Mode: Docker (Linux binary)"
    TARGET_OS="linux"
else
    echo "💻 Mode: Native ($OS $ARCH)"
    TARGET_OS="$OS"
fi
echo ""

# Create testnet directory
mkdir -p "$TESTNET_DIR"

# ── Known search paths by OS ────────────────────────────────
MACOS_PATHS=(
    "$HOME/Desktop/portaldot-testnet-macos/portaldot_dev"
    "$HOME/Downloads/portaldot-testnet-macos/portaldot_dev"
    "$HOME/portaldot-testnet-macos/portaldot_dev"
)

LINUX_PATHS=(
    "$HOME/Desktop/portaldot-testnet-linux/portaldot_dev"
    "$HOME/Downloads/portaldot-testnet-linux/portaldot_dev"
    "$HOME/portaldot-testnet-linux/portaldot_dev"
    "$HOME/Desktop/portaldot-testnet/portaldot_dev"
    "$HOME/Downloads/portaldot-testnet/portaldot_dev"
)

# ── Find the binary ─────────────────────────────────────────
BINARY_SRC=""

if [ -n "${1:-}" ]; then
    # User provided a path
    if [ -f "$1" ]; then
        BINARY_SRC="$1"
    elif [ -d "$1" ] && [ -f "$1/portaldot_dev" ]; then
        BINARY_SRC="$1/portaldot_dev"
    else
        echo "❌ Binary not found at: $1"
        exit 1
    fi
else
    # Auto-detect based on target
    if [ "$DOCKER_MODE" = true ]; then
        SEARCH_PATHS=("${LINUX_PATHS[@]}")
    elif [ "$OS" = "Darwin" ]; then
        SEARCH_PATHS=("${MACOS_PATHS[@]}")
    else
        SEARCH_PATHS=("${LINUX_PATHS[@]}")
    fi

    for path in "${SEARCH_PATHS[@]}"; do
        if [ -f "$path" ]; then
            BINARY_SRC="$path"
            break
        fi
    done
fi

# ── Validate ─────────────────────────────────────────────────
if [ -z "$BINARY_SRC" ]; then
    echo "❌ Portaldot dev node binary not found."
    echo ""
    if [ "$DOCKER_MODE" = true ]; then
        echo "For Docker, you need a LINUX binary."
        echo "Download it from the Portaldot team and run:"
        echo "  ./scripts/setup-testnet.sh --docker /path/to/linux/portaldot_dev"
        echo ""
        echo "Searched in:"
        for path in "${LINUX_PATHS[@]}"; do
            echo "  • $path"
        done
    else
        echo "Download it from the Portaldot team and run:"
        echo "  ./scripts/setup-testnet.sh /path/to/portaldot_dev"
        echo ""
        echo "Searched in:"
        if [ "$OS" = "Darwin" ]; then
            for path in "${MACOS_PATHS[@]}"; do
                echo "  • $path"
            done
        else
            for path in "${LINUX_PATHS[@]}"; do
                echo "  • $path"
            done
        fi
    fi
    exit 1
fi

echo "📦 Found binary: $BINARY_SRC"

# Verify binary type matches target
FILE_TYPE="$(file -b "$BINARY_SRC" 2>/dev/null || echo "unknown")"
if [ "$DOCKER_MODE" = true ]; then
    if echo "$FILE_TYPE" | grep -q "Mach-O"; then
        echo ""
        echo "⚠️  WARNING: This is a macOS binary (Mach-O)."
        echo "   Docker needs a Linux (ELF) binary."
        echo "   Download the Linux version from the Portaldot team."
        echo ""
        echo "   Continuing anyway (will fail in Docker)..."
    fi
    DEST="$TESTNET_DIR/portaldot_dev_linux"
else
    DEST="$TESTNET_DIR/portaldot_dev"
fi

# ── Copy ─────────────────────────────────────────────────────
if [ "$BINARY_SRC" != "$DEST" ]; then
    cp "$BINARY_SRC" "$DEST"
    echo "✅ Copied to: testnet/$(basename "$DEST")"
else
    echo "✅ Binary already in place"
fi

# Also copy subkey if available
SUBKEY_SRC="$(dirname "$BINARY_SRC")/subkey"
if [ -f "$SUBKEY_SRC" ]; then
    cp "$SUBKEY_SRC" "$TESTNET_DIR/subkey"
    echo "✅ Copied subkey utility"
fi

# Make executable
chmod +x "$DEST"
[ -f "$TESTNET_DIR/subkey" ] && chmod +x "$TESTNET_DIR/subkey"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ Setup complete!                                  ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║                                                      ║"
if [ "$DOCKER_MODE" = true ]; then
echo "║  Start with Docker:                                  ║"
echo "║    make docker-up                                    ║"
else
echo "║  Start the dev node:                                 ║"
echo "║    make testnet                                      ║"
fi
echo "║                                                      ║"
echo "║  RPC endpoint: ws://127.0.0.1:9944                  ║"
echo "║  Dev accounts: Alice, Bob, Charlie (pre-funded)      ║"
echo "║                                                      ║"
echo "╚══════════════════════════════════════════════════════╝"

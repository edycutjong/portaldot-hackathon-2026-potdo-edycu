import { DEMO_ADDRESS_BOOK, TESTNET_ADDRESS_BOOK } from "./constants";
import { isValidSS58Address, resolveRecipient, parseAmount } from "./format";
import type { ParsedIntent } from "./types";

/**
 * Parse a natural language command into a structured intent.
 */
export function parseIntent(command: string, isDemo = true): ParsedIntent | null {
  const addressBook = isDemo ? DEMO_ADDRESS_BOOK : TESTNET_ADDRESS_BOOK;
  let original = command.trim();

  // Preprocess slash commands to map them to natural language formats
  if (original.startsWith("/")) {
    const parts = original.split(/\s+/);
    const slashCmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    if (slashCmd === "/sendall") {
      original = args ? `send everything to ${args}` : "";
    } else if (slashCmd === "/send") {
      original = args ? `send ${args}` : "";
    } else if (slashCmd === "/balance") {
      original = args ? `balance ${args}` : "check my balance";
    } else if (slashCmd === "/airdrop") {
      original = args ? `airdrop ${args}` : "";
    } else if (slashCmd === "/stake") {
      original = args ? `stake ${args}` : "";
    } else if (slashCmd === "/unstake") {
      original = args ? `unstake ${args}` : "";
    } else if (slashCmd === "/staking") {
      original = "show my staking info";
    } else if (slashCmd === "/identity") {
      if (args) {
        const targetClean = args.trim();
        const isKnownName =
          Object.values(DEMO_ADDRESS_BOOK).some(
            (n) => n.toLowerCase() === targetClean.toLowerCase()
          ) ||
          Object.values(TESTNET_ADDRESS_BOOK).some(
            (n) => n.toLowerCase() === targetClean.toLowerCase()
          );
        const isKnownAddress =
          Object.keys(DEMO_ADDRESS_BOOK).includes(targetClean) ||
          Object.keys(TESTNET_ADDRESS_BOOK).includes(targetClean);
        const isAddress = isValidSS58Address(targetClean);

        if (isKnownName || isKnownAddress || isAddress) {
          original = `who is ${targetClean}`;
        } else {
          original = `set my name to ${targetClean}`;
        }
      } else {
        original = "my identity";
      }
    } else if (slashCmd === "/whois") {
      original = args ? `who is ${args}` : "";
    } else if (slashCmd === "/vesting") {
      original = "show vesting schedule";
    } else if (slashCmd === "/fee") {
      original = args ? `how much gas for ${args}` : "estimate fee";
    } else if (slashCmd === "/chain") {
      original = "chain info";
    }
  }

  original = original.trim();
  if (!original) {
    return null;
  }
  const normalized = original.toLowerCase();

  // ── Chain Info ──────────────────────────────────────────────
  if (/chain\s*info|network\s*status|block\s*height|chain\s*status/.test(normalized)) {
    return { action: "check_chain_info" };
  }

  // ── Fee Estimation ─────────────────────────────────────────
  const feeMatch = original.match(
    /(?:how\s+much\s+(?:gas|fee|cost)|estimate\s+(?:gas|fee|cost)|(?:gas|fee|cost)\s+(?:for|to))\s*(?:for\s+|to\s+)?(.+)?/i
  );
  if (feeMatch) {
    return {
      action: "estimate_fee",
      command: feeMatch[1]?.trim() || command.trim(),
    };
  }

  // ── Vesting ────────────────────────────────────────────────
  if (/vesting|vested\s*tokens?|vesting\s*schedule/.test(normalized)) {
    return { action: "check_vesting" };
  }

  // ── Identity: Set ──────────────────────────────────────────
  const setIdentityMatch = original.match(
    /set\s+(?:my\s+)?(?:name|identity|display\s*name)\s+(?:to\s+|as\s+)?(.+)/i
  );
  if (setIdentityMatch) {
    const displayName = setIdentityMatch[1].replace(/[.!?"']+$/, "").trim();
    if (displayName) {
      return { action: "set_identity", displayName };
    }
  }

  // ── Identity: Query ────────────────────────────────────────
  const checkIdentityMatch = original.match(
    /who\s+is\s+(.+)|identity\s+(?:of\s+)?(.+)|lookup\s+(.+)/i
  );
  if (checkIdentityMatch) {
    const target = (checkIdentityMatch[1] || checkIdentityMatch[2] || checkIdentityMatch[3])
      .replace(/[.!?"']+$/, "")
      .trim();
    const resolved = resolveRecipient(target, addressBook);
    return {
      action: "check_identity",
      address: resolved?.address,
      name: resolved?.name || target,
    };
  }
  if (/(?:my|check)\s*identity|show\s*identity/.test(normalized)) {
    return { action: "check_identity" };
  }

  // ── Staking: Unstake ───────────────────────────────────────
  const unstakeMatch = normalized.match(
    /(?:unstake|unbond|withdraw\s+stake)\s+(\S+)\s*(?:pot|tokens?)?/i
  );
  if (unstakeMatch) {
    const amount = parseAmount(unstakeMatch[1]);
    if (amount) {
      return { action: "unstake", amount };
    }
  }

  // ── Staking: Stake ─────────────────────────────────────────
  const stakeMatch = original.match(
    /(?:stake|bond|nominate|delegate)\s+(\S+)\s*(?:pot|tokens?)?(?:\s+(?:to|with|for)\s+(.+))?/i
  );
  if (stakeMatch) {
    const amount = parseAmount(stakeMatch[1]);
    if (amount) {
      const validator = stakeMatch[2]?.replace(/[.!?"']+$/, "").trim();
      return {
        action: "stake",
        amount,
        ...(validator ? { validator } : {}),
      };
    }
  }

  // ── Staking: Query ─────────────────────────────────────────
  if (
    /(?:show|check|view|my)\s*(?:staking|stake|bonded|nominations?|staked)/i.test(normalized) ||
    normalized === "staking info" ||
    normalized === "staking"
  ) {
    return { action: "check_staking" };
  }

  // ── Check Balance ──────────────────────────────────────────
  if (
    normalized.includes("balance") ||
    normalized.includes("how much") ||
    normalized.includes("what's my")
  ) {
    return { action: "check_balance" };
  }

  // ── Batch Transfer ─────────────────────────────────────────
  const batchMatch = normalized.match(
    /(?:airdrop|send|transfer)\s+(\S+)\s+(?:pot|tokens?)?\s*(?:to|for)\s+(.+)/i
  );
  if (batchMatch) {
    const amountStr = batchMatch[1];
    const recipientsPart = batchMatch[2];

    // Check if multiple recipients (comma or "and")
    const recipientNames = recipientsPart
      .split(/[,&]|\band\b/i)
      .map((s) => s.trim())
      .filter(Boolean);

    if (recipientNames.length > 1) {
      const amount = parseAmount(amountStr);
      if (!amount) return null;

      const transfers = recipientNames.map((name) => {
        const resolved = resolveRecipient(name, addressBook);
        return {
          to: resolved?.name || name,
          toAddress: resolved?.address || "",
          amount,
        };
      });

      // Validate all addresses resolved
      if (transfers.some((t) => !t.toAddress && !isValidSS58Address(t.to))) {
        return null;
      }

      return { action: "batch_transfer", transfers };
    }
  }

  // ── "Send everything to X" ─────────────────────────────────
  const maxMatch = normalized.match(
    /(?:send|transfer)\s+(?:everything|all|max)\s+(?:to|for)\s+(.+)/i
  );
  if (maxMatch) {
    const recipientName = maxMatch[1].replace(/[.!?]+$/, "").trim();
    const resolved = resolveRecipient(recipientName, addressBook);
    if (!resolved) return null;

    return {
      action: "transfer",
      to: resolved.name,
      toAddress: resolved.address,
      amount: -1, // -1 signals "max transfer"
    };
  }

  // ── Single Transfer ────────────────────────────────────────
  const transferMatch = normalized.match(
    /(?:send|transfer|pay)\s+(\S+)\s+(?:pot|tokens?)?\s*(?:to|for)\s+(.+)/i
  );
  if (transferMatch) {
    const amountStr = transferMatch[1];
    const recipientName = transferMatch[2].replace(/[.!?]+$/, "").trim();

    const amount = parseAmount(amountStr);
    if (!amount) return null;

    const resolved = resolveRecipient(recipientName, addressBook);
    if (!resolved) return null;

    return {
      action: "transfer",
      to: resolved.name,
      toAddress: resolved.address,
      amount,
    };
  }

  return null;
}

/**
 * Validate a parsed intent for safety.
 */
export function validateIntent(intent: ParsedIntent): {
  valid: boolean;
  error?: string;
} {
  if (intent.action === "transfer") {
    if (!isValidSS58Address(intent.toAddress)) {
      return { valid: false, error: `Invalid address: ${intent.toAddress}` };
    }
    if (intent.amount <= 0 && intent.amount !== -1) {
      return { valid: false, error: "Amount must be greater than 0" };
    }
    return { valid: true };
  }

  if (intent.action === "batch_transfer") {
    if (intent.transfers.length === 0) {
      return { valid: false, error: "No recipients specified" };
    }
    if (intent.transfers.length > 10) {
      return { valid: false, error: "Maximum 10 recipients per batch" };
    }
    for (const t of intent.transfers) {
      if (!isValidSS58Address(t.toAddress)) {
        return { valid: false, error: `Invalid address for ${t.to}: ${t.toAddress}` };
      }
      if (t.amount <= 0) {
        return { valid: false, error: `Invalid amount for ${t.to}` };
      }
    }
    return { valid: true };
  }

  if (intent.action === "check_balance") {
    return { valid: true };
  }

  if (intent.action === "stake") {
    if (intent.amount <= 0) {
      return { valid: false, error: "Stake amount must be greater than 0" };
    }
    return { valid: true };
  }

  if (intent.action === "unstake") {
    if (intent.amount <= 0) {
      return { valid: false, error: "Unstake amount must be greater than 0" };
    }
    return { valid: true };
  }

  if (intent.action === "set_identity") {
    if (!intent.displayName || intent.displayName.length === 0) {
      return { valid: false, error: "Display name cannot be empty" };
    }
    if (intent.displayName.length > 32) {
      return { valid: false, error: "Display name must be 32 characters or less" };
    }
    return { valid: true };
  }

  // Read-only intents are always valid
  if (
    intent.action === "check_staking" ||
    intent.action === "check_identity" ||
    intent.action === "check_vesting" ||
    intent.action === "estimate_fee" ||
    intent.action === "check_chain_info"
  ) {
    return { valid: true };
  }

  return { valid: false, error: "Unknown intent action" };
}

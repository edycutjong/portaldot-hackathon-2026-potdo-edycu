/**
 * Core intent parsing logic — shared between server-only ai-tools.ts and tests.
 * Does NOT import "server-only" so it can be tested in Jest.
 */

import { ADDRESS_BOOK } from "./constants";
import { isValidSS58Address, resolveRecipient, parseAmount } from "./format";
import type { ParsedIntent } from "./types";

/**
 * Parse a natural language command into a structured intent.
 */
export function parseIntent(command: string): ParsedIntent | null {
  const normalized = command.trim().toLowerCase();

  // Check balance
  if (
    normalized.includes("balance") ||
    normalized.includes("how much") ||
    normalized.includes("what's my")
  ) {
    return { action: "check_balance" };
  }

  // Batch transfer: "airdrop X to A, B, and C"
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
        const resolved = resolveRecipient(name, ADDRESS_BOOK);
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

  // "Send everything to X" pattern — check BEFORE single transfer
  const maxMatch = normalized.match(
    /(?:send|transfer)\s+(?:everything|all|max)\s+(?:to|for)\s+(.+)/i
  );
  if (maxMatch) {
    const recipientName = maxMatch[1].replace(/[.!?]+$/, "").trim();
    const resolved = resolveRecipient(recipientName, ADDRESS_BOOK);
    if (!resolved) return null;

    return {
      action: "transfer",
      to: resolved.name,
      toAddress: resolved.address,
      amount: -1, // -1 signals "max transfer"
    };
  }

  // Single transfer: "send X POT to Y"
  const transferMatch = normalized.match(
    /(?:send|transfer|pay)\s+(\S+)\s+(?:pot|tokens?)?\s*(?:to|for)\s+(.+)/i
  );
  if (transferMatch) {
    const amountStr = transferMatch[1];
    const recipientName = transferMatch[2].replace(/[.!?]+$/, "").trim();

    const amount = parseAmount(amountStr);
    if (!amount) return null;

    const resolved = resolveRecipient(recipientName, ADDRESS_BOOK);
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

  return { valid: false, error: "Unknown intent action" };
}

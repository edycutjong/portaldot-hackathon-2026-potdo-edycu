// Shared TypeScript types for Potdo

/** Supported AI intent actions */
export type IntentAction = "transfer" | "batch_transfer" | "check_balance";

/** Parsed intent from the AI */
export interface TransferIntent {
  action: "transfer";
  to: string; // recipient name or address
  toAddress: string; // resolved SS58 address
  amount: number; // human-readable POT amount
}

export interface BatchTransferIntent {
  action: "batch_transfer";
  transfers: Array<{
    to: string;
    toAddress: string;
    amount: number;
  }>;
}

export interface CheckBalanceIntent {
  action: "check_balance";
  address?: string; // optional target address, defaults to connected wallet
}

export type ParsedIntent =
  | TransferIntent
  | BatchTransferIntent
  | CheckBalanceIntent;

/** Balance breakdown from Portaldot RPC */
export interface BalanceInfo {
  free: bigint;
  reserved: bigint;
  frozen: bigint;
  /** Human-readable free balance in POT */
  freeFormatted: string;
  reservedFormatted: string;
  frozenFormatted: string;
}

/** Transaction status lifecycle */
export type TxStatus =
  | "pending"
  | "submitted"
  | "in_block"
  | "finalized"
  | "failed";

/** Transaction result */
export interface TxResult {
  status: TxStatus;
  txHash?: string;
  blockNumber?: number;
  error?: string;
  explorerUrl?: string;
}

/** Chat message types */
export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  intent?: ParsedIntent;
  txResult?: TxResult;
  timestamp: Date;
}

/** Command history entry for sidebar */
export interface HistoryEntry {
  id: string;
  command: string;
  status: TxStatus | "parsed";
  timestamp: Date;
  txHash?: string;
}

// Shared TypeScript types for Potdo

/** Supported AI intent actions */
export type IntentAction =
  | "transfer"
  | "batch_transfer"
  | "check_balance"
  | "stake"
  | "unstake"
  | "check_staking"
  | "set_identity"
  | "check_identity"
  | "check_vesting"
  | "estimate_fee"
  | "check_chain_info";

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

export interface StakeIntent {
  action: "stake";
  amount: number;
  validator?: string; // optional validator address or name
}

export interface UnstakeIntent {
  action: "unstake";
  amount: number;
}

export interface CheckStakingIntent {
  action: "check_staking";
}

export interface SetIdentityIntent {
  action: "set_identity";
  displayName: string;
}

export interface CheckIdentityIntent {
  action: "check_identity";
  address?: string; // optional, defaults to connected wallet
  name?: string; // human-readable name for display
}

export interface CheckVestingIntent {
  action: "check_vesting";
}

export interface EstimateFeeIntent {
  action: "estimate_fee";
  command: string; // the original command to estimate fees for
}

export interface CheckChainInfoIntent {
  action: "check_chain_info";
}

export type ParsedIntent =
  | TransferIntent
  | BatchTransferIntent
  | CheckBalanceIntent
  | StakeIntent
  | UnstakeIntent
  | CheckStakingIntent
  | SetIdentityIntent
  | CheckIdentityIntent
  | CheckVestingIntent
  | EstimateFeeIntent
  | CheckChainInfoIntent;

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

/** Staking info from Portaldot RPC */
export interface StakingInfo {
  bonded: string; // bonded amount in POT
  active: string; // active stake in POT
  unlocking: string; // amount currently unbonding
  nominations: string[]; // nominated validator addresses
  rewardDestination: string;
}

/** On-chain identity */
export interface OnChainIdentity {
  display: string;
  web?: string;
  email?: string;
  twitter?: string;
  isVerified: boolean;
  address: string;
}

/** Vesting schedule */
export interface VestingSchedule {
  locked: string; // total locked in POT
  perPeriod: string; // release per period in POT
  startingBlock: number;
  periodCount: number;
  alreadyVested: string; // already vested in POT
}

/** Fee estimate result */
export interface FeeEstimate {
  partialFee: string; // estimated fee in POT
  weight: string;
  class: string; // "Normal" | "Operational" | "Mandatory"
}

/** Chain info from system RPC */
export interface ChainInfo {
  chainName: string;
  blockNumber: number;
  runtimeVersion: number;
  peerCount: number;
  isSyncing: boolean;
  nodeVersion: string;
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
  // Rich data payloads for query intents
  stakingInfo?: StakingInfo;
  identity?: OnChainIdentity;
  vestingSchedule?: VestingSchedule;
  feeEstimate?: FeeEstimate;
  chainInfo?: ChainInfo;
}

/** Command history entry for sidebar */
export interface HistoryEntry {
  id: string;
  command: string;
  status: TxStatus | "parsed";
  timestamp: Date;
  txHash?: string;
}

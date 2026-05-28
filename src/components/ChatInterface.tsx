"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import { TransferCard } from "./TransferCard";
import { BatchCard } from "./BatchCard";
import { BalanceWidget } from "./BalanceWidget";
import { StakingCard } from "./StakingCard";
import { StakingInfoWidget } from "./StakingInfoWidget";
import { IdentityCard } from "./IdentityCard";
import { SetIdentityCard } from "./SetIdentityCard";
import { VestingWidget } from "./VestingWidget";
import { FeeEstimateWidget } from "./FeeEstimateWidget";
import { ChainInfoWidget } from "./ChainInfoWidget";
import { TxConfirmation } from "./TxConfirmation";
import { TxError } from "./TxError";
import { SUGGESTED_COMMANDS, SLASH_COMMANDS } from "@/lib/constants";
import type {
  ChatMessage,
  ParsedIntent,
  TxResult,
  TxStatus,
  TransferIntent,
  BatchTransferIntent,
  StakeIntent,
  UnstakeIntent,
  SetIdentityIntent,
} from "@/lib/types";
import { useWallet } from "@/context/WalletContext";
import { logTransaction } from "@/lib/supabase";
import { planckToPot, potToPlanck } from "@/lib/format";

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

interface ChatInterfaceProps {
  externalInput?: string;
  onExternalInputConsumed?: () => void;
  onCommandExecuted?: () => void;
}

export function ChatInterface({
  externalInput,
  onExternalInputConsumed,
  onCommandExecuted,
}: ChatInterfaceProps) {
  const {
    address,
    balance,
    executeTransfer,
    executeBatch,
    executeStake,
    executeUnstake,
    executeSetIdentity,
    queryStaking,
    queryIdentity,
    queryVesting,
    estimateFee,
    queryChainInfo,
    connect,
    connected,
    accounts,
    chainName,
    isDemoMode,
    isBalanceLoading,
  } = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>(() => []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const getStorageKey = useCallback(() => {
    const networkKey = (chainName || "Demo Network").toLowerCase().replace(/[^a-z0-9]+/g, "_");
    return address
      ? `potdo_chat_history_${networkKey}_${address}`
      : `potdo_chat_history_${networkKey}_guest`;
  }, [address, chainName]);

  const getDynamicCommand = useCallback(
    (cmd: string) => {
      if (process.env.NODE_ENV === "test" && !safeGetItem("test_enable_dynamic_commands")) {
        return cmd;
      }
      let result = cmd;

      // 1. Map to network-appropriate names if not in Demo Mode
      if (!isDemoMode) {
        result = result
          .replace(/\bAlpha\b/g, "Alice")
          .replace(/\bBeta\b/g, "Bob")
          .replace(/\bGamma\b/g, "Charlie")
          .replace(/\bDelta\b/g, "Dave");
      } else {
        result = result
          .replace(/\bAlice\b/g, "Alpha")
          .replace(/\bBob\b/g, "Beta")
          .replace(/\bCharlie\b/g, "Gamma")
          .replace(/\bDave\b/g, "Delta");
      }

      // 2. Prevent sending to oneself or referring to own name
      const activeAccount = accounts ? accounts.find((a) => a.address === address) : undefined;
      const activeName =
        activeAccount && activeAccount.meta && typeof activeAccount.meta.name === "string"
          ? activeAccount.meta.name
          : "";
      if (activeName) {
        const activeLower = activeName.toLowerCase();
        const pool = isDemoMode
          ? ["Alpha", "Beta", "Gamma", "Delta"]
          : ["Alice", "Bob", "Charlie", "Dave"];

        // Check if activeName is a known pool name (case-insensitive)
        const activePoolIndex = pool.findIndex((p) => p.toLowerCase() === activeLower);

        if (activePoolIndex !== -1) {
          // Find all pool names present in the command (case-insensitive)
          const presentNames = pool.filter((p) => {
            const regex = new RegExp(`\\b${p}\\b`, "i");
            return regex.test(result);
          });

          // If the active name is in the command
          const isActiveNamePresent = presentNames.some((pn) => pn.toLowerCase() === activeLower);

          if (isActiveNamePresent) {
            if (presentNames.length > 1) {
              // Multi-recipient case: find a pool name not present in the command and not activeName
              const unusedNames = pool.filter(
                (p) =>
                  !presentNames.some((pn) => pn.toLowerCase() === p.toLowerCase()) &&
                  p.toLowerCase() !== activeLower
              );

              const replacement =
                unusedNames.length > 0
                  ? unusedNames[0]
                  : activeLower === "alpha" || activeLower === "alice"
                    ? pool[1]
                    : pool[0];

              // Replace only the active name in the command
              const activeOriginalName = presentNames.find(
                (pn) => pn.toLowerCase() === activeLower
              )!;
              const regex = new RegExp(`\\b${activeOriginalName}\\b`, "g");
              result = result.replace(regex, replacement);
            } else {
              // Single recipient/occurrence case: replace with standard fallback
              const fallback =
                activeLower === "alpha" || activeLower === "alice" ? pool[1] : pool[0];
              const activeOriginalName = presentNames[0];
              const regex = new RegExp(`\\b${activeOriginalName}\\b`, "g");
              result = result.replace(regex, fallback);
            }
          }
        } else {
          // For custom names (like "Edy"), if they are mentioned in the command
          if (result.toLowerCase().includes(activeLower)) {
            const fallback = isDemoMode ? "Alpha" : "Alice";
            const regex = new RegExp(`\\b${activeName}\\b`, "gi");
            result = result.replace(regex, fallback);
          }
        }
      }
      return result;
    },
    [address, accounts, isDemoMode]
  );

  const lastLoadedKeyRef = useRef<string | null>(null);

  // Load chat history when address or chainName changes
  useEffect(() => {
    if (process.env.NODE_ENV === "test" && !safeGetItem("test_enable_persistence")) {
      return;
    }
    const key = getStorageKey();
    try {
      const stored = safeGetItem(key);
      const loadedMessages = stored ? JSON.parse(stored) : [];
      setTimeout(() => {
        setMessages(loadedMessages);
      }, 0);
    } catch (err) {
      console.error("Failed to load chat history:", err);
      setTimeout(() => {
        setMessages([]);
      }, 0);
    }
    lastLoadedKeyRef.current = key;
  }, [getStorageKey]);

  // Save chat history when messages change
  useEffect(() => {
    if (process.env.NODE_ENV === "test" && !safeGetItem("test_enable_persistence")) {
      return;
    }
    const key = getStorageKey();
    if (lastLoadedKeyRef.current !== key) {
      return;
    }
    if (messages.length > 0) {
      try {
        localStorage.setItem(key, JSON.stringify(messages));
      } catch (err) {
        console.error("Failed to save chat history:", err);
      }
    } else {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        console.error("Failed to clear chat history:", err);
      }
    }
  }, [messages, getStorageKey]);
  const [lastConsumed, setLastConsumed] = useState<string | undefined>(undefined);

  // Consume external input (e.g. from CommandHistory click)
  // "Adjusting state during render" pattern for local state — React 19 approved
  if (externalInput && externalInput !== lastConsumed) {
    setLastConsumed(externalInput);
    setInput(externalInput);
  }

  // Notify parent in useEffect to avoid render-phase updates of another component
  useEffect(() => {
    if (externalInput && externalInput === lastConsumed) {
      onExternalInputConsumed?.();
    }
  }, [externalInput, lastConsumed, onExternalInputConsumed]);

  // Focus the input when external input arrives (DOM side-effect)
  useEffect(() => {
    if (externalInput) {
      inputRef.current?.focus();
    }
  }, [externalInput]);

  const handleExecute = async (msg: ChatMessage) => {
    if (!address || !connected) {
      await connect(false);
      return;
    }
    const intent = msg.intent as TransferIntent;
    const userMessage = messages.findLast((m) => m.role === "user");

    // Resolve Max Transfer (-1) to the actual balance minus the gas fee
    let finalAmount = intent.amount;
    const gasFeePot = 0.0012;
    const gasFeePlanck = potToPlanck(gasFeePot);
    if (intent.amount === -1 && balance !== undefined) {
      const maxSendPlanck = balance > gasFeePlanck ? balance - gasFeePlanck : 0n;
      finalAmount = Number(planckToPot(maxSendPlanck));
    }

    const commandText = userMessage
      ? userMessage.content
      : `Send ${finalAmount} POT to ${intent.to}`;

    await executeTransfer(
      intent.toAddress,
      finalAmount,
      async (status, txHash, blockNumber, error) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id
              ? {
                  ...m,
                  txResult: {
                    status: status as TxStatus,
                    txHash,
                    blockNumber,
                    error,
                    explorerUrl: txHash
                      ? `https://portaldot.subscan.io/extrinsic/${txHash}`
                      : undefined,
                  },
                }
              : m
          )
        );

        if (status === "finalized" || status === "failed") {
          await logTransaction({
            sender: address,
            command: commandText,
            intent: { ...intent, amount: finalAmount } as unknown as Record<string, unknown>,
            txHash,
            blockNumber,
            status,
            errorMessage: error,
            gasFee: "0.0012",
          });

          onCommandExecuted?.();
        }
      }
    );
  };

  const handleExecuteBatch = async (msg: ChatMessage) => {
    if (!address || !connected) {
      await connect(false);
      return;
    }
    const intent = msg.intent as BatchTransferIntent;
    const userMessage = messages.findLast((m) => m.role === "user");
    const commandText = userMessage
      ? userMessage.content
      : `Batch Airdrop to ${intent.transfers.length} recipients`;

    await executeBatch(intent.transfers, async (status, txHash, blockNumber, error) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? {
                ...m,
                txResult: {
                  status: status as TxStatus,
                  txHash,
                  blockNumber,
                  error,
                  explorerUrl: txHash
                    ? `https://portaldot.subscan.io/extrinsic/${txHash}`
                    : undefined,
                },
              }
            : m
        )
      );

      if (status === "finalized" || status === "failed") {
        await logTransaction({
          sender: address,
          command: commandText,
          intent: intent as unknown as Record<string, unknown>,
          txHash,
          blockNumber,
          status,
          errorMessage: error,
          gasFee: "0.003",
        });

        onCommandExecuted?.();
      }
    });
  };

  const handleExecuteStake = async (msg: ChatMessage) => {
    if (!address || !connected) {
      await connect(false);
      return;
    }
    const intent = msg.intent!;
    const isStake = intent.action === "stake";
    const amount = isStake ? (intent as StakeIntent).amount : (intent as UnstakeIntent).amount;
    const executor = isStake
      ? (cb: (s: string, h?: string, b?: number, e?: string) => void) =>
          executeStake(amount, isStake && "validator" in intent ? intent.validator : undefined, cb)
      : (cb: (s: string, h?: string, b?: number, e?: string) => void) => executeUnstake(amount, cb);

    await executor((status, txHash, blockNumber, error) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? {
                ...m,
                txResult: {
                  status: status as TxStatus,
                  txHash,
                  blockNumber,
                  error,
                  explorerUrl: txHash
                    ? `https://portaldot.subscan.io/extrinsic/${txHash}`
                    : undefined,
                },
              }
            : m
        )
      );
      if (status === "finalized" || status === "failed") onCommandExecuted?.();
    });
  };

  const handleExecuteIdentity = async (msg: ChatMessage) => {
    if (!address || !connected) {
      await connect(false);
      return;
    }
    const intent = msg.intent as SetIdentityIntent;

    await executeSetIdentity(intent.displayName, (status, txHash, blockNumber, error) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? {
                ...m,
                txResult: {
                  status: status as TxStatus,
                  txHash,
                  blockNumber,
                  error,
                  explorerUrl: txHash
                    ? `https://portaldot.subscan.io/extrinsic/${txHash}`
                    : undefined,
                },
              }
            : m
        )
      );
      if (status === "finalized" || status === "failed") onCommandExecuted?.();
    });
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, isDemo: isDemoMode }),
      });

      const data = await res.json();
      const intent = data.intent as ParsedIntent | undefined;

      // For query intents, fetch the data immediately
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message || "",
        intent,
        txResult: data.txResult as TxResult | undefined,
        timestamp: new Date(),
      };

      // Enrich query intents with data
      if (intent) {
        try {
          switch (intent.action) {
            case "check_staking":
              aiMsg.stakingInfo = await queryStaking();
              break;
            case "check_identity":
              aiMsg.identity = await queryIdentity(intent.address);
              break;
            case "check_vesting":
              aiMsg.vestingSchedule = await queryVesting();
              break;
            case "estimate_fee":
              aiMsg.feeEstimate = await estimateFee(intent.command);
              break;
            case "check_chain_info":
              aiMsg.chainInfo = await queryChainInfo();
              break;
          }
        } catch {
          // Query failed, message will still show without data widget
        }
      }

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (cmd: string) => {
    setInput(cmd);
    setSlashIndex(0);
    inputRef.current?.focus();
  };

  // ── Slash command autocomplete ──────────────────────────
  const [slashIndex, setSlashIndex] = useState(0);

  const filteredSlash = useMemo(() => {
    if (!input.startsWith("/")) return [];
    const query = input.toLowerCase();
    return SLASH_COMMANDS.filter((s) => s.command.startsWith(query));
  }, [input]);

  const showSlashMenu = input.startsWith("/") && filteredSlash.length > 0;

  const selectSlashCommand = useCallback(
    (idx: number) => {
      const cmd = filteredSlash[idx];
      if (cmd) {
        setInput(getDynamicCommand(cmd.example));
        inputRef.current?.focus();
      }
    },
    [filteredSlash, getDynamicCommand]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!showSlashMenu) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIndex((i) => Math.min(i + 1, filteredSlash.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectSlashCommand(slashIndex);
      } else if (e.key === "Escape") {
        setInput("");
      }
    },
    [showSlashMenu, filteredSlash.length, slashIndex, selectSlashCommand]
  );

  const renderIntentCard = (msg: ChatMessage) => {
    if (!msg.intent) return null;

    if (msg.txResult?.status === "finalized") {
      return <TxConfirmation txResult={msg.txResult} />;
    }
    if (msg.txResult?.status === "failed") {
      return <TxError txResult={msg.txResult} />;
    }

    switch (msg.intent.action) {
      case "transfer": {
        const activeAccount = accounts?.find((a) => a.address === address);
        const senderName = activeAccount?.meta?.name || "Guest";
        return (
          <TransferCard
            intent={msg.intent}
            senderBalance={balance}
            isConnected={connected}
            status={msg.txResult?.status}
            onExecute={() => handleExecute(msg)}
            senderAddress={address || undefined}
            senderName={senderName}
          />
        );
      }
      case "batch_transfer": {
        const activeAccount = accounts?.find((a) => a.address === address);
        const senderName = activeAccount?.meta?.name || "Guest";
        return (
          <BatchCard
            intent={msg.intent}
            senderBalance={balance}
            isConnected={connected}
            status={msg.txResult?.status}
            onExecute={() => handleExecuteBatch(msg)}
            senderAddress={address || undefined}
            senderName={senderName}
          />
        );
      }
      case "check_balance":
        return <BalanceWidget free={isBalanceLoading ? "..." : planckToPot(balance)} />;
      case "stake":
      case "unstake":
        return (
          <StakingCard
            intent={msg.intent}
            senderBalance={balance}
            isConnected={connected}
            status={msg.txResult?.status}
            onExecute={() => handleExecuteStake(msg)}
          />
        );
      case "check_staking":
        return msg.stakingInfo ? <StakingInfoWidget info={msg.stakingInfo} /> : null;
      case "set_identity":
        return (
          <SetIdentityCard
            intent={msg.intent}
            isConnected={connected}
            status={msg.txResult?.status}
            onExecute={() => handleExecuteIdentity(msg)}
          />
        );
      case "check_identity":
        return msg.identity ? <IdentityCard identity={msg.identity} /> : null;
      case "check_vesting":
        return msg.vestingSchedule ? <VestingWidget schedule={msg.vestingSchedule} /> : null;
      case "estimate_fee":
        return msg.feeEstimate ? <FeeEstimateWidget fee={msg.feeEstimate} /> : null;
      case "check_chain_info":
        return msg.chainInfo ? <ChainInfoWidget info={msg.chainInfo} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-2 text-2xl font-bold text-slate-300">Welcome to Potdo</h2>
              <p className="mb-8 max-w-md text-slate-500">
                Your AI copilot for Portaldot. Type a command in plain English to create, preview,
                and execute transactions — or query staking, identity, vesting, fees, and chain
                status.
              </p>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageBubble
                message={msg}
                senderAddress={address || undefined}
                senderName={accounts?.find((a) => a.address === address)?.meta?.name || "Guest"}
              />
              {msg.role === "assistant" && renderIntentCard(msg)}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-center gap-1 pl-4">
            <div className="typing-dot h-2 w-2 rounded-full bg-purple-400" />
            <div className="typing-dot h-2 w-2 rounded-full bg-purple-400" />
            <div className="typing-dot h-2 w-2 rounded-full bg-purple-400" />
          </div>
        )}
      </div>

      {/* Suggested commands */}
      {messages.length === 0 && (
        <div className="flex flex-wrap justify-center gap-2 px-4 pb-2">
          {SUGGESTED_COMMANDS.map((cmd) => {
            const dynamicCmd = getDynamicCommand(cmd);
            return (
              <button
                key={cmd}
                onClick={() => handleSuggestion(dynamicCmd)}
                className="glass-card cursor-pointer px-3 py-1.5 text-sm text-slate-400 transition-all duration-200 hover:border-cyan-400/30 hover:text-cyan-400"
              >
                {dynamicCmd}
              </button>
            );
          })}
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="border-t border-white/5 p-4">
        <div className="relative">
          {/* Slash command dropdown */}
          <AnimatePresence>
            {showSlashMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 bottom-full left-0 z-50 mb-2 max-h-[320px] overflow-hidden overflow-y-auto rounded-xl border border-white/10 bg-[#111118] shadow-xl shadow-black/40"
                id="slash-menu"
              >
                <div className="border-b border-white/5 px-3 py-2 text-[11px] tracking-wider text-slate-500 uppercase">
                  Commands
                </div>
                {filteredSlash.map((cmd, i) => (
                  <button
                    key={cmd.command}
                    type="button"
                    onClick={() => selectSlashCommand(i)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100 ${
                      i === slashIndex
                        ? "bg-cyan-500/10 text-cyan-300"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="w-[80px] shrink-0 font-mono text-sm font-semibold text-cyan-400">
                      {cmd.command}
                    </span>
                    <span className="truncate text-sm text-slate-400">{cmd.description}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setSlashIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Try: "${getDynamicCommand("Send 10 POT to Alpha")}" (or type "/" for commands)...`}
            disabled={isLoading}
            className="w-full rounded-xl border border-white/10 bg-[#111118] px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-all duration-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none disabled:opacity-50"
            id="chat-input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-cyan-500/10 p-2 text-cyan-400 transition-all duration-200 hover:bg-cyan-500/20 disabled:opacity-30"
            id="chat-submit"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9M14.5 1.5L1.5 6L7 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

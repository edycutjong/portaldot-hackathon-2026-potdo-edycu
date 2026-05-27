"use client";

import { useState, useRef, useEffect, useMemo, useCallback, type FormEvent, type KeyboardEvent } from "react";
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
import type { ChatMessage, ParsedIntent, TxResult, TxStatus, TransferIntent, BatchTransferIntent, StakeIntent, UnstakeIntent, SetIdentityIntent } from "@/lib/types";
import { useWallet } from "@/context/WalletContext";
import { logTransaction } from "@/lib/supabase";
import { planckToPot } from "@/lib/format";

interface ChatInterfaceProps {
  externalInput?: string;
  onExternalInputConsumed?: () => void;
  onCommandExecuted?: () => void;
}

export function ChatInterface({ externalInput, onExternalInputConsumed, onCommandExecuted }: ChatInterfaceProps) {
  const {
    address, balance, executeTransfer, executeBatch, executeStake, executeUnstake,
    executeSetIdentity, queryStaking, queryIdentity, queryVesting, estimateFee,
    queryChainInfo, connect, connected,
  } = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>(() => []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
    const commandText = userMessage ? userMessage.content : `Send ${intent.amount} POT to ${intent.to}`;

    await executeTransfer(intent.toAddress, intent.amount, async (status, txHash, blockNumber, error) => {
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
                  explorerUrl: txHash ? `https://portaldot.subscan.io/extrinsic/${txHash}` : undefined,
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
          gasFee: "0.001",
        });

        onCommandExecuted?.();
      }
    });
  };

  const handleExecuteBatch = async (msg: ChatMessage) => {
    if (!address || !connected) {
      await connect(false);
      return;
    }
    const intent = msg.intent as BatchTransferIntent;
    const userMessage = messages.findLast((m) => m.role === "user");
    const commandText = userMessage ? userMessage.content : `Batch Airdrop to ${intent.transfers.length} recipients`;

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
                  explorerUrl: txHash ? `https://portaldot.subscan.io/extrinsic/${txHash}` : undefined,
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
    if (!address || !connected) { await connect(false); return; }
    const intent = msg.intent!;
    const isStake = intent.action === "stake";
    const amount = isStake ? (intent as StakeIntent).amount : (intent as UnstakeIntent).amount;
    const executor = isStake
      ? (cb: (s: string, h?: string, b?: number, e?: string) => void) =>
          executeStake(amount, isStake && "validator" in intent ? intent.validator : undefined, cb)
      : (cb: (s: string, h?: string, b?: number, e?: string) => void) =>
          executeUnstake(amount, cb);

    await executor((status, txHash, blockNumber, error) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? {
                ...m,
                txResult: {
                  status: status as TxStatus, txHash, blockNumber, error,
                  explorerUrl: txHash ? `https://portaldot.subscan.io/extrinsic/${txHash}` : undefined,
                },
              }
            : m
        )
      );
      if (status === "finalized" || status === "failed") onCommandExecuted?.();
    });
  };

  const handleExecuteIdentity = async (msg: ChatMessage) => {
    if (!address || !connected) { await connect(false); return; }
    const intent = msg.intent as SetIdentityIntent;

    await executeSetIdentity(intent.displayName, (status, txHash, blockNumber, error) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? {
                ...m,
                txResult: {
                  status: status as TxStatus, txHash, blockNumber, error,
                  explorerUrl: txHash ? `https://portaldot.subscan.io/extrinsic/${txHash}` : undefined,
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
        body: JSON.stringify({ message: trimmed }),
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

  const selectSlashCommand = useCallback((idx: number) => {
    const cmd = filteredSlash[idx];
    if (cmd) {
      setInput(cmd.example);
      inputRef.current?.focus();
    }
  }, [filteredSlash]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
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
  }, [showSlashMenu, filteredSlash.length, slashIndex, selectSlashCommand]);

  const renderIntentCard = (msg: ChatMessage) => {
    if (!msg.intent) return null;

    if (msg.txResult?.status === "finalized") {
      return <TxConfirmation txResult={msg.txResult} />;
    }
    if (msg.txResult?.status === "failed") {
      return <TxError txResult={msg.txResult} />;
    }

    switch (msg.intent.action) {
      case "transfer":
        return (
          <TransferCard
            intent={msg.intent}
            senderBalance={balance}
            isConnected={connected}
            status={msg.txResult?.status}
            onExecute={() => handleExecute(msg)}
          />
        );
      case "batch_transfer":
        return (
          <BatchCard
            intent={msg.intent}
            senderBalance={balance}
            isConnected={connected}
            status={msg.txResult?.status}
            onExecute={() => handleExecuteBatch(msg)}
          />
        );
      case "check_balance":
        return <BalanceWidget free={planckToPot(balance)} />;
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
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-slate-300 mb-2">
                Welcome to Potdo
              </h2>
              <p className="text-slate-500 mb-8 max-w-md">
                Your AI copilot for Portaldot. Type a command in plain English
                to create, preview, and execute transactions — or query staking,
                identity, vesting, fees, and chain status.
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
              <MessageBubble message={msg} />
              {msg.role === "assistant" && renderIntentCard(msg)}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-center gap-1 pl-4">
            <div className="typing-dot w-2 h-2 rounded-full bg-purple-400" />
            <div className="typing-dot w-2 h-2 rounded-full bg-purple-400" />
            <div className="typing-dot w-2 h-2 rounded-full bg-purple-400" />
          </div>
        )}
      </div>

      {/* Suggested commands */}
      {messages.length === 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 justify-center">
          {SUGGESTED_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleSuggestion(cmd)}
              className="glass-card px-3 py-1.5 text-sm text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-all duration-200 cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-white/5"
      >
        <div className="relative">
          {/* Slash command dropdown */}
          <AnimatePresence>
            {showSlashMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-[#111118] border border-white/10 rounded-xl overflow-hidden shadow-xl shadow-black/40 max-h-[320px] overflow-y-auto z-50"
                id="slash-menu"
              >
                <div className="px-3 py-2 text-[11px] text-slate-500 uppercase tracking-wider border-b border-white/5">
                  Commands
                </div>
                {filteredSlash.map((cmd, i) => (
                  <button
                    key={cmd.command}
                    onClick={() => selectSlashCommand(i)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors duration-100 ${
                      i === slashIndex
                        ? "bg-cyan-500/10 text-cyan-300"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="font-mono text-sm font-semibold text-cyan-400 w-[80px] shrink-0">
                      {cmd.command}
                    </span>
                    <span className="text-sm text-slate-400 truncate">
                      {cmd.description}
                    </span>
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
            placeholder='Try: "Send 10 POT to Alice" (or type "/" for commands)...'
            disabled={isLoading}
            className="w-full bg-[#111118] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200 disabled:opacity-50"
            id="chat-input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-30 transition-all duration-200"
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

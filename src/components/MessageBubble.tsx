"use client";

import type { ChatMessage } from "@/lib/types";
import { truncateAddress } from "@/lib/format";

interface MessageBubbleProps {
  message: ChatMessage;
  senderAddress?: string;
  senderName?: string;
}

export function MessageBubble({ message, senderAddress, senderName }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-50"
            : "border border-white/5 bg-white/5 text-slate-300"
        }`}
      >
        {isUser && (
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-cyan-400/60">
            <span>
              You
              {senderAddress && (
                <span className="ml-1 font-normal text-slate-500/80">
                  ({senderName || "Guest"} - {truncateAddress(senderAddress)})
                </span>
              )}
            </span>
          </div>
        )}
        {!isUser && (
          <div className="mb-1 flex items-center gap-2 text-xs text-purple-400/60">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
            <span>Potdo</span>
          </div>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

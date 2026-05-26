"use client";

import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-cyan-500/10 text-cyan-50 border border-cyan-500/20"
            : "bg-white/5 text-slate-300 border border-white/5"
        }`}
      >
        {isUser && (
          <div className="flex items-center gap-2 mb-1 text-xs text-cyan-400/60">
            <span>You</span>
          </div>
        )}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1 text-xs text-purple-400/60">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span>Potdo</span>
          </div>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

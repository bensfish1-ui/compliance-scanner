"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Trash2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { useAIStore } from "@/stores/ai-store";
import { useAIChat } from "@/hooks/use-ai";
import { cn } from "@/lib/utils";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const { messages, isLoading, totalTokensUsed, clearMessages } = useAIStore();
  const chat = useAIChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    chat.mutate(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin space-y-1 pb-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex gap-3 p-4 bg-white/[0.02] rounded-xl">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shrink-0">
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-slate-500 animate-pulse" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-slate-500 animate-pulse" style={{ animationDelay: "200ms" }} />
                <div className="h-2 w-2 rounded-full bg-slate-500 animate-pulse" style={{ animationDelay: "400ms" }} />
              </div>
              <span className="text-xs text-slate-500">AI is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/[0.06] pt-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Tokens used: {totalTokensUsed.toLocaleString()}</span>
          <button onClick={clearMessages} className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors">
            <Trash2 className="h-3 w-3" /> Clear chat
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about regulations, risks, audits, or compliance..."
              rows={2}
              className="resize-none pr-12"
            />
            <button type="button" className="absolute right-3 bottom-3 text-slate-500 hover:text-slate-300 transition-colors">
              <Paperclip className="h-4 w-4" />
            </button>
          </div>
          <Button type="submit" disabled={!input.trim() || isLoading} className="h-[68px] px-6 gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}

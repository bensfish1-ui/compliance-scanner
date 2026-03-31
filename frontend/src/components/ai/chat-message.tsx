"use client";

import ReactMarkdown from "react-markdown";
import { Bot, User, Check, X, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AIMessage } from "@/types";

interface ChatMessageProps {
  message: AIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={cn("flex gap-3 p-4 rounded-xl transition-colors", isAssistant ? "bg-white/[0.02]" : "")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn("text-xs", isAssistant ? "bg-gradient-to-br from-primary-600 to-accent-600" : "bg-navy-700")}>
          {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{isAssistant ? "AI Copilot" : "You"}</span>
          <span className="text-xs text-slate-600">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {message.confidence && (
            <Badge variant={message.confidence >= 0.9 ? "green" : message.confidence >= 0.7 ? "amber" : "red"} className="text-[10px]">
              {Math.round(message.confidence * 100)}% confidence
            </Badge>
          )}
        </div>

        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-code:text-cyan-300 prose-code:bg-navy-700 prose-code:px-1 prose-code:rounded prose-pre:bg-navy-800 prose-pre:border prose-pre:border-white/[0.06] prose-a:text-primary-400 prose-th:text-slate-300 prose-td:text-slate-400 prose-table:border-collapse [&_table]:w-full [&_th]:border [&_th]:border-white/10 [&_th]:p-2 [&_td]:border [&_td]:border-white/10 [&_td]:p-2">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {message.actions.map((action) => (
              <Button
                key={action.id}
                size="sm"
                variant={action.type === "approve" ? "default" : action.type === "reject" ? "destructive" : "outline"}
                className="gap-1 text-xs"
              >
                {action.type === "approve" && <Check className="h-3 w-3" />}
                {action.type === "reject" && <X className="h-3 w-3" />}
                {action.type === "navigate" && <ExternalLink className="h-3 w-3" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="text-xs text-slate-600 pt-1">
            Sources: {message.sources.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

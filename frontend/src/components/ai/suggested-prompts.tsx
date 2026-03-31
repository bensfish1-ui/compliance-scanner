"use client";

import { BookOpen, Shield, ClipboardCheck, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const prompts = [
  { icon: BookOpen, label: "Summarize GDPR requirements", prompt: "Summarize the key GDPR requirements that apply to our organization", color: "text-blue-400" },
  { icon: Shield, label: "Risk assessment overview", prompt: "Give me an overview of our current risk assessment status and top risk areas", color: "text-red-400" },
  { icon: ClipboardCheck, label: "Audit preparation checklist", prompt: "Generate an audit preparation checklist for our upcoming SOC 2 audit", color: "text-emerald-400" },
  { icon: FileText, label: "Draft compliance policy", prompt: "Help me draft a data retention policy that aligns with GDPR and CCPA requirements", color: "text-purple-400" },
  { icon: TrendingUp, label: "Compliance trend analysis", prompt: "Analyze our compliance trends over the past 6 months and identify areas for improvement", color: "text-cyan-400" },
  { icon: AlertTriangle, label: "Gap analysis", prompt: "Perform a gap analysis between our current controls and DORA requirements", color: "text-amber-400" },
];

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-1">Suggested Prompts</p>
      {prompts.map((item) => (
        <button
          key={item.label}
          onClick={() => onSelect(item.prompt)}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-left text-sm bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08] transition-all group"
        >
          <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
          <span className="text-slate-400 group-hover:text-slate-200 transition-colors">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

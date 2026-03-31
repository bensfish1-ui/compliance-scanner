"use client";

import { Zap, GitBranch, Play, Bell, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const nodeTypes = [
  { type: "trigger", label: "Trigger", icon: Zap, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { type: "condition", label: "Condition", icon: GitBranch, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { type: "action", label: "Action", icon: Play, color: "text-primary-400 bg-primary-500/10 border-primary-500/20" },
  { type: "notification", label: "Notification", icon: Bell, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { type: "delay", label: "Delay", icon: Clock, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
];

interface NodePaletteProps {
  onDragStart?: (type: string) => void;
}

export function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-1">Node Types</p>
      {nodeTypes.map((node) => (
        <div
          key={node.type}
          draggable
          onDragStart={() => onDragStart?.(node.type)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-colors hover:opacity-80",
            node.color
          )}
        >
          <node.icon className="h-4 w-4" />
          <span className="text-sm font-medium">{node.label}</span>
        </div>
      ))}
    </div>
  );
}

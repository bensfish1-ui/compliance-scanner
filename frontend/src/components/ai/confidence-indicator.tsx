"use client";

import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  score: number;
  size?: "sm" | "md";
}

export function ConfidenceIndicator({ score, size = "sm" }: ConfidenceIndicatorProps) {
  const percentage = Math.round(score * 100);
  const color = percentage >= 90 ? "text-emerald-400" : percentage >= 70 ? "text-amber-400" : "text-red-400";
  const bgColor = percentage >= 90 ? "bg-emerald-500" : percentage >= 70 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className={cn("flex items-center gap-2", size === "sm" ? "text-xs" : "text-sm")}>
      <div className={cn("h-1.5 w-12 rounded-full bg-navy-700", size === "md" && "w-20")}>
        <div className={cn("h-full rounded-full transition-all", bgColor)} style={{ width: `${percentage}%` }} />
      </div>
      <span className={cn("font-medium", color)}>{percentage}%</span>
    </div>
  );
}

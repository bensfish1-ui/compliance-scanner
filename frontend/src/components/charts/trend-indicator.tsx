"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
  value: number;
  label?: string;
  className?: string;
  inverted?: boolean;
}

export function TrendIndicator({ value, label, className, inverted = false }: TrendIndicatorProps) {
  const isPositive = inverted ? value < 0 : value > 0;
  const isNegative = inverted ? value > 0 : value < 0;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {value > 0 ? (
        <TrendingUp className={cn("h-3.5 w-3.5", isPositive ? "text-emerald-400" : "text-red-400")} />
      ) : value < 0 ? (
        <TrendingDown className={cn("h-3.5 w-3.5", isNegative ? "text-red-400" : "text-emerald-400")} />
      ) : (
        <Minus className="h-3.5 w-3.5 text-slate-400" />
      )}
      <span className={cn("text-xs font-medium", isPositive ? "text-emerald-400" : isNegative ? "text-red-400" : "text-slate-400")}>
        {value > 0 ? "+" : ""}{value}%
      </span>
      {label && <span className="text-xs text-slate-500">{label}</span>}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

interface GaugeChartProps {
  value: number;
  max?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GaugeChart({ value, max = 100, label, size = "md", className }: GaugeChartProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const rotation = (percentage / 100) * 180;

  const getColor = () => {
    if (percentage >= 80) return "#10b981";
    if (percentage >= 60) return "#f59e0b";
    if (percentage >= 40) return "#f97316";
    return "#ef4444";
  };

  const sizes = {
    sm: { width: 120, height: 60, stroke: 8 },
    md: { width: 180, height: 90, stroke: 12 },
    lg: { width: 240, height: 120, stroke: 16 },
  };

  const s = sizes[size];
  const radius = (s.width - s.stroke) / 2;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: s.width, height: s.height + 20 }}>
        <svg width={s.width} height={s.height + 10} viewBox={`0 0 ${s.width} ${s.height + 10}`}>
          {/* Background arc */}
          <path
            d={`M ${s.stroke / 2} ${s.height + 5} A ${radius} ${radius} 0 0 1 ${s.width - s.stroke / 2} ${s.height + 5}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={s.stroke}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={`M ${s.stroke / 2} ${s.height + 5} A ${radius} ${radius} 0 0 1 ${s.width - s.stroke / 2} ${s.height + 5}`}
            fill="none"
            stroke={getColor()}
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className={cn("font-bold text-white", size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-xl")}>
            {Math.round(value)}
            <span className="text-sm text-slate-400">%</span>
          </span>
        </div>
      </div>
      {label && <p className="mt-1 text-sm text-slate-400">{label}</p>}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

interface GanttBarProps {
  label: string;
  startPercent: number;
  widthPercent: number;
  color?: string;
  progress?: number;
  className?: string;
}

export function GanttBar({ label, startPercent, widthPercent, color = "bg-primary-500", progress, className }: GanttBarProps) {
  return (
    <div className="relative h-8 w-full" title={label}>
      <div
        className={cn("absolute top-1 h-6 rounded-md transition-all", color, "opacity-80 hover:opacity-100", className)}
        style={{ left: `${startPercent}%`, width: `${widthPercent}%`, minWidth: "4px" }}
      >
        {progress !== undefined && (
          <div
            className="absolute inset-0 rounded-md bg-white/20"
            style={{ width: `${progress}%` }}
          />
        )}
        <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium text-white truncate">
          {label}
        </span>
      </div>
    </div>
  );
}

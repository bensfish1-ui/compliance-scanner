"use client";

import { cn } from "@/lib/utils";

interface GanttTimelineProps {
  months: string[];
  className?: string;
}

export function GanttTimeline({ months, className }: GanttTimelineProps) {
  return (
    <div className={cn("flex border-b border-white/[0.06]", className)}>
      {months.map((month) => (
        <div key={month} className="flex-1 text-center text-xs text-slate-500 py-2 border-r border-white/[0.04] last:border-r-0">
          {month}
        </div>
      ))}
    </div>
  );
}

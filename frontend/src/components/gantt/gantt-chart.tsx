"use client";

import { GanttBar } from "./gantt-bar";
import { GanttTimeline } from "./gantt-timeline";
import { cn } from "@/lib/utils";

interface GanttItem {
  id: string;
  label: string;
  startMonth: number; // 0-indexed month offset
  duration: number; // in months
  progress?: number;
  color?: string;
}

interface GanttChartProps {
  items: GanttItem[];
  months: string[];
  className?: string;
}

export function GanttChart({ items, months, className }: GanttChartProps) {
  const totalMonths = months.length;

  return (
    <div className={cn("rounded-xl border border-white/[0.06] overflow-hidden", className)}>
      <div className="flex">
        {/* Labels Column */}
        <div className="w-48 shrink-0 border-r border-white/[0.06]">
          <div className="h-[33px] border-b border-white/[0.06] px-3 flex items-center">
            <span className="text-xs font-medium text-slate-500">Task</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="h-8 px-3 flex items-center border-b border-white/[0.04] last:border-b-0">
              <span className="text-xs text-slate-300 truncate">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Chart Area */}
        <div className="flex-1 min-w-0">
          <GanttTimeline months={months} />
          <div className="relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {months.map((_, i) => (
                <div key={i} className="flex-1 border-r border-white/[0.03] last:border-r-0" />
              ))}
            </div>

            {/* Bars */}
            {items.map((item) => (
              <div key={item.id} className="border-b border-white/[0.04] last:border-b-0">
                <GanttBar
                  label=""
                  startPercent={(item.startMonth / totalMonths) * 100}
                  widthPercent={(item.duration / totalMonths) * 100}
                  color={item.color || "bg-primary-500"}
                  progress={item.progress}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

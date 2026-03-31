"use client";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapCell {
  x: number;
  y: number;
  value: number;
  label?: string;
}

interface HeatmapProps {
  data: HeatmapCell[];
  xLabels: string[];
  yLabels: string[];
  xTitle?: string;
  yTitle?: string;
  className?: string;
}

function getCellColor(value: number): string {
  if (value >= 20) return "bg-red-600/80";
  if (value >= 15) return "bg-red-500/60";
  if (value >= 10) return "bg-orange-500/60";
  if (value >= 5) return "bg-amber-500/50";
  if (value >= 3) return "bg-yellow-500/40";
  if (value >= 1) return "bg-emerald-500/30";
  return "bg-emerald-600/20";
}

export function Heatmap({ data, xLabels, yLabels, xTitle, yTitle, className }: HeatmapProps) {
  const getCell = (x: number, y: number) => data.find((d) => d.x === x && d.y === y);

  return (
    <TooltipProvider>
      <div className={cn("flex gap-4", className)}>
        {/* Y-axis title */}
        {yTitle && (
          <div className="flex items-center">
            <span className="text-xs text-slate-500 -rotate-90 whitespace-nowrap">{yTitle}</span>
          </div>
        )}

        <div className="flex-1">
          {/* Grid */}
          <div className="flex gap-1">
            {/* Y-axis labels */}
            <div className="flex flex-col gap-1 justify-end pr-2">
              {yLabels.map((label, i) => (
                <div key={i} className="h-10 flex items-center justify-end">
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="flex-1">
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${xLabels.length}, 1fr)` }}>
                {yLabels.map((_, yi) =>
                  xLabels.map((_, xi) => {
                    const cell = getCell(xi, yLabels.length - 1 - yi);
                    const value = cell?.value || 0;
                    return (
                      <Tooltip key={`${xi}-${yi}`}>
                        <TooltipTrigger>
                          <div
                            className={cn(
                              "h-10 rounded-md transition-all hover:ring-1 hover:ring-white/20 flex items-center justify-center",
                              getCellColor(value)
                            )}
                          >
                            <span className="text-xs font-medium text-white/80">{value || ""}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{cell?.label || `Risk Score: ${value}`}</p>
                          <p className="text-xs text-slate-400">
                            Impact: {xLabels[xi]}, Likelihood: {yLabels[yLabels.length - 1 - yi]}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })
                )}
              </div>

              {/* X-axis labels */}
              <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: `repeat(${xLabels.length}, 1fr)` }}>
                {xLabels.map((label, i) => (
                  <div key={i} className="text-center">
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                ))}
              </div>

              {/* X-axis title */}
              {xTitle && (
                <div className="text-center mt-2">
                  <span className="text-xs text-slate-500">{xTitle}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

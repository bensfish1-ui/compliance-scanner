"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface BarChartProps {
  data: Record<string, any>[];
  xKey: string;
  yKey: string;
  color?: string;
  colors?: string[];
  className?: string;
  height?: number;
  horizontal?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card rounded-lg p-3 text-sm border border-white/10">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-medium">{payload[0]?.value}</p>
    </div>
  );
};

export function BarChartComponent({
  data,
  xKey,
  yKey,
  color = "#4f46e5",
  colors,
  className,
  height = 300,
  horizontal = false,
}: BarChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          {horizontal ? (
            <>
              <XAxis type="number" stroke="rgba(148,163,184,0.3)" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey={xKey} stroke="rgba(148,163,184,0.3)" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} width={100} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} stroke="rgba(148,163,184,0.3)" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(148,163,184,0.3)" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} />
            </>
          )}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
          <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors ? colors[index % colors.length] : color}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

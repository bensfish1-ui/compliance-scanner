"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface LineChartProps {
  data: Record<string, any>[];
  xKey: string;
  yKeys: { key: string; color: string; label: string }[];
  className?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card rounded-lg p-3 text-sm border border-white/10">
      <p className="text-slate-400 text-xs mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="text-white font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function LineChartComponent({ data, xKey, yKeys, className, height = 300 }: LineChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey={xKey} stroke="rgba(148,163,184,0.3)" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(148,163,184,0.3)" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "12px" }} />
          {yKeys.map((item) => (
            <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

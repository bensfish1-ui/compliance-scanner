"use client";

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";

interface PieChartProps {
  data: { name: string; value: number; color: string }[];
  className?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card rounded-lg p-3 text-sm border border-white/10">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0]?.payload?.color }} />
        <span className="text-slate-300">{payload[0]?.name}:</span>
        <span className="text-white font-medium">{payload[0]?.value}</span>
      </div>
    </div>
  );
};

export function PieChartComponent({ data, className, height = 300, innerRadius = 60, outerRadius = 100 }: PieChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={2} dataKey="value" stroke="none">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "12px" }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

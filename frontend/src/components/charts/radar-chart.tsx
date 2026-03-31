"use client";

import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

interface RadarChartProps {
  data: { subject: string; value: number; fullMark?: number }[];
  className?: string;
  height?: number;
  color?: string;
}

export function RadarChartComponent({ data, className, height = 300, color = "#4f46e5" }: RadarChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <PolarRadiusAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
          <Radar name="Score" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} />
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#f1f5f9",
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}

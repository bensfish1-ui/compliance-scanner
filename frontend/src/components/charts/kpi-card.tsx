"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface KPICardProps {
  title: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  sparklineData?: number[];
  color?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  trend,
  trendLabel,
  sparklineData,
  color = "#4f46e5",
  className,
}: KPICardProps) {
  const sparkData = sparklineData?.map((v, i) => ({ value: v, index: i })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card rounded-xl p-4 transition-all duration-300 hover:border-white/10",
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs", trend >= 0 ? "text-emerald-400" : "text-red-400")}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-xl font-bold text-white mb-1">{value}</p>
      {trendLabel && <p className="text-xs text-slate-500">{trendLabel}</p>}
      {sparkData.length > 0 && (
        <div className="mt-3 -mx-1">
          <ResponsiveContainer width="100%" height={40}>
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id={`sparkline-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#sparkline-${title})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

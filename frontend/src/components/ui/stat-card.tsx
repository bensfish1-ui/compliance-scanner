"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  className?: string;
  format?: "number" | "currency" | "percentage";
}

function AnimatedNumber({ value, format }: { value: number; format?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (format === "currency") return `$${Math.round(v).toLocaleString()}`;
    if (format === "percentage") return `${Math.round(v)}%`;
    return Math.round(v).toLocaleString();
  });

  React.useEffect(() => {
    const animation = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return animation.stop;
  }, [count, value]);

  return <motion.span>{rounded}</motion.span>;
}

export function StatCard({
  title,
  value,
  prefix,
  suffix,
  trend,
  trendLabel,
  icon,
  className,
  format = "number",
}: StatCardProps) {
  const trendColor =
    trend === undefined
      ? "text-slate-400"
      : trend > 0
      ? "text-emerald-400"
      : trend < 0
      ? "text-red-400"
      : "text-slate-400";

  const TrendIcon =
    trend === undefined
      ? Minus
      : trend > 0
      ? TrendingUp
      : trend < 0
      ? TrendingDown
      : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "glass-card rounded-xl p-6 transition-all duration-300 hover:border-white/10",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-2xl font-bold text-white">{prefix}</span>}
            <span className="text-3xl font-bold text-white">
              <AnimatedNumber value={value} format={format} />
            </span>
            {suffix && <span className="text-lg text-slate-400">{suffix}</span>}
          </div>
          {trend !== undefined && (
            <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(trend)}%</span>
              {trendLabel && <span className="text-slate-500">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className="rounded-lg bg-primary-600/10 p-3 text-primary-400">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

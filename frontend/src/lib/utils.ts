import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt: string = "MMM dd, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function calculateRiskScore(likelihood: number, impact: number): number {
  return Math.round((likelihood * impact) / 25 * 100);
}

export function getRagColor(status: "red" | "amber" | "green"): string {
  const colors = {
    red: "bg-danger-500 text-white",
    amber: "bg-warning-500 text-black",
    green: "bg-success-500 text-white",
  };
  return colors[status];
}

export function getRagDotColor(status: "red" | "amber" | "green"): string {
  const colors = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    green: "bg-emerald-500",
  };
  return colors[status];
}

export function getImpactColor(level: string): string {
  const colors: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    minimal: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  return colors[level] || colors.minimal;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "in-progress": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    "on-hold": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    draft: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    effective: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    enacted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    proposed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "under-review": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    repealed: "bg-red-500/20 text-red-400 border-red-500/30",
    amended: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    planning: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    open: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    closed: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    planned: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    fieldwork: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    reporting: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };
  return colors[status] || "bg-slate-500/20 text-slate-400 border-slate-500/30";
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400",
    high: "bg-orange-500/20 text-orange-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-blue-500/20 text-blue-400",
  };
  return colors[priority] || colors.medium;
}

export function isOverdue(date: string): boolean {
  return isBefore(parseISO(date), new Date());
}

export function isDueSoon(date: string, days: number = 7): boolean {
  const dueDate = parseISO(date);
  const now = new Date();
  const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return isAfter(dueDate, now) && isBefore(dueDate, threshold);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

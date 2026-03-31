import { cn, getStatusColor, getRagDotColor } from "@/lib/utils";
import { Badge } from "./badge";
import type { RAGStatus } from "@/types";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={cn(getStatusColor(status), "capitalize", className)}>
      {status.replace(/-/g, " ")}
    </Badge>
  );
}

interface RAGBadgeProps {
  status: RAGStatus;
  label?: string;
  className?: string;
}

export function RAGBadge({ status, label, className }: RAGBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("h-2.5 w-2.5 rounded-full", getRagDotColor(status))} />
      <span className="text-sm text-slate-300 capitalize">
        {label || status}
      </span>
    </div>
  );
}

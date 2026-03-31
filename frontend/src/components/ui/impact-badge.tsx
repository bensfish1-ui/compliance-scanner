import { cn, getImpactColor } from "@/lib/utils";
import { Badge } from "./badge";
import { AlertTriangle, AlertCircle, Info, Minus, Shield } from "lucide-react";

interface ImpactBadgeProps {
  level: string;
  className?: string;
}

const impactIcons: Record<string, React.ReactNode> = {
  critical: <AlertTriangle className="h-3 w-3" />,
  high: <AlertCircle className="h-3 w-3" />,
  medium: <Info className="h-3 w-3" />,
  low: <Shield className="h-3 w-3" />,
  minimal: <Minus className="h-3 w-3" />,
};

export function ImpactBadge({ level, className }: ImpactBadgeProps) {
  return (
    <Badge className={cn(getImpactColor(level), "capitalize gap-1", className)}>
      {impactIcons[level]}
      {level}
    </Badge>
  );
}

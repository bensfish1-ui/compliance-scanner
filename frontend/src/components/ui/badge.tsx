import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary-500/30 bg-primary-500/20 text-primary-300",
        secondary:
          "border-slate-500/30 bg-slate-500/20 text-slate-300",
        destructive:
          "border-red-500/30 bg-red-500/20 text-red-300",
        success:
          "border-emerald-500/30 bg-emerald-500/20 text-emerald-300",
        warning:
          "border-amber-500/30 bg-amber-500/20 text-amber-300",
        info:
          "border-cyan-500/30 bg-cyan-500/20 text-cyan-300",
        outline:
          "border-white/10 text-slate-300",
        critical:
          "border-red-500/30 bg-red-500/20 text-red-300",
        high:
          "border-orange-500/30 bg-orange-500/20 text-orange-300",
        medium:
          "border-yellow-500/30 bg-yellow-500/20 text-yellow-300",
        low:
          "border-blue-500/30 bg-blue-500/20 text-blue-300",
        minimal:
          "border-slate-500/30 bg-slate-500/20 text-slate-400",
        red:
          "border-red-500/30 bg-red-500/20 text-red-300",
        amber:
          "border-amber-500/30 bg-amber-500/20 text-amber-300",
        green:
          "border-emerald-500/30 bg-emerald-500/20 text-emerald-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

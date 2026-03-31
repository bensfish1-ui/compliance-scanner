"use client";

import { Handle, Position } from "@xyflow/react";
import { GitBranch } from "lucide-react";

export function ConditionNode({ data }: { data: { label: string } }) {
  return (
    <div className="glass-card rounded-xl p-4 min-w-[180px] border-amber-500/20">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-6 w-6 rounded-md bg-amber-500/20 flex items-center justify-center">
          <GitBranch className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <span className="text-xs font-medium text-amber-400 uppercase">Condition</span>
      </div>
      <p className="text-sm font-medium text-white">{data.label}</p>
      <Handle type="target" position={Position.Top} className="!bg-amber-500 !border-amber-600 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} id="yes" style={{ left: "30%" }} className="!bg-emerald-500 !border-emerald-600 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} id="no" style={{ left: "70%" }} className="!bg-red-500 !border-red-600 !w-3 !h-3" />
    </div>
  );
}

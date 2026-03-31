"use client";

import { Handle, Position } from "@xyflow/react";
import { Zap } from "lucide-react";

export function TriggerNode({ data }: { data: { label: string } }) {
  return (
    <div className="glass-card rounded-xl p-4 min-w-[180px] border-emerald-500/20">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-6 w-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
          <Zap className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <span className="text-xs font-medium text-emerald-400 uppercase">Trigger</span>
      </div>
      <p className="text-sm font-medium text-white">{data.label}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !border-emerald-600 !w-3 !h-3" />
    </div>
  );
}

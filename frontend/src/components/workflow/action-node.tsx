"use client";

import { Handle, Position } from "@xyflow/react";
import { Play } from "lucide-react";

export function ActionNode({ data }: { data: { label: string } }) {
  return (
    <div className="glass-card rounded-xl p-4 min-w-[180px] border-primary-500/20">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-6 w-6 rounded-md bg-primary-500/20 flex items-center justify-center">
          <Play className="h-3.5 w-3.5 text-primary-400" />
        </div>
        <span className="text-xs font-medium text-primary-400 uppercase">Action</span>
      </div>
      <p className="text-sm font-medium text-white">{data.label}</p>
      <Handle type="target" position={Position.Top} className="!bg-primary-500 !border-primary-600 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-primary-500 !border-primary-600 !w-3 !h-3" />
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TriggerNode } from "./trigger-node";
import { ConditionNode } from "./condition-node";
import { ActionNode } from "./action-node";

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
};

const initialNodes: Node[] = [
  { id: "1", type: "trigger", position: { x: 250, y: 50 }, data: { label: "Regulation Published" } },
  { id: "2", type: "condition", position: { x: 250, y: 200 }, data: { label: "Impact Level >= High?" } },
  { id: "3", type: "action", position: { x: 100, y: 350 }, data: { label: "Create Assessment Project" } },
  { id: "4", type: "action", position: { x: 400, y: 350 }, data: { label: "Add to Watch List" } },
  { id: "5", type: "action", position: { x: 100, y: 500 }, data: { label: "Notify Compliance Team" } },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#6366f1" } },
  { id: "e2-3", source: "2", sourceHandle: "yes", target: "3", label: "Yes", style: { stroke: "#10b981" }, labelStyle: { fill: "#10b981" } },
  { id: "e2-4", source: "2", sourceHandle: "no", target: "4", label: "No", style: { stroke: "#ef4444" }, labelStyle: { fill: "#ef4444" } },
  { id: "e3-5", source: "3", target: "5", style: { stroke: "#6366f1" } },
];

export function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#6366f1" } }, eds)),
    [setEdges]
  );

  return (
    <div className="h-[600px] rounded-xl overflow-hidden border border-white/[0.06]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          style={{ background: "#111827" }}
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.03)" />
      </ReactFlow>
    </div>
  );
}

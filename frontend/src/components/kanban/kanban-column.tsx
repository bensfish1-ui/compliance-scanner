"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
}

export function KanbanColumn({ id, title, tasks, color }: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={cn("h-2.5 w-2.5 rounded-full", color)} />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <span className="text-xs text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button className="text-slate-500 hover:text-white transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 min-h-[200px] rounded-xl p-2 transition-colors",
              snapshot.isDraggingOver ? "bg-primary-600/5 border border-primary-500/20" : "bg-white/[0.01]"
            )}
          >
            {tasks.map((task, index) => (
              <KanbanCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

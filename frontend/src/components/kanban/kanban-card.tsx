"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Calendar, Tag } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, getPriorityColor } from "@/lib/utils";
import type { Task } from "@/types";

interface KanbanCardProps {
  task: Task;
  index: number;
}

export function KanbanCard({ task, index }: KanbanCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "glass-card rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing transition-all",
            snapshot.isDragging && "shadow-glow opacity-90 rotate-1"
          )}
        >
          <p className="text-sm font-medium text-white mb-2">{task.title}</p>

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {task.assignee && (
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[8px]">
                    {task.assignee.firstName[0]}{task.assignee.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              <Badge className={cn(getPriorityColor(task.priority), "text-[10px] px-1.5 py-0 capitalize")}>
                {task.priority}
              </Badge>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Calendar className="h-3 w-3" />
                {formatDate(task.dueDate, "MMM dd")}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

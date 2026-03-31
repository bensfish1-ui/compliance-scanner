"use client";

import { useState, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";
import type { Task, TaskStatus } from "@/types";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove?: (taskId: string, newStatus: TaskStatus) => void;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "bg-slate-500" },
  { id: "in-progress", title: "In Progress", color: "bg-cyan-500" },
  { id: "in-review", title: "In Review", color: "bg-purple-500" },
  { id: "blocked", title: "Blocked", color: "bg-red-500" },
  { id: "done", title: "Done", color: "bg-emerald-500" },
];

export function KanbanBoard({ tasks: initialTasks, onTaskMove }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);

  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as TaskStatus;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === draggableId ? { ...task, status: newStatus } : task
      )
    );
    onTaskMove?.(draggableId, newStatus);
  }, [onTaskMove]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            tasks={tasks.filter((t) => t.status === column.id)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Filter, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject, useProjectTasks } from "@/hooks/use-projects";

export default function KanbanPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: project } = useProject(id);
  const { data: tasks, isLoading } = useProjectTasks(id);

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div>;
  }

  return (
    <div>
      <div className="mb-4">
        <Link href={`/projects/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to {project?.name || "Project"}
        </Link>
      </div>

      <PageHeader
        title="Kanban Board"
        description={project?.name}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-3.5 w-3.5" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Users className="h-3.5 w-3.5" /> Assignees
            </Button>
          </div>
        }
      />

      <KanbanBoard tasks={tasks || []} />
    </div>
  );
}

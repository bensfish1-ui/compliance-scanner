"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, KanbanSquare, BarChart3, Users, Calendar, FileText, Activity } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, RAGBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { GaugeChart } from "@/components/charts/gauge-chart";
import { useProject, useProjectTasks } from "@/hooks/use-projects";
import { formatDate, formatCurrency, cn, getRagDotColor, getPriorityColor } from "@/lib/utils";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: project, isLoading } = useProject(id);
  const { data: tasks } = useProjectTasks(id);

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /></div>;
  }
  if (!project) {
    return <div className="text-center text-slate-400 py-20">Project not found</div>;
  }

  const tasksByStatus = {
    todo: (tasks || []).filter((t) => t.status === "todo").length,
    "in-progress": (tasks || []).filter((t) => t.status === "in-progress").length,
    "in-review": (tasks || []).filter((t) => t.status === "in-review").length,
    blocked: (tasks || []).filter((t) => t.status === "blocked").length,
    done: (tasks || []).filter((t) => t.status === "done").length,
  };

  const budgetData = [
    { month: "Jan", planned: 50000, actual: 45000 },
    { month: "Feb", planned: 100000, actual: 98000 },
    { month: "Mar", planned: 160000, actual: 175000 },
    { month: "Apr", planned: 220000, actual: 0 },
    { month: "May", planned: 300000, actual: 0 },
    { month: "Jun", planned: 380000, actual: 0 },
  ];

  return (
    <div>
      <div className="mb-6">
        <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header Card */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                <div className={cn("h-3 w-3 rounded-full", getRagDotColor(project.ragStatus))} />
              </div>
              <p className="text-sm text-slate-400 max-w-2xl">{project.description}</p>
              <div className="flex items-center gap-3">
                <StatusBadge status={project.status} />
                <Badge variant={project.priority === "critical" ? "critical" : "high"} className="capitalize">{project.priority}</Badge>
                <RAGBadge status={project.ragStatus} />
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/projects/${id}/kanban`}>
                <Button variant="outline" className="gap-1">
                  <KanbanSquare className="h-4 w-4" /> Kanban Board
                </Button>
              </Link>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-slate-500">Progress</p>
              <div className="mt-1">
                <Progress value={project.progress} className="h-2" />
                <p className="text-sm font-medium text-white mt-1">{project.progress}%</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">Owner</p>
              <p className="text-sm font-medium text-white mt-1">{project.owner.firstName} {project.owner.lastName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Timeline</p>
              <p className="text-sm font-medium text-white mt-1">{formatDate(project.startDate, "MMM dd")} - {formatDate(project.endDate, "MMM dd, yyyy")}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Budget</p>
              <p className="text-sm font-medium text-white mt-1">{formatCurrency(project.spent || 0)} / {formatCurrency(project.budget || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Tasks</p>
              <p className="text-sm font-medium text-white mt-1">{tasks?.length || 0} total</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({tasks?.length || 0})</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card glass className="lg:col-span-2">
                <CardHeader><CardTitle>Task Distribution</CardTitle></CardHeader>
                <CardContent>
                  <BarChartComponent
                    data={Object.entries(tasksByStatus).map(([status, count]) => ({ status: status.replace(/-/g, " "), count }))}
                    xKey="status"
                    yKey="count"
                    colors={["#64748b", "#06b6d4", "#a78bfa", "#ef4444", "#10b981"]}
                    height={250}
                  />
                </CardContent>
              </Card>
              <Card glass>
                <CardHeader><CardTitle>Completion</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  <GaugeChart value={project.progress} size="lg" label="Overall Progress" />
                  <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                    <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                      <p className="text-lg font-bold text-emerald-400">{tasksByStatus.done}</p>
                      <p className="text-xs text-slate-500">Completed</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                      <p className="text-lg font-bold text-amber-400">{tasksByStatus["in-progress"]}</p>
                      <p className="text-xs text-slate-500">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="space-y-3">
              {(tasks || []).map((task) => (
                <Card glass key={task.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn("h-2 w-2 rounded-full shrink-0", task.status === "done" ? "bg-emerald-500" : task.status === "blocked" ? "bg-red-500" : task.status === "in-progress" ? "bg-cyan-500" : "bg-slate-500")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{task.title}</p>
                      {task.description && <p className="text-xs text-slate-500 truncate">{task.description}</p>}
                    </div>
                    {task.assignee && (
                      <span className="text-xs text-slate-400">{task.assignee.firstName} {task.assignee.lastName[0]}.</span>
                    )}
                    <Badge className={cn(getPriorityColor(task.priority), "capitalize text-xs")}>{task.priority}</Badge>
                    <StatusBadge status={task.status} />
                    {task.dueDate && <span className="text-xs text-slate-500">{formatDate(task.dueDate, "MMM dd")}</span>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="budget">
            <Card glass>
              <CardHeader><CardTitle>Budget Tracking</CardTitle></CardHeader>
              <CardContent>
                <AreaChartComponent
                  data={budgetData}
                  xKey="month"
                  yKeys={[
                    { key: "planned", color: "#6366f1", label: "Planned" },
                    { key: "actual", color: "#10b981", label: "Actual" },
                  ]}
                  height={300}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones">
            <div className="space-y-4">
              {project.milestones.map((milestone) => (
                <Card glass key={milestone.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      milestone.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                      milestone.status === "overdue" ? "bg-red-500/20 text-red-400" :
                      "bg-slate-500/20 text-slate-400"
                    )}>
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{milestone.title}</p>
                      <p className="text-xs text-slate-500">Due: {formatDate(milestone.dueDate)}</p>
                    </div>
                    <StatusBadge status={milestone.status} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card glass>
              <CardContent className="p-6">
                <p className="text-sm text-slate-400">Activity timeline for this project.</p>
                <div className="mt-4 space-y-4">
                  {[
                    { text: "Task 'Implement consent management platform' moved to In Progress", date: "2 hours ago" },
                    { text: "Milestone 'DPA Updates Complete' marked as completed", date: "2 days ago" },
                    { text: "New task added: Cross-border transfer mechanism review", date: "3 days ago" },
                    { text: "RAG status changed from Green to Amber", date: "1 week ago" },
                  ].map((entry, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-white/[0.02]">
                      <Activity className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-slate-300">{entry.text}</p>
                        <p className="text-xs text-slate-600">{entry.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

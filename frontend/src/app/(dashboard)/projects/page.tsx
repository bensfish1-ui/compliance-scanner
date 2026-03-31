"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, LayoutGrid, List, FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, RAGBadge } from "@/components/ui/status-badge";
import { useProjects } from "@/hooks/use-projects";
import { formatDate, formatCurrency, cn, getRagDotColor } from "@/lib/utils";

export default function ProjectsPage() {
  const [view, setView] = useState<"card" | "table">("card");
  const { data, isLoading } = useProjects();

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage compliance projects and implementation programs"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-white/10 rounded-lg p-0.5">
              <button onClick={() => setView("card")} className={cn("p-1.5 rounded-md transition-colors", view === "card" ? "bg-primary-600/20 text-primary-300" : "text-slate-400 hover:text-white")}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setView("table")} className={cn("p-1.5 rounded-md transition-colors", view === "table" ? "bg-primary-600/20 text-primary-300" : "text-slate-400 hover:text-white")}>
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        }
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data?.data ?? []).map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={`/projects/${project.id}`}>
              <Card glass className="h-full hover:border-white/10 transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base group-hover:text-primary-300 transition-colors">{project.name}</CardTitle>
                      <p className="text-xs text-slate-500 line-clamp-2">{project.description}</p>
                    </div>
                    <div className={cn("h-3 w-3 rounded-full shrink-0 mt-1", getRagDotColor(project.ragStatus))} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={project.status} />
                    <Badge variant={project.priority === "critical" ? "critical" : project.priority === "high" ? "high" : "medium"} className="capitalize text-xs">
                      {project.priority}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-white font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>

                  {project.budget && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Budget</span>
                      <span className="text-slate-300">{formatCurrency(project.spent || 0)} / {formatCurrency(project.budget)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs pt-2 border-t border-white/[0.04]">
                    <span className="text-slate-500">{formatDate(project.startDate, "MMM dd")} - {formatDate(project.endDate, "MMM dd, yyyy")}</span>
                    <span className="text-slate-500">{project.owner.firstName} {project.owner.lastName[0]}.</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

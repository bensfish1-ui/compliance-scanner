"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Workflow, Play, Pause, MoreHorizontal, Zap } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";

const workflows = [
  { id: "1", name: "New Regulation Alert", description: "Triggered when a new regulation is published. Creates assessment project and notifies team.", status: "active", trigger: "Event: Regulation Published", lastRun: "2 hours ago", runs: 47 },
  { id: "2", name: "Audit Finding Escalation", description: "Escalates critical findings to management and creates CAPA items automatically.", status: "active", trigger: "Event: Finding Created", lastRun: "1 day ago", runs: 12 },
  { id: "3", name: "Compliance Deadline Reminder", description: "Sends reminders at 30, 14, and 7 days before compliance deadlines.", status: "active", trigger: "Schedule: Daily", lastRun: "6 hours ago", runs: 156 },
  { id: "4", name: "Risk Score Alert", description: "Notifies risk owners when risk scores exceed defined thresholds.", status: "inactive", trigger: "Event: Risk Updated", lastRun: "2 weeks ago", runs: 8 },
  { id: "5", name: "Monthly Compliance Report", description: "Generates and distributes monthly compliance summary report.", status: "active", trigger: "Schedule: Monthly", lastRun: "5 days ago", runs: 11 },
];

export default function WorkflowsPage() {
  return (
    <div>
      <PageHeader
        title="Workflows"
        description="Automate compliance processes with visual workflow builder"
        actions={
          <Link href="/workflows/builder">
            <Button className="gap-2"><Plus className="h-4 w-4" /> Create Workflow</Button>
          </Link>
        }
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {workflows.map((workflow, i) => (
          <motion.div key={workflow.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card glass className="hover:border-white/10 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                      <Workflow className="h-5 w-5 text-primary-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-white">{workflow.name}</h3>
                        <Badge variant={workflow.status === "active" ? "green" : "secondary"} className="text-[10px] capitalize">
                          {workflow.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{workflow.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Zap className="h-3 w-3" />
                        {workflow.trigger}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">Last run: {workflow.lastRun} ({workflow.runs} total)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon-sm">
                        {workflow.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Link href="/workflows/builder">
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

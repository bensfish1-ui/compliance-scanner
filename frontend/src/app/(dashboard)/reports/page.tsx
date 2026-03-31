"use client";

import { motion } from "framer-motion";
import { FileBarChart, Download, Clock, FileText, BarChart3, Shield, ClipboardCheck, PieChart } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const reportTemplates = [
  { id: "1", name: "Executive Compliance Summary", description: "Board-ready overview of compliance posture, risks, and key metrics", icon: BarChart3, color: "text-primary-400 bg-primary-500/10", format: "PDF / PowerPoint" },
  { id: "2", name: "Regulatory Landscape Report", description: "Comprehensive analysis of applicable regulations and their status", icon: FileText, color: "text-cyan-400 bg-cyan-500/10", format: "PDF" },
  { id: "3", name: "Risk Assessment Report", description: "Detailed risk register with heatmap, trends, and mitigation status", icon: Shield, color: "text-red-400 bg-red-500/10", format: "PDF / Excel" },
  { id: "4", name: "Audit Status Report", description: "Summary of all audits, findings, and remediation progress", icon: ClipboardCheck, color: "text-amber-400 bg-amber-500/10", format: "PDF" },
  { id: "5", name: "Compliance Metrics Dashboard", description: "KPI tracking with trend analysis and benchmarking", icon: PieChart, color: "text-emerald-400 bg-emerald-500/10", format: "PDF / Excel" },
  { id: "6", name: "Custom Report", description: "Build a custom report with selected data points and visualizations", icon: FileBarChart, color: "text-purple-400 bg-purple-500/10", format: "Any" },
];

const recentReports = [
  { id: "r1", name: "Executive Summary - Q1 2026", type: "compliance", status: "ready", generatedAt: "Mar 28, 2026", format: "PDF" },
  { id: "r2", name: "Risk Assessment - March 2026", type: "risk", status: "ready", generatedAt: "Mar 25, 2026", format: "Excel" },
  { id: "r3", name: "GDPR Audit Report", type: "audit", status: "ready", generatedAt: "Mar 20, 2026", format: "PDF" },
  { id: "r4", name: "Monthly Compliance Metrics", type: "compliance", status: "generating", generatedAt: "Generating...", format: "PDF" },
];

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate compliance reports and executive summaries"
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        {/* Report Templates */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((template, i) => (
              <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card glass className="hover:border-white/10 transition-all cursor-pointer h-full group">
                  <CardContent className="p-5">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center mb-3", template.color)}>
                      <template.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">{template.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-slate-600">{template.format}</span>
                      <Button size="sm" variant="outline" className="text-xs h-7">Generate</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Reports</h2>
          <Card glass>
            <CardContent className="p-0">
              <div className="divide-y divide-white/[0.04]">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <FileBarChart className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{report.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] capitalize">{report.type}</Badge>
                          <span className="text-xs text-slate-500">{report.generatedAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.status === "generating" ? (
                        <Badge variant="warning" className="gap-1 text-xs"><Clock className="h-3 w-3 animate-spin" /> Generating</Badge>
                      ) : (
                        <>
                          <Badge variant="secondary" className="text-xs">{report.format}</Badge>
                          <Button variant="ghost" size="icon-sm"><Download className="h-4 w-4" /></Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

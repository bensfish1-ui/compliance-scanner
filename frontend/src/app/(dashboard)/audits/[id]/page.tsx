"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Bot, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, RAGBadge } from "@/components/ui/status-badge";
import { GaugeChart } from "@/components/charts/gauge-chart";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAudit } from "@/hooks/use-audits";
import { formatDate, cn } from "@/lib/utils";

const severityColors: Record<string, string> = {
  critical: "border-red-500/30 bg-red-500/10",
  major: "border-orange-500/30 bg-orange-500/10",
  minor: "border-yellow-500/30 bg-yellow-500/10",
  observation: "border-blue-500/30 bg-blue-500/10",
};

export default function AuditDetailPage() {
  const params = useParams();
  const { data: audit, isLoading } = useAudit(params.id as string);

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /></div>;
  if (!audit) return <div className="text-center text-slate-400 py-20">Audit not found</div>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/audits" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Audits
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="glass-card rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-white">{audit.title}</h1>
              <div className="flex items-center gap-3">
                <StatusBadge status={audit.status} />
                <RAGBadge status={audit.ragStatus} />
                <Badge variant="secondary" className="capitalize">{audit.type}</Badge>
              </div>
              <p className="text-sm text-slate-400">{audit.scope}</p>
            </div>
            <GaugeChart value={audit.readinessScore} label="Readiness Score" size="md" />
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-slate-500">Auditor</p><p className="text-white font-medium">{audit.auditor.firstName} {audit.auditor.lastName}</p></div>
            <div><p className="text-slate-500">Period</p><p className="text-white font-medium">{formatDate(audit.startDate)} - {formatDate(audit.endDate)}</p></div>
            <div><p className="text-slate-500">Findings</p><p className="text-white font-medium">{audit.findings.length} total</p></div>
            <div><p className="text-slate-500">Open</p><p className="text-white font-medium">{audit.findings.filter((f) => f.status === "open").length} open</p></div>
          </div>
        </div>

        <Tabs defaultValue="findings">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="findings">Findings ({audit.findings.length})</TabsTrigger>
            <TabsTrigger value="capa">CAPA</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {["critical", "major", "minor", "observation"].map((severity) => {
                const count = audit.findings.filter((f) => f.severity === severity).length;
                return (
                  <Card glass key={severity}>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-white">{count}</p>
                      <p className="text-xs text-slate-500 capitalize mt-1">{severity} Findings</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="findings">
            <div className="space-y-3">
              {audit.findings.map((finding) => (
                <Card glass key={finding.id}>
                  <CardContent className={cn("p-4 border-l-2", severityColors[finding.severity])}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          {finding.severity === "critical" ? <AlertTriangle className="h-4 w-4 text-red-400" /> :
                           finding.severity === "major" ? <AlertTriangle className="h-4 w-4 text-orange-400" /> :
                           <FileText className="h-4 w-4 text-slate-400" />}
                          <h3 className="text-sm font-medium text-white">{finding.title}</h3>
                        </div>
                        <p className="text-xs text-slate-400 ml-6">{finding.description}</p>
                        {finding.recommendation && (
                          <p className="text-xs text-cyan-400/80 ml-6 mt-2">Recommendation: {finding.recommendation}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={finding.severity === "critical" ? "critical" : finding.severity === "major" ? "high" : "medium"} className="capitalize">{finding.severity}</Badge>
                        <StatusBadge status={finding.status} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {audit.findings.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No findings recorded yet.</p>}
            </div>
          </TabsContent>

          <TabsContent value="capa">
            <Card glass>
              <CardContent className="p-6">
                <p className="text-sm text-slate-400">CAPA (Corrective and Preventive Actions) tracker for audit findings.</p>
                <div className="mt-4 space-y-3">
                  {audit.findings.filter((f) => f.capa).map((f) => (
                    <div key={f.id} className="p-3 rounded-lg bg-white/[0.02]">
                      <p className="text-sm text-white font-medium">{f.capa!.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>Type: {f.capa!.type}</span>
                        <span>Due: {formatDate(f.capa!.dueDate)}</span>
                      </div>
                    </div>
                  ))}
                  {audit.findings.filter((f) => f.capa).length === 0 && <p className="text-sm text-slate-500 text-center py-4">No CAPA items yet.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evidence">
            <Card glass><CardContent className="p-6"><p className="text-sm text-slate-400 text-center py-8">Evidence documents and attachments will appear here.</p></CardContent></Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card glass>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary-400" /><h3 className="text-lg font-semibold text-white">AI Insights</h3></div>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-primary-600/5 border border-primary-500/10">
                    <p className="text-sm text-slate-300">Based on the current findings, this audit has a <strong className="text-white">{audit.readinessScore}% readiness score</strong>. Focus on resolving the {audit.findings.filter((f) => f.severity === "critical").length} critical findings before the audit end date.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Generate Audit Report</Button>
                    <Button size="sm" variant="outline">Predict Risk Areas</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

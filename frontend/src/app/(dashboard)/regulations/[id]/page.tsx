"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Bot, Clock, CheckCircle, AlertCircle, FileText, Activity, ClipboardCheck, FolderKanban, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImpactBadge } from "@/components/ui/impact-badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useRegulation } from "@/hooks/use-regulations";
import { formatDate, cn } from "@/lib/utils";
import api from "@/lib/api";

export default function RegulationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: regulation, isLoading } = useRegulation(id);
  const [generatingAudit, setGeneratingAudit] = useState(false);
  const [generatingProject, setGeneratingProject] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: string; message: string; link?: string } | null>(null);

  const handleGenerateAudit = async () => {
    setGeneratingAudit(true);
    setActionResult(null);
    try {
      const res = await api.post(`/regulations/${id}/generate-audit`);
      const audit = res.data;
      setActionResult({
        type: "success",
        message: `Gap analysis audit created: "${audit.title}" with ${audit.findings?.length || 0} findings`,
        link: `/audits/${audit.id}`,
      });
    } catch (err: any) {
      setActionResult({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to generate audit",
      });
    } finally {
      setGeneratingAudit(false);
    }
  };

  const handleGenerateProject = async () => {
    setGeneratingProject(true);
    setActionResult(null);
    try {
      const res = await api.post(`/regulations/${id}/generate-project`);
      const project = res.data;
      setActionResult({
        type: "success",
        message: `Implementation project created: "${project.title}" with ${project.milestones?.length || 0} milestones and ${project.taskCount || 0} tasks`,
        link: `/projects/${project.id}`,
      });
    } catch (err: any) {
      setActionResult({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to generate project",
      });
    } finally {
      setGeneratingProject(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!regulation) {
    return <div className="text-center text-slate-400 py-20">Regulation not found</div>;
  }

  const obligationStats = {
    total: regulation.obligations.length,
    compliant: regulation.obligations.filter((o) => o.status === "compliant").length,
    inProgress: regulation.obligations.filter((o) => o.status === "in-progress").length,
    nonCompliant: regulation.obligations.filter((o) => o.status === "non-compliant").length,
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/regulations" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Regulations
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{regulation.title}</h1>
                {regulation.shortName && (
                  <Badge variant="outline" className="text-xs">{regulation.shortName}</Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={regulation.status} />
                <ImpactBadge level={regulation.impactLevel} />
                <Badge variant="secondary" className="capitalize">{regulation.category.replace(/-/g, " ")}</Badge>
              </div>
              <p className="text-sm text-slate-400 max-w-2xl">{regulation.description}</p>
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap">
              {regulation.sourceUrl && (
                <Button variant="outline" size="sm" className="gap-1">
                  <ExternalLink className="h-3.5 w-3.5" /> Source
                </Button>
              )}
              <Button size="sm" className="gap-1">
                <Bot className="h-3.5 w-3.5" /> AI Analysis
              </Button>
              <button
                onClick={handleGenerateAudit}
                disabled={generatingAudit || generatingProject}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingAudit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ClipboardCheck className="h-3.5 w-3.5" />}
                {generatingAudit ? "Generating..." : "Generate Gap Analysis"}
              </button>
              <button
                onClick={handleGenerateProject}
                disabled={generatingAudit || generatingProject}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingProject ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FolderKanban className="h-3.5 w-3.5" />}
                {generatingProject ? "Generating..." : "Generate Project Plan"}
              </button>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Regulator</p>
              <p className="text-white font-medium">{regulation.regulator}</p>
            </div>
            <div>
              <p className="text-slate-500">Jurisdiction</p>
              <p className="text-white font-medium">{regulation.country}</p>
            </div>
            <div>
              <p className="text-slate-500">Effective Date</p>
              <p className="text-white font-medium">{formatDate(regulation.effectiveDate)}</p>
            </div>
            <div>
              <p className="text-slate-500">Compliance Deadline</p>
              <p className="text-white font-medium">{regulation.complianceDeadline ? formatDate(regulation.complianceDeadline) : "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Action Result Banner */}
        {actionResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-lg p-4 flex items-center justify-between",
              actionResult.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-red-500/10 border border-red-500/20"
            )}
          >
            <div className="flex items-center gap-2">
              {actionResult.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
              <span className={cn("text-sm font-medium", actionResult.type === "success" ? "text-emerald-300" : "text-red-300")}>
                {actionResult.message}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {actionResult.link && (
                <Link
                  href={actionResult.link}
                  className="text-sm font-medium text-white underline underline-offset-2 hover:text-emerald-300 transition-colors"
                >
                  View Created Item
                </Link>
              )}
              <button onClick={() => setActionResult(null)} className="text-slate-500 hover:text-white text-sm ml-2">
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="obligations">Obligations ({regulation.obligations.length})</TabsTrigger>
            <TabsTrigger value="impact">Impact Assessment</TabsTrigger>
            <TabsTrigger value="related">Related Items</TabsTrigger>
            <TabsTrigger value="ai">AI Analysis</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Obligation Summary */}
              <Card glass className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Obligation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 rounded-lg bg-white/[0.02]">
                      <p className="text-2xl font-bold text-white">{obligationStats.total}</p>
                      <p className="text-xs text-slate-500">Total</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-emerald-500/5">
                      <p className="text-2xl font-bold text-emerald-400">{obligationStats.compliant}</p>
                      <p className="text-xs text-slate-500">Compliant</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-amber-500/5">
                      <p className="text-2xl font-bold text-amber-400">{obligationStats.inProgress}</p>
                      <p className="text-xs text-slate-500">In Progress</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-red-500/5">
                      <p className="text-2xl font-bold text-red-400">{obligationStats.nonCompliant}</p>
                      <p className="text-xs text-slate-500">Non-Compliant</p>
                    </div>
                  </div>
                  <Progress value={(obligationStats.compliant / Math.max(obligationStats.total, 1)) * 100} className="h-3" />
                  <p className="text-xs text-slate-500 mt-2">{Math.round((obligationStats.compliant / Math.max(obligationStats.total, 1)) * 100)}% compliance achieved</p>
                </CardContent>
              </Card>

              {/* Tags & Metadata */}
              <Card glass>
                <CardHeader>
                  <CardTitle>Tags & Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {regulation.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Created</span>
                      <span className="text-slate-300">{formatDate(regulation.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Updated</span>
                      <span className="text-slate-300">{formatDate(regulation.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="obligations">
            <div className="space-y-4">
              {regulation.obligations.map((obligation) => (
                <Card glass key={obligation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          {obligation.status === "compliant" ? (
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          ) : obligation.status === "non-compliant" ? (
                            <AlertCircle className="h-4 w-4 text-red-400" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-400" />
                          )}
                          <h3 className="text-sm font-medium text-white">{obligation.title}</h3>
                        </div>
                        <p className="text-xs text-slate-400 ml-6">{obligation.description}</p>
                        <div className="flex gap-4 ml-6 mt-2 text-xs text-slate-500">
                          {obligation.frequency && <span>Frequency: {obligation.frequency}</span>}
                          {obligation.responsibleRole && <span>Responsible: {obligation.responsibleRole}</span>}
                        </div>
                      </div>
                      <StatusBadge status={obligation.status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="impact">
            <Card glass>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Impact Assessment</h3>
                    <div className="space-y-3">
                      {["Operational Impact", "Financial Impact", "Reputational Impact", "Legal Impact"].map((label, i) => {
                        const score = [75, 60, 85, 90][i];
                        return (
                          <div key={label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-400">{label}</span>
                              <span className="text-white font-medium">{score}%</span>
                            </div>
                            <Progress value={score} indicatorClassName={score >= 80 ? "from-red-600 to-red-400" : score >= 60 ? "from-amber-600 to-amber-400" : "from-emerald-600 to-emerald-400"} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Affected Areas</h3>
                    <div className="space-y-2">
                      {["IT & Data Systems", "Legal & Compliance", "Customer Operations", "Human Resources", "Finance & Accounting"].map((area) => (
                        <div key={area} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                          <div className="h-2 w-2 rounded-full bg-primary-400" />
                          <span className="text-sm text-slate-300">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="related">
            <Card glass>
              <CardContent className="p-6">
                <p className="text-sm text-slate-400">Related regulations, policies, and projects will appear here.</p>
                <div className="mt-4 space-y-3">
                  {regulation.relatedRegulations.map((relId) => (
                    <Link key={relId} href={`/regulations/${relId}`} className="block p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                      <p className="text-sm font-medium text-white">Related Regulation #{relId}</p>
                      <p className="text-xs text-slate-500">Click to view details</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card glass>
              <CardContent className="p-6">
                {regulation.aiSummary ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary-400" />
                        <h3 className="text-lg font-semibold text-white">AI-Generated Summary</h3>
                      </div>
                      {regulation.aiConfidenceScore && (
                        <Badge variant={regulation.aiConfidenceScore >= 0.9 ? "green" : regulation.aiConfidenceScore >= 0.7 ? "amber" : "red"}>
                          Confidence: {Math.round(regulation.aiConfidenceScore * 100)}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{regulation.aiSummary}</p>
                    <Separator />
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1"><Bot className="h-3.5 w-3.5" /> Regenerate</Button>
                      <Button size="sm" variant="outline">Generate Gap Analysis</Button>
                      <Button size="sm" variant="outline">Draft Policy</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No AI analysis available yet.</p>
                    <Button className="mt-4 gap-1"><Bot className="h-4 w-4" /> Generate AI Analysis</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card glass>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { action: "Obligation status updated", detail: "Data Processing Agreements marked as compliant", date: "2 hours ago", icon: CheckCircle, color: "text-emerald-400" },
                    { action: "AI analysis regenerated", detail: "Confidence score improved to 95%", date: "1 day ago", icon: Bot, color: "text-primary-400" },
                    { action: "New obligation added", detail: "Data Subject Rights processing requirement", date: "3 days ago", icon: FileText, color: "text-cyan-400" },
                    { action: "Impact assessment updated", detail: "Operational impact increased to High", date: "1 week ago", icon: Activity, color: "text-amber-400" },
                  ].map((item, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg bg-white/[0.02]">
                      <item.icon className={cn("h-5 w-5 mt-0.5 shrink-0", item.color)} />
                      <div>
                        <p className="text-sm font-medium text-white">{item.action}</p>
                        <p className="text-xs text-slate-400">{item.detail}</p>
                        <p className="text-xs text-slate-600 mt-1">{item.date}</p>
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

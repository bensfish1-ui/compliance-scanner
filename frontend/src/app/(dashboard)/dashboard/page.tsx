"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  FolderKanban,
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  Download,
  ArrowRight,
  Shield,
  Brain,
  Coins,
  Zap,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ScanButton } from "@/components/horizon-scanning/scan-button";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { RadarChartComponent } from "@/components/charts/radar-chart";
import { LineChartComponent } from "@/components/charts/line-chart";
import { Heatmap } from "@/components/charts/heatmap";
import { GaugeChart } from "@/components/charts/gauge-chart";
import { KPICard } from "@/components/charts/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImpactBadge } from "@/components/ui/impact-badge";
import { useDashboardStats, useAIUsage } from "@/hooks/use-dashboard";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return String(tokens);
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: aiUsage } = useAIUsage();

  const radarData = [
    { subject: "Data Privacy", value: 85, fullMark: 100 },
    { subject: "Cybersecurity", value: 72, fullMark: 100 },
    { subject: "Financial", value: 90, fullMark: 100 },
    { subject: "Operational", value: 68, fullMark: 100 },
    { subject: "Governance", value: 82, fullMark: 100 },
    { subject: "AML/KYC", value: 76, fullMark: 100 },
  ];

  const heatmapData = [
    { x: 0, y: 0, value: 2, label: "Low Impact, Rare" },
    { x: 1, y: 0, value: 3, label: "Medium Impact, Rare" },
    { x: 2, y: 0, value: 5, label: "High Impact, Rare" },
    { x: 3, y: 0, value: 8, label: "Very High Impact, Rare" },
    { x: 4, y: 0, value: 10, label: "Critical Impact, Rare" },
    { x: 0, y: 1, value: 3, label: "Low Impact, Unlikely" },
    { x: 1, y: 1, value: 5, label: "Medium Impact, Unlikely" },
    { x: 2, y: 1, value: 8, label: "High Impact, Unlikely" },
    { x: 3, y: 1, value: 12, label: "Very High Impact, Unlikely" },
    { x: 4, y: 1, value: 15, label: "Critical Impact, Unlikely" },
    { x: 0, y: 2, value: 5, label: "Low Impact, Possible" },
    { x: 1, y: 2, value: 8, label: "Medium Impact, Possible" },
    { x: 2, y: 2, value: 12, label: "High Impact, Possible" },
    { x: 3, y: 2, value: 16, label: "Very High Impact, Possible" },
    { x: 4, y: 2, value: 20, label: "Critical Impact, Possible" },
    { x: 0, y: 3, value: 8, label: "Low Impact, Likely" },
    { x: 1, y: 3, value: 12, label: "Medium Impact, Likely" },
    { x: 2, y: 3, value: 15, label: "High Impact, Likely" },
    { x: 3, y: 3, value: 20, label: "Very High Impact, Likely" },
    { x: 4, y: 3, value: 25, label: "Critical Impact, Likely" },
    { x: 0, y: 4, value: 10, label: "Low Impact, Almost Certain" },
    { x: 1, y: 4, value: 15, label: "Medium Impact, Almost Certain" },
    { x: 2, y: 4, value: 20, label: "High Impact, Almost Certain" },
    { x: 3, y: 4, value: 25, label: "Very High Impact, Almost Certain" },
    { x: 4, y: 4, value: 25, label: "Critical Impact, Almost Certain" },
  ];

  const trendData = [
    { month: "Oct", compliance: 75, risk: 48, incidents: 5 },
    { month: "Nov", compliance: 77, risk: 46, incidents: 3 },
    { month: "Dec", compliance: 80, risk: 42, incidents: 4 },
    { month: "Jan", compliance: 82, risk: 40, incidents: 2 },
    { month: "Feb", compliance: 85, risk: 36, incidents: 3 },
    { month: "Mar", compliance: 87, risk: 34, incidents: 1 },
  ];

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        description="Real-time compliance intelligence and risk overview"
        actions={
          <div className="flex items-center gap-3">
            <ScanButton />
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Board-Ready Summary
            </Button>
          </div>
        }
      />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Stat Cards */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Regulations"
            value={stats?.totalRegulations ?? 0}
            trend={8.2}
            trendLabel="vs last month"
            icon={<BookOpen className="h-5 w-5" />}
          />
          <StatCard
            title="Active Projects"
            value={stats?.activeProjects ?? 0}
            trend={12}
            trendLabel="vs last month"
            icon={<FolderKanban className="h-5 w-5" />}
          />
          <StatCard
            title="Open Audits"
            value={stats?.openAudits ?? 0}
            trend={-5}
            trendLabel="vs last month"
            icon={<ClipboardCheck className="h-5 w-5" />}
          />
          <StatCard
            title="Overdue Actions"
            value={stats?.overdueActions ?? 0}
            trend={-15}
            trendLabel="vs last month"
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <StatCard
            title="Compliance Score"
            value={stats?.complianceScore ?? 0}
            suffix="%"
            trend={3.5}
            trendLabel="vs last month"
            icon={<Shield className="h-5 w-5" />}
            format="number"
          />
        </motion.div>

        {/* KPI Cards */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard
            title="Avg. Closure Time"
            value="12.4 days"
            trend={-8}
            trendLabel="vs last quarter"
            sparklineData={[18, 16, 15, 14, 13, 12]}
            color="#10b981"
          />
          <KPICard
            title="Findings Open"
            value="23"
            trend={-12}
            trendLabel="vs last month"
            sparklineData={[35, 32, 28, 26, 25, 23]}
            color="#f59e0b"
          />
          <KPICard
            title="Policy Coverage"
            value="94%"
            trend={2}
            trendLabel="vs last quarter"
            sparklineData={[88, 89, 90, 92, 93, 94]}
            color="#6366f1"
          />
          <KPICard
            title="Training Completion"
            value="89%"
            trend={5}
            trendLabel="vs last quarter"
            sparklineData={[72, 76, 80, 84, 87, 89]}
            color="#06b6d4"
          />
        </motion.div>

        {/* AI Usage KPI Cards */}
        <motion.div variants={item}>
          <Card glass>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                AI Usage &amp; Cost Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  title="Total Tokens Used"
                  value={formatTokens(aiUsage?.allTime?.totalTokens ?? 0)}
                  trend={aiUsage?.trends?.tokenTrend ?? 0}
                  trendLabel="vs last week"
                  sparklineData={aiUsage?.dailyTrend?.slice(-14).map((d) => d.tokens) ?? []}
                  color="#a855f7"
                />
                <KPICard
                  title="AI Spend"
                  value={`$${(aiUsage?.allTime?.totalCost ?? 0).toFixed(2)}`}
                  trend={aiUsage?.trends?.costTrend ?? 0}
                  trendLabel="vs last week"
                  sparklineData={aiUsage?.dailyTrend?.slice(-14).map((d) => d.cost) ?? []}
                  color="#f59e0b"
                />
                <KPICard
                  title="AI Requests"
                  value={String(aiUsage?.allTime?.totalRequests ?? 0)}
                  trend={0}
                  trendLabel="all time"
                  sparklineData={aiUsage?.dailyTrend?.slice(-14).map((d) => d.requests) ?? []}
                  color="#06b6d4"
                />
                <KPICard
                  title="Avg Latency"
                  value={`${aiUsage?.avgLatencyMs ?? 0}ms`}
                  trendLabel="last 30 days"
                  sparklineData={[]}
                  color="#10b981"
                />
              </div>
              {(aiUsage?.byAction?.length ?? 0) > 0 && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Usage by Action</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {aiUsage?.byAction?.map((action) => (
                      <div key={action.action} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <p className="text-[10px] text-slate-500 truncate">{action.action.replace(/-/g, ' ')}</p>
                        <p className="text-sm font-semibold text-white">{formatTokens(action.tokens)}</p>
                        <p className="text-[10px] text-slate-500">${action.cost.toFixed(4)} · {action.requests} req</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row 1 */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Analysis */}
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-400" />
                Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LineChartComponent
                data={trendData}
                xKey="month"
                yKeys={[
                  { key: "compliance", color: "#6366f1", label: "Compliance %" },
                  { key: "risk", color: "#ef4444", label: "Risk Score" },
                  { key: "incidents", color: "#f59e0b", label: "Incidents" },
                ]}
                height={280}
              />
            </CardContent>
          </Card>

          {/* Upcoming Regulations Timeline */}
          <Card glass>
            <CardHeader>
              <CardTitle>Upcoming Regulations</CardTitle>
            </CardHeader>
            <CardContent>
              <AreaChartComponent
                data={stats?.trendsData ?? []}
                xKey="date"
                yKeys={[
                  { key: "regulations", color: "#818cf8", label: "New Regulations" },
                  { key: "compliance", color: "#34d399", label: "Compliance %" },
                ]}
                height={280}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row 2 */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Heatmap */}
          <Card glass className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Risk Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <Heatmap
                data={heatmapData}
                xLabels={["Low", "Medium", "High", "Very High", "Critical"]}
                yLabels={["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"]}
                xTitle="Impact"
                yTitle="Likelihood"
              />
            </CardContent>
          </Card>

          {/* Compliance Maturity Radar */}
          <Card glass>
            <CardHeader className="pb-2">
              <CardTitle>Compliance Maturity</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <RadarChartComponent data={radarData} height={250} />
              <GaugeChart value={stats?.complianceScore ?? 87} label="Overall Score" size="sm" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row 3 */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Regulations by Country */}
          <Card glass>
            <CardHeader>
              <CardTitle>Regulations by Jurisdiction</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={(stats?.regulationsByCountry ?? []).map((c) => ({
                  name: c.country,
                  count: c.count,
                }))}
                xKey="name"
                yKey="count"
                colors={["#6366f1", "#818cf8", "#a5b4fc", "#06b6d4", "#22d3ee", "#67e8f9", "#10b981", "#94a3b8"]}
                height={300}
              />
            </CardContent>
          </Card>

          {/* Top Risks Table */}
          <Card glass>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Risks</CardTitle>
              <Link href="/risks">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View All <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(stats?.topRisks ?? []).slice(0, 5).map((risk, index) => (
                  <div
                    key={risk.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                      risk.riskScore >= 15 ? "bg-red-500/20 text-red-400" :
                      risk.riskScore >= 10 ? "bg-amber-500/20 text-amber-400" :
                      "bg-emerald-500/20 text-emerald-400"
                    )}>
                      {risk.riskScore}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{risk.title}</p>
                      <p className="text-xs text-slate-500">{risk.category}</p>
                    </div>
                    <StatusBadge status={risk.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={item}>
          <Card glass>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Deadlines</CardTitle>
              <Badge variant="warning">{stats?.upcomingDeadlines?.length ?? 0} items</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {(stats?.upcomingDeadlines ?? []).map((deadline) => (
                  <div
                    key={deadline.id}
                    className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        deadline.type === "regulation" ? "default" :
                        deadline.type === "audit" ? "info" : "secondary"
                      } className="text-[10px]">
                        {deadline.type}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-white mb-1">{deadline.title}</p>
                    <p className="text-xs text-slate-500">Due: {formatDate(deadline.dueDate)}</p>
                    <StatusBadge status={deadline.status} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

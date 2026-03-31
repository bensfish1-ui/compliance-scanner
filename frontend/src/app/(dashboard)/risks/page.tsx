"use client";

import { motion } from "framer-motion";
import { Plus, AlertTriangle, Shield, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Heatmap } from "@/components/charts/heatmap";
import { cn } from "@/lib/utils";

const risks = [
  { id: "1", title: "GDPR Non-Compliance", category: "Data Privacy", likelihood: 4, impact: 5, score: 20, status: "assessed", owner: "John D." },
  { id: "2", title: "Cybersecurity Framework Gaps", category: "Cybersecurity", likelihood: 4, impact: 4, score: 16, status: "mitigated", owner: "Bob W." },
  { id: "3", title: "SOX Section 404 Gaps", category: "Financial", likelihood: 3, impact: 5, score: 15, status: "identified", owner: "Jane S." },
  { id: "4", title: "AML Transaction Monitoring", category: "AML", likelihood: 3, impact: 4, score: 12, status: "assessed", owner: "John D." },
  { id: "5", title: "Third-Party Vendor Risk", category: "Operational", likelihood: 3, impact: 3, score: 9, status: "identified", owner: "Jane S." },
  { id: "6", title: "Business Continuity Gaps", category: "Operational", likelihood: 2, impact: 4, score: 8, status: "mitigated", owner: "Bob W." },
  { id: "7", title: "Data Retention Violations", category: "Data Privacy", likelihood: 2, impact: 3, score: 6, status: "accepted", owner: "Alice B." },
  { id: "8", title: "Employee Training Gaps", category: "Governance", likelihood: 3, impact: 2, score: 6, status: "assessed", owner: "Jane S." },
];

const heatmapData = risks.map((r) => ({
  x: r.impact - 1,
  y: r.likelihood - 1,
  value: r.score,
  label: r.title,
}));

export default function RisksPage() {
  return (
    <div>
      <PageHeader
        title="Risk Register"
        description="Enterprise risk identification, assessment, and mitigation tracking"
        actions={<Button className="gap-2"><Plus className="h-4 w-4" /> Register Risk</Button>}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Risks" value={risks.length} icon={<Shield className="h-5 w-5" />} trend={-5} trendLabel="vs last month" />
          <StatCard title="Critical Risks" value={risks.filter((r) => r.score >= 15).length} icon={<AlertTriangle className="h-5 w-5" />} trend={0} />
          <StatCard title="Avg Risk Score" value={Math.round(risks.reduce((a, r) => a + r.score, 0) / risks.length)} icon={<TrendingDown className="h-5 w-5" />} trend={-8} trendLabel="improving" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card glass>
            <CardHeader><CardTitle>Risk Matrix</CardTitle></CardHeader>
            <CardContent>
              <Heatmap
                data={heatmapData}
                xLabels={["1 - Minimal", "2 - Low", "3 - Medium", "4 - High", "5 - Critical"]}
                yLabels={["1 - Rare", "2 - Unlikely", "3 - Possible", "4 - Likely", "5 - Almost Certain"]}
                xTitle="Impact"
                yTitle="Likelihood"
              />
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader><CardTitle>Risk Register</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {risks.map((risk) => (
                  <div key={risk.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                      risk.score >= 15 ? "bg-red-500/20 text-red-400" :
                      risk.score >= 10 ? "bg-amber-500/20 text-amber-400" :
                      risk.score >= 5 ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-emerald-500/20 text-emerald-400"
                    )}>
                      {risk.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{risk.title}</p>
                      <p className="text-xs text-slate-500">{risk.category} - {risk.owner}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">L:{risk.likelihood} I:{risk.impact}</span>
                      <StatusBadge status={risk.status} />
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

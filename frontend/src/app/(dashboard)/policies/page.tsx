"use client";

import { motion } from "framer-motion";
import { Plus, FileText, Clock, CheckCircle, Archive, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatDate } from "@/lib/utils";

const policies = [
  { id: "1", title: "Data Protection Policy", category: "Data Privacy", version: "3.2", status: "published", effectiveDate: "2025-06-01", reviewDate: "2026-06-01", owner: "John Doe" },
  { id: "2", title: "Information Security Policy", category: "Cybersecurity", version: "4.0", status: "published", effectiveDate: "2025-09-15", reviewDate: "2026-09-15", owner: "Bob Wilson" },
  { id: "3", title: "Anti-Money Laundering Policy", category: "Financial Crime", version: "2.1", status: "review", effectiveDate: "2025-03-01", reviewDate: "2026-03-01", owner: "Jane Smith" },
  { id: "4", title: "Business Continuity Plan", category: "Operational", version: "1.8", status: "approved", effectiveDate: "2025-12-01", reviewDate: "2026-12-01", owner: "Alice Brown" },
  { id: "5", title: "Acceptable Use Policy", category: "IT Governance", version: "5.0", status: "published", effectiveDate: "2025-01-15", reviewDate: "2026-01-15", owner: "Bob Wilson" },
  { id: "6", title: "Third-Party Risk Management", category: "Vendor Management", version: "2.0", status: "draft", effectiveDate: "", reviewDate: "", owner: "John Doe" },
  { id: "7", title: "Incident Response Procedure", category: "Cybersecurity", version: "3.1", status: "published", effectiveDate: "2025-08-01", reviewDate: "2026-08-01", owner: "Bob Wilson" },
  { id: "8", title: "Code of Conduct", category: "Governance", version: "6.0", status: "published", effectiveDate: "2025-01-01", reviewDate: "2027-01-01", owner: "Jane Smith" },
];

export default function PoliciesPage() {
  return (
    <div>
      <PageHeader
        title="Policies"
        description="Policy library with version control and review tracking"
        actions={<Button className="gap-2"><Plus className="h-4 w-4" /> New Policy</Button>}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Policies" value={policies.length} icon={<FileText className="h-5 w-5" />} />
          <StatCard title="Published" value={policies.filter((p) => p.status === "published").length} icon={<CheckCircle className="h-5 w-5" />} />
          <StatCard title="Under Review" value={policies.filter((p) => p.status === "review").length} icon={<Clock className="h-5 w-5" />} />
          <StatCard title="Draft" value={policies.filter((p) => p.status === "draft").length} icon={<Archive className="h-5 w-5" />} />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input placeholder="Search policies..." className="pl-10" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {policies.map((policy, i) => (
            <motion.div key={policy.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card glass className="hover:border-white/10 transition-all cursor-pointer h-full">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary-400 shrink-0" />
                      <h3 className="text-sm font-medium text-white">{policy.title}</h3>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">v{policy.version}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{policy.category}</Badge>
                    <StatusBadge status={policy.status} />
                  </div>
                  <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-white/[0.04]">
                    <div className="flex justify-between"><span>Owner</span><span className="text-slate-300">{policy.owner}</span></div>
                    {policy.effectiveDate && <div className="flex justify-between"><span>Effective</span><span className="text-slate-300">{formatDate(policy.effectiveDate)}</span></div>}
                    {policy.reviewDate && <div className="flex justify-between"><span>Next Review</span><span className="text-slate-300">{formatDate(policy.reviewDate)}</span></div>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

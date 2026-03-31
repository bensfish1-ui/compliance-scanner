"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Calendar, List, Eye, MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, SortableHeader } from "@/components/ui/data-table";
import { StatusBadge, RAGBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { GaugeChart } from "@/components/charts/gauge-chart";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAudits } from "@/hooks/use-audits";
import { formatDate, cn, getRagDotColor } from "@/lib/utils";
import type { Audit } from "@/types";

const columns: ColumnDef<Audit>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column} title="Audit" />,
    cell: ({ row }) => (
      <div>
        <Link href={`/audits/${row.original.id}`} className="text-sm font-medium text-white hover:text-primary-300 transition-colors">
          {row.original.title}
        </Link>
        <p className="text-xs text-slate-500 mt-0.5">{row.original.scope.slice(0, 60)}...</p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => <SortableHeader column={column} title="Type" />,
    cell: ({ row }) => <Badge variant="secondary" className="capitalize text-xs">{row.original.type}</Badge>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "ragStatus",
    header: "RAG",
    cell: ({ row }) => <RAGBadge status={row.original.ragStatus} />,
  },
  {
    accessorKey: "readinessScore",
    header: ({ column }) => <SortableHeader column={column} title="Readiness" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 rounded-full bg-navy-700">
          <div className={cn("h-full rounded-full", row.original.readinessScore >= 80 ? "bg-emerald-500" : row.original.readinessScore >= 60 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${row.original.readinessScore}%` }} />
        </div>
        <span className="text-xs text-slate-400">{row.original.readinessScore}%</span>
      </div>
    ),
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => <SortableHeader column={column} title="Period" />,
    cell: ({ row }) => <span className="text-xs text-slate-400">{formatDate(row.original.startDate, "MMM dd")} - {formatDate(row.original.endDate, "MMM dd")}</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/audits/${row.original.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function AuditsPage() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const { data, isLoading } = useAudits();

  return (
    <div>
      <PageHeader
        title="Audits"
        description="Manage compliance audits, findings, and remediation"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-white/10 rounded-lg p-0.5">
              <button onClick={() => setView("list")} className={cn("p-1.5 rounded-md transition-colors", view === "list" ? "bg-primary-600/20 text-primary-300" : "text-slate-400")}>
                <List className="h-4 w-4" />
              </button>
              <button onClick={() => setView("calendar")} className={cn("p-1.5 rounded-md transition-colors", view === "calendar" ? "bg-primary-600/20 text-primary-300" : "text-slate-400")}>
                <Calendar className="h-4 w-4" />
              </button>
            </div>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Schedule Audit</Button>
          </div>
        }
      />

      {view === "list" ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "In Progress", count: data?.data.filter((a) => a.status === "in-progress" || a.status === "fieldwork").length || 0, color: "text-cyan-400" },
              { label: "Planned", count: data?.data.filter((a) => a.status === "planned").length || 0, color: "text-indigo-400" },
              { label: "Completed", count: data?.data.filter((a) => a.status === "completed").length || 0, color: "text-emerald-400" },
              { label: "Open Findings", count: data?.data.reduce((acc, a) => acc + a.findings.filter((f) => f.status === "open").length, 0) || 0, color: "text-red-400" },
            ].map((stat) => (
              <Card glass key={stat.label}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.count}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DataTable columns={columns} data={data?.data ?? []} searchKey="title" searchPlaceholder="Search audits..." />
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card glass>
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 text-center py-12">
                Calendar view loads here. Navigate to{" "}
                <Link href="/audits/calendar" className="text-primary-400 hover:text-primary-300">/audits/calendar</Link>
                {" "}for the full calendar.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Filter, Download, Eye, MoreHorizontal, ExternalLink, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ScanButton } from "@/components/horizon-scanning/scan-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, SortableHeader } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImpactBadge } from "@/components/ui/impact-badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useRegulations } from "@/hooks/use-regulations";
import { formatDate, cn } from "@/lib/utils";
import type { Regulation } from "@/types";

const columns: ColumnDef<Regulation>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column} title="Regulation" />,
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <Link href={`/regulations/${row.original.id}`} className="text-sm font-medium text-white hover:text-primary-300 transition-colors">
          {row.original.title}
        </Link>
        {row.original.shortName && (
          <span className="ml-2 text-xs text-slate-500">({row.original.shortName})</span>
        )}
        <p className="text-xs text-slate-500 mt-0.5 truncate">{row.original.regulator}</p>
      </div>
    ),
  },
  {
    accessorKey: "country",
    header: ({ column }) => <SortableHeader column={column} title="Jurisdiction" />,
    cell: ({ row }) => <span className="text-sm text-slate-300">{row.original.country}</span>,
  },
  {
    accessorKey: "category",
    header: ({ column }) => <SortableHeader column={column} title="Category" />,
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize text-xs">
        {row.original.category.replace(/-/g, " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "impactLevel",
    header: ({ column }) => <SortableHeader column={column} title="Impact" />,
    cell: ({ row }) => <ImpactBadge level={row.original.impactLevel} />,
  },
  {
    accessorKey: "effectiveDate",
    header: ({ column }) => <SortableHeader column={column} title="Effective Date" />,
    cell: ({ row }) => (
      <span className="text-sm text-slate-400">{formatDate(row.original.effectiveDate)}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/regulations/${row.original.id}`}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </Link>
          </DropdownMenuItem>
          {row.original.sourceUrl && (
            <DropdownMenuItem>
              <ExternalLink className="mr-2 h-4 w-4" /> View Source
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function RegulationsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { data, isLoading } = useRegulations();

  return (
    <div>
      <PageHeader
        title="Regulations"
        description="Track and manage regulatory requirements across all jurisdictions"
        actions={
          <div className="flex items-center gap-3">
            <ScanButton />
            <Button variant="outline" className="gap-2" onClick={() => setFilterOpen(!filterOpen)}>
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Link href="/regulations/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Regulation
              </Button>
            </Link>
          </div>
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-6">
        {/* Filter Sidebar */}
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 shrink-0 space-y-6"
          >
            <div className="glass-card rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-semibold text-white">Filters</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Status</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="effective">Effective</SelectItem>
                      <SelectItem value="enacted">Enacted</SelectItem>
                      <SelectItem value="proposed">Proposed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="amended">Amended</SelectItem>
                      <SelectItem value="repealed">Repealed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Category</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data-privacy">Data Privacy</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="anti-money-laundering">AML</SelectItem>
                      <SelectItem value="environmental">Environmental</SelectItem>
                      <SelectItem value="health-safety">Health & Safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Jurisdiction</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="All jurisdictions" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eu">European Union</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="intl">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Impact Level</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="All levels" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <Button variant="ghost" size="sm" className="w-full">Clear Filters</Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            searchKey="title"
            searchPlaceholder="Search regulations..."
          />
        </div>
      </motion.div>

      {/* Quick View Sheet */}
      <Sheet open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedRegulation?.title}</SheetTitle>
            <SheetDescription>{selectedRegulation?.description}</SheetDescription>
          </SheetHeader>
          {selectedRegulation && (
            <div className="mt-6 space-y-4">
              <div className="flex gap-2">
                <StatusBadge status={selectedRegulation.status} />
                <ImpactBadge level={selectedRegulation.impactLevel} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Regulator</span>
                  <span className="text-white">{selectedRegulation.regulator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jurisdiction</span>
                  <span className="text-white">{selectedRegulation.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Effective Date</span>
                  <span className="text-white">{formatDate(selectedRegulation.effectiveDate)}</span>
                </div>
              </div>
              <Link href={`/regulations/${selectedRegulation.id}`}>
                <Button className="w-full mt-4">View Full Details</Button>
              </Link>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Upload, Search, FileText, File, FileSpreadsheet, FileImage, Download, Trash2, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";

const documents = [
  { id: "1", name: "GDPR Compliance Report Q4 2025.pdf", type: "PDF", size: "2.4 MB", category: "Reports", uploadedBy: "John Doe", createdAt: "2026-01-15" },
  { id: "2", name: "SOX 404 Control Matrix.xlsx", type: "Excel", size: "890 KB", category: "Controls", uploadedBy: "Jane Smith", createdAt: "2026-02-20" },
  { id: "3", name: "Privacy Impact Assessment - ML Pipeline.docx", type: "Word", size: "1.2 MB", category: "Assessments", uploadedBy: "Bob Wilson", createdAt: "2026-03-10" },
  { id: "4", name: "Audit Evidence - Access Reviews.zip", type: "Archive", size: "15.6 MB", category: "Evidence", uploadedBy: "Alice Brown", createdAt: "2026-03-15" },
  { id: "5", name: "Information Security Policy v4.0.pdf", type: "PDF", size: "450 KB", category: "Policies", uploadedBy: "Bob Wilson", createdAt: "2025-09-15" },
  { id: "6", name: "Vendor Risk Assessment Template.xlsx", type: "Excel", size: "320 KB", category: "Templates", uploadedBy: "Jane Smith", createdAt: "2026-01-05" },
  { id: "7", name: "Board Report - Compliance Summary.pptx", type: "PowerPoint", size: "5.8 MB", category: "Reports", uploadedBy: "John Doe", createdAt: "2026-03-25" },
];

const typeIcons: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-5 w-5 text-red-400" />,
  Word: <File className="h-5 w-5 text-blue-400" />,
  Excel: <FileSpreadsheet className="h-5 w-5 text-emerald-400" />,
  PowerPoint: <FileImage className="h-5 w-5 text-orange-400" />,
  Archive: <File className="h-5 w-5 text-slate-400" />,
};

export default function DocumentsPage() {
  return (
    <div>
      <PageHeader
        title="Documents"
        description="Centralized document library for compliance artifacts"
        actions={
          <Button className="gap-2">
            <Upload className="h-4 w-4" /> Upload Document
          </Button>
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Upload Zone */}
        <Card glass>
          <CardContent className="p-6">
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary-500/30 transition-colors cursor-pointer">
              <Upload className="h-10 w-10 text-slate-500 mx-auto mb-3" />
              <p className="text-sm text-slate-300">Drag and drop files here, or click to browse</p>
              <p className="text-xs text-slate-600 mt-1">PDF, DOCX, XLSX, PPTX, ZIP up to 100MB</p>
            </div>
          </CardContent>
        </Card>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input placeholder="Search documents..." className="pl-10" />
          </div>
          <div className="flex gap-2">
            {["All", "Reports", "Policies", "Evidence", "Templates"].map((cat) => (
              <Badge key={cat} variant={cat === "All" ? "default" : "secondary"} className="cursor-pointer hover:bg-white/10 transition-colors">
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Documents Table */}
        <Card glass>
          <div className="rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {typeIcons[doc.type] || <File className="h-5 w-5 text-slate-400" />}
                        <span className="text-sm text-white font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{doc.category}</Badge></TableCell>
                    <TableCell className="text-sm text-slate-400">{doc.size}</TableCell>
                    <TableCell className="text-sm text-slate-400">{doc.uploadedBy}</TableCell>
                    <TableCell className="text-sm text-slate-400">{formatDate(doc.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

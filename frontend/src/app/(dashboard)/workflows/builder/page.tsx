"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkflowCanvas } from "@/components/workflow/workflow-canvas";
import { NodePalette } from "@/components/workflow/node-palette";

export default function WorkflowBuilderPage() {
  return (
    <div>
      <div className="mb-4">
        <Link href="/workflows" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Workflows
        </Link>
      </div>

      <PageHeader
        title="Workflow Builder"
        description="Design automated compliance workflows visually"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">Test Run</Button>
            <Button className="gap-2"><Save className="h-4 w-4" /> Save Workflow</Button>
          </div>
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Palette */}
        <div className="space-y-4">
          <Card glass>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Workflow Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><Label className="text-xs">Name</Label><Input defaultValue="New Regulation Alert" className="mt-1 h-8 text-sm" /></div>
              <div><Label className="text-xs">Description</Label><Input defaultValue="Triggered when a new regulation is published" className="mt-1 h-8 text-sm" /></div>
            </CardContent>
          </Card>
          <Card glass>
            <CardContent className="p-4">
              <NodePalette />
            </CardContent>
          </Card>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3">
          <WorkflowCanvas />
        </div>
      </motion.div>
    </div>
  );
}

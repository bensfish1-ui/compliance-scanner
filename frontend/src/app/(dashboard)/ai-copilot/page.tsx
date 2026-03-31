"use client";

import { motion } from "framer-motion";
import { Bot, BookOpen, FolderKanban, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChatInterface } from "@/components/ai/chat-interface";
import { SuggestedPrompts } from "@/components/ai/suggested-prompts";
import { useAIStore } from "@/stores/ai-store";
import { useAIChat } from "@/hooks/use-ai";

export default function AICopilotPage() {
  const { context, setContext } = useAIStore();
  const chat = useAIChat();

  return (
    <div>
      <PageHeader
        title="AI Copilot"
        description="Your intelligent compliance assistant"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Context:</span>
              <Select
                value={context?.type || "general"}
                onValueChange={(value) => {
                  if (value === "general") {
                    setContext(null);
                  } else {
                    setContext({ type: value as any, name: value.charAt(0).toUpperCase() + value.slice(1) });
                  }
                }}
              >
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="regulation">Regulation</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="audit">Audit</SelectItem>
                  <SelectItem value="risk">Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {context && (
              <Badge variant="info" className="text-xs">
                {context.type === "regulation" ? <BookOpen className="h-3 w-3 mr-1" /> :
                 context.type === "project" ? <FolderKanban className="h-3 w-3 mr-1" /> :
                 <ClipboardCheck className="h-3 w-3 mr-1" />}
                {context.name || context.type}
              </Badge>
            )}
          </div>
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card glass className="h-[calc(100vh-14rem)]">
            <CardContent className="p-4 h-full">
              <ChatInterface />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <SuggestedPrompts onSelect={(prompt) => chat.mutate(prompt)} />

          <Card glass>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Regulatory analysis & summaries",
                "Risk assessments & scoring",
                "Audit preparation checklists",
                "Policy drafting assistance",
                "Gap analysis reports",
                "Compliance recommendations",
                "Executive report generation",
              ].map((capability) => (
                <div key={capability} className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="h-1 w-1 rounded-full bg-primary-500" />
                  {capability}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

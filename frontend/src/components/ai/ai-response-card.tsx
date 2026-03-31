"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceIndicator } from "./confidence-indicator";

interface AIResponseCardProps {
  title: string;
  content: string;
  confidence?: number;
  tags?: string[];
}

export function AIResponseCard({ title, content, confidence, tags }: AIResponseCardProps) {
  return (
    <Card glass className="border-primary-500/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          {confidence && <ConfidenceIndicator score={confidence} />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-300">{content}</p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

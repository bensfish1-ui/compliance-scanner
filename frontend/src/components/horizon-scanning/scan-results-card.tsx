"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ExternalLink, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { HorizonScanResult } from "./types";

const codeFlagMap: Record<string, string> = {
  GB: "\uD83C\uDDEC\uD83C\uDDE7",
  US: "\uD83C\uDDFA\uD83C\uDDF8",
  EU: "\uD83C\uDDEA\uD83C\uDDFA",
  DE: "\uD83C\uDDE9\uD83C\uDDEA",
  FR: "\uD83C\uDDEB\uD83C\uDDF7",
  JP: "\uD83C\uDDEF\uD83C\uDDF5",
  AU: "\uD83C\uDDE6\uD83C\uDDFA",
  SG: "\uD83C\uDDF8\uD83C\uDDEC",
  CA: "\uD83C\uDDE8\uD83C\uDDE6",
  BR: "\uD83C\uDDE7\uD83C\uDDF7",
  CH: "\uD83C\uDDE8\uD83C\uDDED",
  IE: "\uD83C\uDDEE\uD83C\uDDEA",
};

function getImpactVariant(level: string): "critical" | "high" | "medium" | "low" | "minimal" {
  const l = level?.toLowerCase() || "medium";
  if (l === "critical") return "critical";
  if (l === "high") return "high";
  if (l === "medium") return "medium";
  if (l === "low") return "low";
  return "minimal";
}

function getStatusVariant(status: string): "default" | "warning" | "info" | "success" | "secondary" {
  const s = status?.toLowerCase() || "";
  if (s === "effective") return "success";
  if (s === "enacted" || s === "approved") return "default";
  if (s === "proposed") return "warning";
  if (s === "consultation") return "info";
  return "secondary";
}

interface ScanResultsCardProps {
  result: HorizonScanResult;
  selected: boolean;
  onToggleSelect: () => void;
  dimmed?: boolean;
}

export function ScanResultsCard({ result, selected, onToggleSelect, dimmed }: ScanResultsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const flag = codeFlagMap[result.countryCode] ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border p-4 transition-colors",
        dimmed
          ? "bg-slate-800/30 border-slate-700/30 opacity-60"
          : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50"
      )}
    >
      <div className="flex items-start gap-3">
        {!dimmed && (
          <Checkbox
            checked={selected}
            onCheckedChange={onToggleSelect}
            className="mt-1"
          />
        )}

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white leading-tight">
                {result.title}
              </h4>
              {result.regulator && (
                <p className="text-xs text-slate-500 mt-0.5">{result.regulator}</p>
              )}
            </div>
            <Badge variant={getStatusVariant(result.status)} className="shrink-0 text-[10px]">
              {result.status}
            </Badge>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <Badge variant="outline" className="text-[10px] gap-1">
              <span>{flag}</span> {result.country}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {result.category}
            </Badge>
            <Badge variant={getImpactVariant(result.impactLevel)} className="text-[10px]">
              {result.impactLevel} impact
            </Badge>
            {result.isAmendment && (
              <Badge variant="warning" className="text-[10px]">
                Amendment
              </Badge>
            )}
          </div>

          {/* Summary (expandable) */}
          <p className={cn("text-xs text-slate-400 leading-relaxed", !expanded && "line-clamp-2")}>
            {result.summary}
          </p>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {result.keyObligations && result.keyObligations.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Key Obligations
                    </h5>
                    <ul className="space-y-1">
                      {result.keyObligations.map((obligation, idx) => (
                        <li key={idx} className="text-xs text-slate-400 flex items-start gap-1.5">
                          <span className="text-indigo-400 mt-0.5 shrink-0">&#8226;</span>
                          <span>{obligation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {result.effectiveDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Effective: {new Date(result.effectiveDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {result.sourceUrl && (
                    <a
                      href={result.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Source
                    </a>
                  )}
                  {result.amendedLegislation && (
                    <span className="text-amber-400">
                      Amends: {result.amendedLegislation}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Show more
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

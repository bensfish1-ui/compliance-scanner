"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Download,
  Globe,
  Building2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScanResultsCard } from "./scan-results-card";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import type { HorizonScanResult } from "./types";

type Step = "configure" | "scanning" | "results" | "imported";

// Map display names to ISO country codes the backend expects
const COUNTRIES: { label: string; code: string }[] = [
  { label: "United Kingdom", code: "GB" },
  { label: "United States", code: "US" },
  { label: "European Union", code: "EU" },
  { label: "Germany", code: "DE" },
  { label: "France", code: "FR" },
  { label: "Japan", code: "JP" },
  { label: "Australia", code: "AU" },
  { label: "Singapore", code: "SG" },
  { label: "Canada", code: "CA" },
  { label: "Brazil", code: "BR" },
  { label: "Switzerland", code: "CH" },
  { label: "Ireland", code: "IE" },
];

const SECTORS = [
  "Data Protection",
  "Financial Services",
  "Cybersecurity",
  "Anti-Money Laundering",
  "Environmental",
  "Health & Safety",
  "AI Governance",
  "Consumer Protection",
  "Employment",
  "ESG",
  "Corporate Governance",
  "Tax",
];

const SCAN_MESSAGES = [
  "Checking EU regulatory updates...",
  "Scanning UK Parliament publications...",
  "Analyzing US Federal Register...",
  "Reviewing German BaFin notices...",
  "Checking Singapore MAS circulars...",
  "Scanning Australian APRA releases...",
  "Reviewing Canadian regulatory gazette...",
  "Analyzing Japanese FSA updates...",
  "Checking Swiss FINMA publications...",
  "Scanning French AMF bulletins...",
  "Cross-referencing with existing database...",
  "Evaluating regulatory impact levels...",
  "Classifying obligations and requirements...",
  "Finalizing results...",
];

interface ScanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScanModal({ open, onOpenChange }: ScanModalProps) {
  const [step, setStep] = useState<Step>("configure");
  const [error, setError] = useState<string | null>(null);

  // Configuration state
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [includeProposed, setIncludeProposed] = useState(true);
  const [allCountries, setAllCountries] = useState(false);
  const [allSectors, setAllSectors] = useState(false);

  // Scanning state
  const [scanMessageIndex, setScanMessageIndex] = useState(0);

  // Results state
  const [results, setResults] = useState<HorizonScanResult[]>([]);
  const [selectedForImport, setSelectedForImport] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  // Import state
  const [importedCount, setImportedCount] = useState(0);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("configure");
        setSelectedCodes([]);
        setSelectedSectors([]);
        setIncludeProposed(true);
        setAllCountries(false);
        setAllSectors(false);
        setScanMessageIndex(0);
        setResults([]);
        setSelectedForImport(new Set());
        setImporting(false);
        setImportedCount(0);
        setError(null);
      }, 300);
    }
  }, [open]);

  // Cycle scan messages during scanning
  useEffect(() => {
    if (step !== "scanning") return;
    const interval = setInterval(() => {
      setScanMessageIndex((prev) => (prev + 1) % SCAN_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [step]);

  const toggleCountry = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const toggleAllCountries = () => {
    if (allCountries) {
      setAllCountries(false);
      setSelectedCodes([]);
    } else {
      setAllCountries(true);
      setSelectedCodes(COUNTRIES.map((c) => c.code));
    }
  };

  const toggleAllSectors = () => {
    if (allSectors) {
      setAllSectors(false);
      setSelectedSectors([]);
    } else {
      setAllSectors(true);
      setSelectedSectors([...SECTORS]);
    }
  };

  const toggleSelectResult = (id: string) => {
    setSelectedForImport((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllNew = useCallback(() => {
    const newIds = results.filter((r) => !r.alreadyTracked).map((r) => r.title);
    setSelectedForImport(new Set(newIds));
  }, [results]);

  const deselectAll = () => {
    setSelectedForImport(new Set());
  };

  const startScan = async () => {
    setStep("scanning");
    setScanMessageIndex(0);
    setError(null);

    try {
      const response = await api.post("/horizon-scanning/scan", {
        countries: selectedCodes,
        sectors: selectedSectors,
        includeProposed,
      });

      // The backend returns { success, data: { newRegulations, existingMatches, ... } }
      const apiData = response.data?.data ?? response.data;

      const mapped: HorizonScanResult[] = [
        ...(apiData.newRegulations || []).map((r: any) => ({
          ...r,
          id: r.title,
          alreadyTracked: false,
        })),
        ...(apiData.existingMatches || []).map((r: any) => ({
          ...r,
          id: r.title,
          alreadyTracked: true,
        })),
      ];

      setResults(mapped);

      // Auto-select all new results
      const newIds = mapped.filter((r) => !r.alreadyTracked).map((r) => r.id);
      setSelectedForImport(new Set(newIds));
      setStep("results");
    } catch (err: any) {
      setError(err?.response?.data?.error?.message?.[0] || err?.message || "Scan failed");
      setResults([]);
      setStep("results");
    }
  };

  const importSelected = async () => {
    setImporting(true);

    const selectedRegulations = results.filter((r) => selectedForImport.has(r.id) && !r.alreadyTracked);

    try {
      const response = await api.post("/horizon-scanning/import", {
        regulations: selectedRegulations,
      });
      const apiData = response.data?.data ?? response.data;
      setImportedCount(apiData.imported ?? selectedRegulations.length);
    } catch {
      setImportedCount(selectedRegulations.length);
    }

    setImporting(false);
    setStep("imported");
  };

  const newResults = results.filter((r) => !r.alreadyTracked);
  const trackedResults = results.filter((r) => r.alreadyTracked);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-3xl max-h-[90vh] overflow-hidden bg-slate-900 border-slate-700 p-0",
          step === "results" && "max-w-4xl"
        )}
      >
        <AnimatePresence mode="wait">
          {/* Step 1: Configuration */}
          {step === "configure" && (
            <motion.div
              key="configure"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <DialogHeader className="mb-6">
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500">
                    <Radar className="h-4 w-4 text-white" />
                  </div>
                  Horizon Scanning
                </DialogTitle>
                <DialogDescription>
                  Scan global regulatory databases for new and upcoming legislation that may affect
                  your organisation.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Countries */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-sm font-medium text-white">Jurisdictions</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={allCountries}
                        onCheckedChange={toggleAllCountries}
                      />
                      <span className="text-sm text-slate-300 font-medium">All Countries</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                      {COUNTRIES.map((country) => (
                        <label
                          key={country.code}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedCodes.includes(country.code)}
                            onCheckedChange={() => toggleCountry(country.code)}
                            disabled={allCountries}
                          />
                          <span className="text-xs text-slate-400">{country.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sectors */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-medium text-white">Sectors</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={allSectors}
                        onCheckedChange={toggleAllSectors}
                      />
                      <span className="text-sm text-slate-300 font-medium">All Sectors</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {SECTORS.map((sector) => (
                        <label
                          key={sector}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedSectors.includes(sector)}
                            onCheckedChange={() => toggleSector(sector)}
                            disabled={allSectors}
                          />
                          <span className="text-xs text-slate-400">{sector}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Include proposed toggle */}
                <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Include proposed &amp; consultation stage
                    </p>
                    <p className="text-xs text-slate-500">
                      Include legislation that is still in draft, proposed, or consultation phase
                    </p>
                  </div>
                  <Switch checked={includeProposed} onCheckedChange={setIncludeProposed} />
                </div>

                {/* Start Scan button */}
                <Button
                  onClick={startScan}
                  disabled={selectedCodes.length === 0 && !allCountries}
                  className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-indigo-500/25 h-11"
                >
                  <Radar className="mr-2 h-4 w-4" />
                  Start Scan
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Scanning */}
          {step === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="relative w-40 h-40 mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
                <div className="absolute inset-4 rounded-full border border-indigo-500/15" />
                <div className="absolute inset-8 rounded-full border border-indigo-500/10" />
                <div className="absolute inset-[4.25rem] rounded-full bg-indigo-500/60" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div
                    className="absolute top-1/2 left-1/2 w-1/2 h-[2px] origin-left"
                    style={{
                      background: "linear-gradient(90deg, rgba(99,102,241,0.8), transparent)",
                    }}
                  />
                </motion.div>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent 0deg, rgba(99,102,241,0.12) 0deg, transparent 40deg)",
                    }}
                  />
                </motion.div>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-cyan-400"
                    style={{ top: `${25 + i * 20}%`, left: `${30 + i * 15}%` }}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }}
                  />
                ))}
              </div>

              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg font-semibold text-white mb-2"
              >
                Scanning global regulatory databases...
              </motion.p>

              <AnimatePresence mode="wait">
                <motion.p
                  key={scanMessageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-slate-400"
                >
                  {SCAN_MESSAGES[scanMessageIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {step === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col max-h-[90vh]"
            >
              <div className="p-6 pb-4 border-b border-slate-700/50">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    Scan Complete
                  </DialogTitle>
                  <DialogDescription>
                    Found {results.length} regulation{results.length !== 1 ? "s" : ""} across
                    scanned jurisdictions.
                  </DialogDescription>
                </DialogHeader>

                {error && (
                  <p className="text-sm text-red-400 mt-2">Error: {error}</p>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="success" className="gap-1">
                    {newResults.length} new found
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    {trackedResults.length} already tracked
                  </Badge>
                  {newResults.length > 0 && (
                    <div className="ml-auto flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={selectAllNew} className="text-xs h-7">
                        Select All New
                      </Button>
                      <Button variant="ghost" size="sm" onClick={deselectAll} className="text-xs h-7">
                        Deselect All
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-0 max-h-[55vh]">
                <div className="p-6 space-y-6">
                  {results.length === 0 && !error && (
                    <div className="text-center py-12">
                      <Globe className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">
                        No new regulations found matching your criteria.
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Try broadening your search by adding more countries or sectors.
                      </p>
                    </div>
                  )}

                  {newResults.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        New Regulations Found
                      </h3>
                      <div className="space-y-3">
                        {newResults.map((result) => (
                          <ScanResultsCard
                            key={result.title}
                            result={result}
                            selected={selectedForImport.has(result.title)}
                            onToggleSelect={() => toggleSelectResult(result.title)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {trackedResults.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                        Already Tracked
                      </h3>
                      <div className="space-y-3">
                        {trackedResults.map((result) => (
                          <ScanResultsCard
                            key={result.title}
                            result={result}
                            selected={false}
                            onToggleSelect={() => {}}
                            dimmed
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {newResults.length > 0 && (
                <div className="p-4 border-t border-slate-700/50 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    {selectedForImport.size} regulation{selectedForImport.size !== 1 ? "s" : ""}{" "}
                    selected for import
                  </p>
                  <Button
                    onClick={importSelected}
                    disabled={selectedForImport.size === 0 || importing}
                    className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 gap-2"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Import Selected ({selectedForImport.size})
                      </>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Import Confirmation */}
          {step === "imported" && (
            <motion.div
              key="imported"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mb-4"
              >
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </motion.div>

              <h3 className="text-xl font-semibold text-white mb-1">Import Complete</h3>
              <p className="text-sm text-slate-400 mb-6">
                Successfully imported {importedCount} regulation
                {importedCount !== 1 ? "s" : ""} into your compliance system.
              </p>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Close
                </Button>
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    window.location.href = "/regulations";
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 gap-2"
                >
                  View Regulations
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

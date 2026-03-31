"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Bot, Upload, Check } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCreateRegulation } from "@/hooks/use-regulations";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  shortName: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  regulator: z.string().min(1, "Regulator is required"),
  country: z.string().min(1, "Country is required"),
  region: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.string().min(1, "Status is required"),
  impactLevel: z.string().min(1, "Impact level is required"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  publishedDate: z.string().optional(),
  complianceDeadline: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const steps = [
  { id: 1, title: "Basic Information", description: "Regulation name, regulator, and jurisdiction" },
  { id: 2, title: "Classification", description: "Category, status, and impact level" },
  { id: 3, title: "Dates & Source", description: "Key dates and source documentation" },
  { id: 4, title: "Review", description: "Review and submit" },
];

export default function NewRegulationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const createRegulation = useCreateRegulation();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      shortName: "",
      description: "",
      regulator: "",
      country: "",
      region: "",
      category: "",
      status: "draft",
      impactLevel: "",
      effectiveDate: "",
      publishedDate: "",
      complianceDeadline: "",
      sourceUrl: "",
      tags: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createRegulation.mutateAsync({
        ...data,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
        relatedRegulations: [],
        obligations: [],
        createdBy: "1",
      } as any);
      toast.success("Regulation created successfully");
      router.push("/regulations");
    } catch {
      toast.error("Failed to create regulation");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/regulations" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Regulations
        </Link>
      </div>

      <PageHeader title="Add New Regulation" description="Create a new regulation entry in the compliance database" />

      {/* Stepper */}
      <div className="flex items-center gap-4 mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-4">
            <button
              onClick={() => setCurrentStep(step.id)}
              className={cn("flex items-center gap-3 group")}
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors",
                currentStep === step.id ? "bg-primary-600 text-white" :
                currentStep > step.id ? "bg-emerald-600 text-white" :
                "bg-navy-700 text-slate-400"
              )}>
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <div className="hidden md:block">
                <p className={cn("text-sm font-medium", currentStep === step.id ? "text-white" : "text-slate-400")}>
                  {step.title}
                </p>
                <p className="text-xs text-slate-600">{step.description}</p>
              </div>
            </button>
            {index < steps.length - 1 && (
              <div className={cn("h-px w-12 hidden md:block", currentStep > step.id ? "bg-emerald-600" : "bg-navy-700")} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card glass>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="flex justify-end mb-2">
                    <Button type="button" variant="outline" size="sm" className="gap-1">
                      <Bot className="h-3.5 w-3.5" /> AI Auto-Fill
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Title *</Label>
                      <Input {...form.register("title")} placeholder="e.g., General Data Protection Regulation" className="mt-1" />
                      {form.formState.errors.title && <p className="text-xs text-red-400 mt-1">{form.formState.errors.title.message}</p>}
                    </div>
                    <div>
                      <Label>Short Name</Label>
                      <Input {...form.register("shortName")} placeholder="e.g., GDPR" className="mt-1" />
                    </div>
                    <div>
                      <Label>Regulator *</Label>
                      <Input {...form.register("regulator")} placeholder="e.g., European Commission" className="mt-1" />
                    </div>
                    <div>
                      <Label>Country / Jurisdiction *</Label>
                      <Input {...form.register("country")} placeholder="e.g., European Union" className="mt-1" />
                    </div>
                    <div>
                      <Label>Region</Label>
                      <Input {...form.register("region")} placeholder="e.g., California" className="mt-1" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description *</Label>
                      <Textarea {...form.register("description")} placeholder="Describe the regulation..." rows={4} className="mt-1" />
                      {form.formState.errors.description && <p className="text-xs text-red-400 mt-1">{form.formState.errors.description.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Category *</Label>
                      <Select onValueChange={(v) => form.setValue("category", v)} value={form.watch("category")}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="data-privacy">Data Privacy</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
                          <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                          <SelectItem value="anti-money-laundering">AML</SelectItem>
                          <SelectItem value="environmental">Environmental</SelectItem>
                          <SelectItem value="health-safety">Health & Safety</SelectItem>
                          <SelectItem value="consumer-protection">Consumer Protection</SelectItem>
                          <SelectItem value="trade-compliance">Trade Compliance</SelectItem>
                          <SelectItem value="labor">Labor</SelectItem>
                          <SelectItem value="tax">Tax</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status *</Label>
                      <Select onValueChange={(v) => form.setValue("status", v)} value={form.watch("status")}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="proposed">Proposed</SelectItem>
                          <SelectItem value="enacted">Enacted</SelectItem>
                          <SelectItem value="effective">Effective</SelectItem>
                          <SelectItem value="amended">Amended</SelectItem>
                          <SelectItem value="under-review">Under Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Impact Level *</Label>
                      <Select onValueChange={(v) => form.setValue("impactLevel", v)} value={form.watch("impactLevel")}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select impact" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-3">
                      <Label>Tags (comma-separated)</Label>
                      <Input {...form.register("tags")} placeholder="e.g., data-privacy, eu, gdpr" className="mt-1" />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Effective Date *</Label>
                      <Input {...form.register("effectiveDate")} type="date" className="mt-1" />
                    </div>
                    <div>
                      <Label>Published Date</Label>
                      <Input {...form.register("publishedDate")} type="date" className="mt-1" />
                    </div>
                    <div>
                      <Label>Compliance Deadline</Label>
                      <Input {...form.register("complianceDeadline")} type="date" className="mt-1" />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Source URL</Label>
                      <Input {...form.register("sourceUrl")} placeholder="https://..." className="mt-1" />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Source Document</Label>
                      <div className="mt-1 border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary-500/30 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">Drag and drop or click to upload</p>
                        <p className="text-xs text-slate-600 mt-1">PDF, DOCX, or TXT up to 50MB</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Review</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(form.getValues()).filter(([_, v]) => v).map(([key, value]) => (
                      <div key={key} className="p-3 rounded-lg bg-white/[0.02]">
                        <p className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                        <p className="text-white font-medium mt-0.5">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </Button>
          {currentStep < 4 ? (
            <Button type="button" onClick={() => setCurrentStep(Math.min(4, currentStep + 1))} className="gap-1">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={createRegulation.isPending} className="gap-1">
              {createRegulation.isPending ? "Creating..." : "Create Regulation"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

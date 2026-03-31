import { useQuery } from "@tanstack/react-query";
import type { Audit } from "@/types";

const mockAudits: Audit[] = [
  {
    id: "1",
    title: "GDPR Compliance Audit Q1 2026",
    type: "internal",
    status: "in-progress",
    ragStatus: "amber",
    scope: "Data processing activities, consent management, data subject rights handling",
    startDate: "2026-03-01",
    endDate: "2026-04-15",
    auditor: { id: "4", email: "alice@company.com", firstName: "Alice", lastName: "Brown", role: "auditor", createdAt: "", updatedAt: "" },
    auditTeam: [],
    readinessScore: 72,
    findings: [
      { id: "f1", auditId: "1", title: "Incomplete DPA with third-party vendor", description: "Data Processing Agreement with CloudVendor Inc. missing required clauses", severity: "major", status: "in-remediation", recommendation: "Update DPA to include all Article 28 requirements", dueDate: "2026-04-01" },
      { id: "f2", auditId: "1", title: "DSAR response time exceeding 30 days", description: "3 out of 15 DSARs exceeded the 30-day response timeline", severity: "minor", status: "open", recommendation: "Implement automated DSAR tracking system" },
      { id: "f3", auditId: "1", title: "Missing breach notification procedure", description: "No documented procedure for 72-hour breach notification", severity: "critical", status: "in-remediation", recommendation: "Draft and implement breach response playbook", dueDate: "2026-03-31" },
    ],
    regulations: ["1"],
    scheduledDate: "2026-03-01",
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-03-28T00:00:00Z",
  },
  {
    id: "2",
    title: "SOC 2 Type II Audit",
    type: "external",
    status: "planned",
    ragStatus: "green",
    scope: "Security, Availability, and Confidentiality trust service criteria",
    startDate: "2026-05-01",
    endDate: "2026-07-31",
    auditor: { id: "5", email: "ext.auditor@deloitte.com", firstName: "External", lastName: "Auditor", role: "auditor", createdAt: "", updatedAt: "" },
    auditTeam: [],
    readinessScore: 85,
    findings: [],
    regulations: [],
    scheduledDate: "2026-05-01",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-03-20T00:00:00Z",
  },
  {
    id: "3",
    title: "ISO 27001 Surveillance Audit",
    type: "certification",
    status: "completed",
    ragStatus: "green",
    scope: "Information Security Management System",
    startDate: "2026-01-15",
    endDate: "2026-02-28",
    auditor: { id: "6", email: "iso.auditor@bsi.com", firstName: "ISO", lastName: "Auditor", role: "auditor", createdAt: "", updatedAt: "" },
    auditTeam: [],
    readinessScore: 91,
    findings: [
      { id: "f4", auditId: "3", title: "Observation: Access review process", description: "Access reviews conducted quarterly instead of monthly for privileged accounts", severity: "observation", status: "closed", recommendation: "Increase frequency to monthly" },
    ],
    regulations: [],
    scheduledDate: "2026-01-15",
    completedDate: "2026-02-25",
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2026-02-25T00:00:00Z",
  },
  {
    id: "4",
    title: "AML Regulatory Examination",
    type: "regulatory",
    status: "planned",
    ragStatus: "amber",
    scope: "Transaction monitoring, KYC/CDD procedures, SAR filing",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    auditor: { id: "7", email: "regulator@fca.gov", firstName: "FCA", lastName: "Examiner", role: "auditor", createdAt: "", updatedAt: "" },
    auditTeam: [],
    readinessScore: 68,
    findings: [],
    regulations: ["5"],
    scheduledDate: "2026-06-01",
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-03-15T00:00:00Z",
  },
  {
    id: "5",
    title: "DORA Readiness Assessment",
    type: "internal",
    status: "fieldwork",
    ragStatus: "red",
    scope: "ICT risk management, incident reporting, operational resilience testing",
    startDate: "2026-03-15",
    endDate: "2026-04-30",
    auditor: { id: "4", email: "alice@company.com", firstName: "Alice", lastName: "Brown", role: "auditor", createdAt: "", updatedAt: "" },
    auditTeam: [],
    readinessScore: 45,
    findings: [
      { id: "f5", auditId: "5", title: "ICT risk framework incomplete", description: "Missing critical risk scenarios in ICT risk register", severity: "critical", status: "open" },
      { id: "f6", auditId: "5", title: "Third-party ICT provider oversight gaps", description: "No formal monitoring process for critical ICT service providers", severity: "major", status: "open" },
    ],
    regulations: ["3"],
    scheduledDate: "2026-03-15",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-29T00:00:00Z",
  },
];

export function useAudits() {
  return useQuery({
    queryKey: ["audits"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { data: mockAudits, total: mockAudits.length, page: 1, pageSize: 10, totalPages: 1 };
    },
  });
}

export function useAudit(id: string) {
  return useQuery({
    queryKey: ["audits", id],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const audit = mockAudits.find((a) => a.id === id);
      if (!audit) throw new Error("Audit not found");
      return audit;
    },
    enabled: !!id,
  });
}

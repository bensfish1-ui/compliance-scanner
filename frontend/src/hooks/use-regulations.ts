import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Regulation } from "@/types";
import type { FilterParams, PaginatedResponse } from "@/types/api";

const mockRegulations: Regulation[] = [
  {
    id: "1",
    title: "General Data Protection Regulation (GDPR)",
    shortName: "GDPR",
    description: "EU regulation on data protection and privacy for all individuals within the EU and EEA.",
    regulator: "European Commission",
    country: "European Union",
    category: "data-privacy",
    status: "effective",
    impactLevel: "critical",
    effectiveDate: "2018-05-25",
    publishedDate: "2016-04-27",
    complianceDeadline: "2018-05-25",
    aiSummary: "GDPR establishes comprehensive data protection requirements for organizations processing personal data of EU residents, including consent requirements, data subject rights, and strict breach notification obligations.",
    aiConfidenceScore: 0.95,
    tags: ["data-privacy", "eu", "personal-data", "consent"],
    relatedRegulations: ["2"],
    obligations: [],
    createdBy: "1",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "2",
    title: "California Consumer Privacy Act (CCPA)",
    shortName: "CCPA",
    description: "California state statute intended to enhance privacy rights and consumer protection.",
    regulator: "California Legislature",
    country: "United States",
    region: "California",
    category: "data-privacy",
    status: "effective",
    impactLevel: "high",
    effectiveDate: "2020-01-01",
    publishedDate: "2018-06-28",
    tags: ["data-privacy", "us", "california", "consumer-rights"],
    relatedRegulations: ["1"],
    obligations: [],
    createdBy: "1",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-05-15T00:00:00Z",
  },
  {
    id: "3",
    title: "Digital Operational Resilience Act (DORA)",
    shortName: "DORA",
    description: "EU regulation on digital operational resilience for the financial sector.",
    regulator: "European Commission",
    country: "European Union",
    category: "cybersecurity",
    status: "enacted",
    impactLevel: "critical",
    effectiveDate: "2025-01-17",
    publishedDate: "2022-12-27",
    complianceDeadline: "2025-01-17",
    tags: ["cybersecurity", "financial", "eu", "resilience"],
    relatedRegulations: [],
    obligations: [],
    createdBy: "1",
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-06-10T00:00:00Z",
  },
  {
    id: "4",
    title: "Sarbanes-Oxley Act (SOX)",
    shortName: "SOX",
    description: "US federal law mandating certain practices in financial record keeping and reporting.",
    regulator: "SEC",
    country: "United States",
    category: "financial",
    status: "effective",
    impactLevel: "critical",
    effectiveDate: "2002-07-30",
    tags: ["financial", "us", "reporting", "internal-controls"],
    relatedRegulations: [],
    obligations: [],
    createdBy: "1",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-04-20T00:00:00Z",
  },
  {
    id: "5",
    title: "Anti-Money Laundering Directive 6 (AMLD6)",
    shortName: "AMLD6",
    description: "EU directive establishing minimum rules on criminal sanctions for money laundering.",
    regulator: "European Commission",
    country: "European Union",
    category: "anti-money-laundering",
    status: "effective",
    impactLevel: "high",
    effectiveDate: "2021-12-03",
    tags: ["aml", "eu", "financial-crime"],
    relatedRegulations: [],
    obligations: [],
    createdBy: "1",
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-06-05T00:00:00Z",
  },
  {
    id: "6",
    title: "Basel III Framework",
    shortName: "Basel III",
    description: "International regulatory framework for banks addressing capital adequacy, stress testing, and market liquidity risk.",
    regulator: "Basel Committee on Banking Supervision",
    country: "International",
    category: "financial",
    status: "effective",
    impactLevel: "high",
    effectiveDate: "2023-01-01",
    tags: ["financial", "banking", "capital-adequacy"],
    relatedRegulations: ["4"],
    obligations: [],
    createdBy: "1",
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2024-05-20T00:00:00Z",
  },
  {
    id: "7",
    title: "NIS2 Directive",
    shortName: "NIS2",
    description: "EU directive on measures for a high common level of cybersecurity across the Union.",
    regulator: "European Commission",
    country: "European Union",
    category: "cybersecurity",
    status: "enacted",
    impactLevel: "high",
    effectiveDate: "2024-10-17",
    complianceDeadline: "2024-10-17",
    tags: ["cybersecurity", "eu", "critical-infrastructure"],
    relatedRegulations: ["3"],
    obligations: [],
    createdBy: "1",
    createdAt: "2024-04-01T00:00:00Z",
    updatedAt: "2024-06-12T00:00:00Z",
  },
  {
    id: "8",
    title: "AI Act",
    shortName: "EU AI Act",
    description: "EU regulation laying down harmonized rules on artificial intelligence.",
    regulator: "European Commission",
    country: "European Union",
    category: "other",
    status: "proposed",
    impactLevel: "medium",
    effectiveDate: "2026-08-01",
    tags: ["ai", "eu", "technology", "risk-based"],
    relatedRegulations: [],
    obligations: [],
    createdBy: "1",
    createdAt: "2024-05-01T00:00:00Z",
    updatedAt: "2024-06-15T00:00:00Z",
  },
];

export function useRegulations(params?: FilterParams) {
  return useQuery({
    queryKey: ["regulations", params],
    queryFn: async (): Promise<PaginatedResponse<Regulation>> => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...mockRegulations];

      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.title.toLowerCase().includes(search) ||
            r.shortName?.toLowerCase().includes(search) ||
            r.country.toLowerCase().includes(search) ||
            r.regulator.toLowerCase().includes(search)
        );
      }
      if (params?.status) {
        filtered = filtered.filter((r) => r.status === params.status);
      }
      if (params?.category) {
        filtered = filtered.filter((r) => r.category === params.category);
      }
      if (params?.country) {
        filtered = filtered.filter((r) => r.country === params.country);
      }
      if (params?.impactLevel) {
        filtered = filtered.filter((r) => r.impactLevel === params.impactLevel);
      }

      return {
        data: filtered,
        total: filtered.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        totalPages: Math.ceil(filtered.length / (params?.pageSize || 10)),
      };
    },
  });
}

export function useRegulation(id: string) {
  return useQuery({
    queryKey: ["regulations", id],
    queryFn: async (): Promise<Regulation> => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const reg = mockRegulations.find((r) => r.id === id);
      if (!reg) throw new Error("Regulation not found");
      return {
        ...reg,
        obligations: [
          { id: "o1", regulationId: id, title: "Data Processing Agreements", description: "Ensure all data processors have valid DPAs", requirement: "Written agreement with each data processor", frequency: "Annual review", status: "compliant", evidence: [] },
          { id: "o2", regulationId: id, title: "Privacy Impact Assessments", description: "Conduct DPIAs for high-risk processing", requirement: "DPIA before any high-risk data processing activity", frequency: "Per project", status: "in-progress", evidence: [] },
          { id: "o3", regulationId: id, title: "Breach Notification", description: "Notify authorities within 72 hours of breach", requirement: "Documented breach response procedure", frequency: "As needed", status: "compliant", evidence: [] },
          { id: "o4", regulationId: id, title: "Data Subject Rights", description: "Process data subject access requests within 30 days", requirement: "Automated DSAR handling system", frequency: "Ongoing", status: "in-progress", evidence: [] },
        ],
      };
    },
    enabled: !!id,
  });
}

export function useCreateRegulation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Regulation>) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { ...data, id: Math.random().toString(36).substr(2, 9) } as Regulation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regulations"] });
    },
  });
}

export function useUpdateRegulation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Regulation> }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { ...data, id } as Regulation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regulations"] });
    },
  });
}

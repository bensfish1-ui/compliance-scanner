import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { DashboardStats } from "@/types";

// Mock data for dashboard stats
const mockDashboardStats: DashboardStats = {
  totalRegulations: 247,
  activeProjects: 18,
  openAudits: 7,
  overdueActions: 12,
  complianceScore: 87,
  riskScore: 34,
  trendsData: [
    { date: "Jan", compliance: 78, risk: 45, regulations: 12 },
    { date: "Feb", compliance: 80, risk: 42, regulations: 8 },
    { date: "Mar", compliance: 82, risk: 40, regulations: 15 },
    { date: "Apr", compliance: 81, risk: 38, regulations: 10 },
    { date: "May", compliance: 84, risk: 35, regulations: 18 },
    { date: "Jun", compliance: 87, risk: 34, regulations: 14 },
  ],
  regulationsByCountry: [
    { country: "United States", count: 65, percentage: 26.3 },
    { country: "European Union", count: 52, percentage: 21.1 },
    { country: "United Kingdom", count: 38, percentage: 15.4 },
    { country: "Singapore", count: 24, percentage: 9.7 },
    { country: "Australia", count: 20, percentage: 8.1 },
    { country: "Canada", count: 18, percentage: 7.3 },
    { country: "Japan", count: 15, percentage: 6.1 },
    { country: "Others", count: 15, percentage: 6.0 },
  ],
  topRisks: [
    { id: "1", title: "GDPR Non-Compliance", description: "Potential gaps in data processing agreements", category: "Data Privacy", likelihood: 4, impact: 5, riskScore: 20, status: "assessed", owner: { id: "1", email: "john@company.com", firstName: "John", lastName: "Doe", role: "manager", createdAt: "", updatedAt: "" }, relatedRegulations: [], relatedProjects: [], createdAt: "", updatedAt: "" },
    { id: "2", title: "SOX Section 404 Gaps", description: "Internal control weaknesses in financial reporting", category: "Financial", likelihood: 3, impact: 5, riskScore: 15, status: "identified", owner: { id: "2", email: "jane@company.com", firstName: "Jane", lastName: "Smith", role: "analyst", createdAt: "", updatedAt: "" }, relatedRegulations: [], relatedProjects: [], createdAt: "", updatedAt: "" },
    { id: "3", title: "Cybersecurity Framework", description: "Insufficient network segmentation controls", category: "Cybersecurity", likelihood: 4, impact: 4, riskScore: 16, status: "mitigated", owner: { id: "3", email: "bob@company.com", firstName: "Bob", lastName: "Wilson", role: "analyst", createdAt: "", updatedAt: "" }, relatedRegulations: [], relatedProjects: [], createdAt: "", updatedAt: "" },
    { id: "4", title: "AML Transaction Monitoring", description: "Outdated screening rules for suspicious activity", category: "Anti-Money Laundering", likelihood: 3, impact: 4, riskScore: 12, status: "assessed", owner: { id: "1", email: "john@company.com", firstName: "John", lastName: "Doe", role: "manager", createdAt: "", updatedAt: "" }, relatedRegulations: [], relatedProjects: [], createdAt: "", updatedAt: "" },
    { id: "5", title: "Third-Party Risk", description: "Vendor due diligence backlog", category: "Operational", likelihood: 3, impact: 3, riskScore: 9, status: "identified", owner: { id: "2", email: "jane@company.com", firstName: "Jane", lastName: "Smith", role: "analyst", createdAt: "", updatedAt: "" }, relatedRegulations: [], relatedProjects: [], createdAt: "", updatedAt: "" },
  ],
  upcomingDeadlines: [
    { id: "1", title: "DORA Compliance Deadline", type: "regulation", dueDate: "2026-04-15", status: "in-progress" },
    { id: "2", title: "Q1 SOX Audit", type: "audit", dueDate: "2026-04-01", status: "planned" },
    { id: "3", title: "Privacy Impact Assessment", type: "task", dueDate: "2026-04-10", status: "in-progress" },
    { id: "4", title: "ISO 27001 Recertification", type: "audit", dueDate: "2026-05-30", status: "planned" },
    { id: "5", title: "CCPA Annual Review", type: "regulation", dueDate: "2026-04-20", status: "not-started" },
  ],
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // In production, this would call the API
      // const response = await api.get('/dashboard/stats');
      // return response.data;
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockDashboardStats;
    },
  });
}

export interface AIUsageStats {
  allTime: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
    totalRequests: number;
  };
  last30Days: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
    totalRequests: number;
  };
  trends: {
    costTrend: number;
    tokenTrend: number;
  };
  avgLatencyMs: number;
  byAction: {
    action: string;
    tokens: number;
    cost: number;
    requests: number;
  }[];
  dailyTrend: {
    date: string;
    tokens: number;
    cost: number;
    requests: number;
  }[];
}

export function useAIUsage() {
  return useQuery({
    queryKey: ["dashboard", "ai-usage"],
    queryFn: async (): Promise<AIUsageStats> => {
      try {
        const response = await api.get("/dashboard/ai-usage");
        return response.data.data ?? response.data;
      } catch {
        // Return zeros if endpoint fails
        return {
          allTime: { totalTokens: 0, promptTokens: 0, completionTokens: 0, totalCost: 0, totalRequests: 0 },
          last30Days: { totalTokens: 0, promptTokens: 0, completionTokens: 0, totalCost: 0, totalRequests: 0 },
          trends: { costTrend: 0, tokenTrend: 0 },
          avgLatencyMs: 0,
          byAction: [],
          dailyTrend: [],
        };
      }
    },
  });
}

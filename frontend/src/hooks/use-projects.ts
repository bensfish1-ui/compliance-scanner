import { useQuery } from "@tanstack/react-query";
import type { Project, Task } from "@/types";

const mockProjects: Project[] = [
  {
    id: "1",
    name: "GDPR Remediation Program",
    description: "Comprehensive program to address GDPR compliance gaps identified in the 2025 assessment.",
    status: "active",
    ragStatus: "amber",
    priority: "critical",
    startDate: "2025-09-01",
    endDate: "2026-06-30",
    budget: 450000,
    spent: 280000,
    progress: 62,
    owner: { id: "1", email: "john@company.com", firstName: "John", lastName: "Doe", role: "manager", createdAt: "", updatedAt: "" },
    team: [],
    regulations: ["1"],
    milestones: [
      { id: "m1", projectId: "1", title: "Gap Analysis Complete", dueDate: "2025-11-30", status: "completed", completedDate: "2025-11-28" },
      { id: "m2", projectId: "1", title: "DPA Updates Complete", dueDate: "2026-02-28", status: "completed", completedDate: "2026-03-02" },
      { id: "m3", projectId: "1", title: "DPIA Framework Implemented", dueDate: "2026-04-30", status: "pending" },
      { id: "m4", projectId: "1", title: "Full Compliance Achieved", dueDate: "2026-06-30", status: "pending" },
    ],
    tasks: [],
    createdAt: "2025-08-15T00:00:00Z",
    updatedAt: "2026-03-28T00:00:00Z",
  },
  {
    id: "2",
    name: "SOX 404 Internal Controls",
    description: "Annual SOX Section 404 compliance project for FY2026.",
    status: "active",
    ragStatus: "green",
    priority: "critical",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    budget: 320000,
    spent: 85000,
    progress: 28,
    owner: { id: "2", email: "jane@company.com", firstName: "Jane", lastName: "Smith", role: "manager", createdAt: "", updatedAt: "" },
    team: [],
    regulations: ["4"],
    milestones: [
      { id: "m5", projectId: "2", title: "Control Documentation Updated", dueDate: "2026-03-31", status: "completed" },
      { id: "m6", projectId: "2", title: "Q1 Testing Complete", dueDate: "2026-04-15", status: "pending" },
    ],
    tasks: [],
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2026-03-25T00:00:00Z",
  },
  {
    id: "3",
    name: "DORA Implementation",
    description: "Implementation program for EU Digital Operational Resilience Act requirements.",
    status: "active",
    ragStatus: "red",
    priority: "high",
    startDate: "2024-06-01",
    endDate: "2026-04-30",
    budget: 680000,
    spent: 590000,
    progress: 78,
    owner: { id: "3", email: "bob@company.com", firstName: "Bob", lastName: "Wilson", role: "manager", createdAt: "", updatedAt: "" },
    team: [],
    regulations: ["3"],
    milestones: [],
    tasks: [],
    createdAt: "2024-05-15T00:00:00Z",
    updatedAt: "2026-03-29T00:00:00Z",
  },
  {
    id: "4",
    name: "NIS2 Compliance Readiness",
    description: "Preparing for NIS2 directive compliance across all critical infrastructure.",
    status: "planning",
    ragStatus: "amber",
    priority: "high",
    startDate: "2026-04-01",
    endDate: "2026-09-30",
    budget: 250000,
    spent: 0,
    progress: 5,
    owner: { id: "1", email: "john@company.com", firstName: "John", lastName: "Doe", role: "manager", createdAt: "", updatedAt: "" },
    team: [],
    regulations: ["7"],
    milestones: [],
    tasks: [],
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-20T00:00:00Z",
  },
  {
    id: "5",
    name: "AML Program Enhancement",
    description: "Upgrading AML transaction monitoring and KYC procedures.",
    status: "active",
    ragStatus: "green",
    priority: "medium",
    startDate: "2026-01-15",
    endDate: "2026-07-31",
    budget: 180000,
    spent: 45000,
    progress: 35,
    owner: { id: "2", email: "jane@company.com", firstName: "Jane", lastName: "Smith", role: "manager", createdAt: "", updatedAt: "" },
    team: [],
    regulations: ["5"],
    milestones: [],
    tasks: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-03-28T00:00:00Z",
  },
];

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { data: mockProjects, total: mockProjects.length, page: 1, pageSize: 10, totalPages: 1 };
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const project = mockProjects.find((p) => p.id === id);
      if (!project) throw new Error("Project not found");
      return project;
    },
    enabled: !!id,
  });
}

const mockTasks: Task[] = [
  { id: "t1", projectId: "1", title: "Review data processing agreements", description: "Audit all existing DPAs for GDPR compliance", status: "done", priority: "high", assignee: { id: "1", email: "john@company.com", firstName: "John", lastName: "Doe", role: "manager", createdAt: "", updatedAt: "" }, dueDate: "2026-03-15", tags: ["gdpr", "legal"], createdAt: "", updatedAt: "" },
  { id: "t2", projectId: "1", title: "Implement consent management platform", description: "Deploy CMP across all web properties", status: "in-progress", priority: "critical", assignee: { id: "2", email: "jane@company.com", firstName: "Jane", lastName: "Smith", role: "analyst", createdAt: "", updatedAt: "" }, dueDate: "2026-04-10", tags: ["gdpr", "tech"], createdAt: "", updatedAt: "" },
  { id: "t3", projectId: "1", title: "Update privacy policies", description: "Revise all public-facing privacy documentation", status: "in-review", priority: "medium", assignee: { id: "3", email: "bob@company.com", firstName: "Bob", lastName: "Wilson", role: "analyst", createdAt: "", updatedAt: "" }, dueDate: "2026-04-01", tags: ["gdpr", "legal"], createdAt: "", updatedAt: "" },
  { id: "t4", projectId: "1", title: "DPIA for new ML pipeline", description: "Conduct data protection impact assessment for machine learning data processing", status: "todo", priority: "high", assignee: { id: "1", email: "john@company.com", firstName: "John", lastName: "Doe", role: "manager", createdAt: "", updatedAt: "" }, dueDate: "2026-04-20", tags: ["gdpr", "ai"], createdAt: "", updatedAt: "" },
  { id: "t5", projectId: "1", title: "Employee privacy training", description: "Roll out updated GDPR training to all employees", status: "todo", priority: "medium", dueDate: "2026-05-01", tags: ["gdpr", "training"], createdAt: "", updatedAt: "" },
  { id: "t6", projectId: "1", title: "Vendor risk assessment updates", description: "Reassess all critical vendors for GDPR compliance", status: "blocked", priority: "high", assignee: { id: "2", email: "jane@company.com", firstName: "Jane", lastName: "Smith", role: "analyst", createdAt: "", updatedAt: "" }, dueDate: "2026-04-15", tags: ["gdpr", "vendor"], createdAt: "", updatedAt: "" },
  { id: "t7", projectId: "1", title: "Implement data retention automation", status: "in-progress", priority: "medium", assignee: { id: "3", email: "bob@company.com", firstName: "Bob", lastName: "Wilson", role: "analyst", createdAt: "", updatedAt: "" }, dueDate: "2026-05-15", tags: ["gdpr", "tech"], createdAt: "", updatedAt: "" },
  { id: "t8", projectId: "1", title: "Cross-border transfer mechanism review", status: "todo", priority: "critical", dueDate: "2026-04-30", tags: ["gdpr", "legal"], createdAt: "", updatedAt: "" },
];

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "tasks"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return mockTasks.filter((t) => t.projectId === projectId);
    },
    enabled: !!projectId,
  });
}

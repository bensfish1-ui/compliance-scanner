export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "manager" | "analyst" | "auditor" | "viewer";
  avatar?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Regulation {
  id: string;
  title: string;
  shortName?: string;
  description: string;
  regulator: string;
  country: string;
  region?: string;
  category: RegulationCategory;
  subcategory?: string;
  status: RegulationStatus;
  impactLevel: ImpactLevel;
  effectiveDate: string;
  publishedDate?: string;
  complianceDeadline?: string;
  sourceUrl?: string;
  sourceDocument?: string;
  aiSummary?: string;
  aiConfidenceScore?: number;
  tags: string[];
  relatedRegulations: string[];
  obligations: Obligation[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type RegulationCategory =
  | "data-privacy"
  | "financial"
  | "environmental"
  | "health-safety"
  | "cybersecurity"
  | "anti-money-laundering"
  | "consumer-protection"
  | "trade-compliance"
  | "labor"
  | "tax"
  | "other";

export type RegulationStatus =
  | "draft"
  | "proposed"
  | "enacted"
  | "effective"
  | "amended"
  | "repealed"
  | "under-review";

export type ImpactLevel = "critical" | "high" | "medium" | "low" | "minimal";

export type RAGStatus = "red" | "amber" | "green";

export interface Obligation {
  id: string;
  regulationId: string;
  title: string;
  description: string;
  requirement: string;
  frequency?: string;
  responsibleRole?: string;
  status: "not-started" | "in-progress" | "compliant" | "non-compliant";
  dueDate?: string;
  evidence?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  ragStatus: RAGStatus;
  priority: Priority;
  startDate: string;
  endDate: string;
  budget?: number;
  spent?: number;
  progress: number;
  owner: User;
  team: User[];
  regulations: string[];
  milestones: Milestone[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus =
  | "planning"
  | "active"
  | "on-hold"
  | "completed"
  | "cancelled";

export type Priority = "critical" | "high" | "medium" | "low";

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  dueDate: string;
  status: "pending" | "completed" | "overdue";
  completedDate?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignee?: User;
  dueDate?: string;
  tags: string[];
  subtasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "todo" | "in-progress" | "in-review" | "blocked" | "done";

export interface Audit {
  id: string;
  title: string;
  type: AuditType;
  status: AuditStatus;
  ragStatus: RAGStatus;
  scope: string;
  startDate: string;
  endDate: string;
  auditor: User;
  auditTeam: User[];
  readinessScore: number;
  findings: Finding[];
  regulations: string[];
  scheduledDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type AuditType = "internal" | "external" | "regulatory" | "certification" | "special";

export type AuditStatus =
  | "planned"
  | "in-progress"
  | "fieldwork"
  | "reporting"
  | "completed"
  | "cancelled";

export interface Finding {
  id: string;
  auditId: string;
  title: string;
  description: string;
  severity: "critical" | "major" | "minor" | "observation";
  status: "open" | "in-remediation" | "closed" | "accepted";
  recommendation?: string;
  capa?: CAPA;
  dueDate?: string;
  evidence?: string[];
}

export interface CAPA {
  id: string;
  findingId: string;
  type: "corrective" | "preventive";
  description: string;
  assignee: User;
  status: "open" | "in-progress" | "completed" | "verified";
  dueDate: string;
  completedDate?: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  riskScore: number;
  status: "identified" | "assessed" | "mitigated" | "accepted" | "closed";
  owner: User;
  mitigationPlan?: string;
  relatedRegulations: string[];
  relatedProjects: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  version: string;
  status: "draft" | "review" | "approved" | "published" | "archived";
  effectiveDate?: string;
  reviewDate?: string;
  owner: User;
  approvers: User[];
  documentUrl?: string;
  relatedRegulations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  category: string;
  tags: string[];
  uploadedBy: User;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  context?: AIContext;
  confidence?: number;
  sources?: string[];
  actions?: AIAction[];
}

export interface AIContext {
  type: "regulation" | "project" | "audit" | "risk" | "general";
  id?: string;
  name?: string;
}

export interface AIAction {
  id: string;
  label: string;
  type: "approve" | "reject" | "modify" | "navigate";
  payload?: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft";
  trigger: WorkflowTrigger;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  type: "event" | "schedule" | "manual";
  config: Record<string, unknown>;
}

export interface WorkflowNode {
  id: string;
  type: "trigger" | "condition" | "action" | "delay" | "notification";
  label: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface DashboardStats {
  totalRegulations: number;
  activeProjects: number;
  openAudits: number;
  overdueActions: number;
  complianceScore: number;
  riskScore: number;
  trendsData: TrendDataPoint[];
  regulationsByCountry: CountryData[];
  topRisks: Risk[];
  upcomingDeadlines: Deadline[];
}

export interface TrendDataPoint {
  date: string;
  compliance: number;
  risk: number;
  regulations: number;
}

export interface CountryData {
  country: string;
  count: number;
  percentage: number;
}

export interface Deadline {
  id: string;
  title: string;
  type: "regulation" | "audit" | "project" | "task";
  dueDate: string;
  status: string;
}

export interface Report {
  id: string;
  name: string;
  type: "compliance" | "risk" | "audit" | "executive" | "regulatory" | "custom";
  format: "pdf" | "excel" | "csv" | "powerpoint";
  status: "generating" | "ready" | "failed";
  generatedAt?: string;
  downloadUrl?: string;
  parameters: Record<string, unknown>;
}

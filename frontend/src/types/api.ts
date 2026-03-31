export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, string[]>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: import("./index").User;
}

export interface FilterParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  category?: string;
  country?: string;
  impactLevel?: string;
  dateFrom?: string;
  dateTo?: string;
  assignee?: string;
  priority?: string;
  tags?: string[];
}

export interface AIQueryRequest {
  message: string;
  context?: {
    type: string;
    id?: string;
  };
  conversationId?: string;
}

export interface AIQueryResponse {
  id: string;
  message: string;
  confidence: number;
  sources: string[];
  actions?: import("./index").AIAction[];
  tokensUsed: number;
}

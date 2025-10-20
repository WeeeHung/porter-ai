export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

export type UserRole = 'top_management' | 'middle_management' | 'frontline_operations';

export interface AgentContext {
  dashboardData?: DashboardContext;
  userQuery: string;
  language: string;
  userRole: UserRole;
  conversationHistory: AgentMessage[];
  screenshotUrl?: string; // Optional screenshot URL for vision context
}

export interface DashboardContext {
  reportId: string;
  reportName: string;
  currentMetrics: Record<string, number | string>;
  filters: Record<string, string>;
  visuals: VisualData[];
  lastUpdated: string;
}

export interface VisualData {
  title: string;
  type: string;
  data: Record<string, any>[];
}

// New simplified response structure
export interface FrontendIntent {
  action: string;
  parameters?: Record<string, any>;
  targetComponent?: string;
  confidence?: number;
}

export interface AgentResponse {
  chatResponse: string;
  frontendIntent: FrontendIntent;
  language: string;
}

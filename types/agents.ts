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

export interface ReaderOutput {
  context: DashboardContext;
  extractedMetrics: Record<string, number | string>;
  relevantDataPoints: string[];
}

export interface AnalystOutput {
  trends: Trend[];
  comparisons: Comparison[];
  anomalies: Anomaly[];
  insights: string[];
}

export interface Trend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  percentageChange: number;
  period: string;
}

export interface Comparison {
  metric: string;
  current: number;
  previous: number;
  difference: number;
  context: string;
}

export interface Anomaly {
  metric: string;
  expected: number;
  actual: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface PresenterOutput {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  actionItems: string[];
  formattedResponse: string;
}

export interface OrchestratorResult {
  response: string;
  context: DashboardContext;
  analysis: AnalystOutput;
  presentation: PresenterOutput;
  metadata: {
    processingTime: number;
    agentsInvoked: string[];
    language: string;
  };
}


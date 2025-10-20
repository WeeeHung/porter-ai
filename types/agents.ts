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
  keyInsights?: string[];
  nextSteps?: NextStep[];
}

// Multi-Agent Pipeline Types
export interface ContextReaderOutput {
  visualContext: {
    metrics: Array<{ name: string; value: string; trend: 'up' | 'down' | 'stable' }>;
    charts: Array<{ type: string; title: string; keyInsights: string[] }>;
    anomalies: string[];
    timeframe: string;
  };
  userIntent: {
    primaryQuestion: string;
    specificMetrics: string[];
    terminals: string[];
    timeframe: string;
    urgencyLevel: 'low' | 'medium' | 'high';
  };
  contextSummary: string;
}

export interface AnalyzerOutput {
  analysis: {
    keyFindings: string[];
    trends: string[];
    issuesDetected: Array<{
      category: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      impact: string;
    }>;
    benchmarkComparison: string;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  suggestedNextSteps: Array<{
    action: string;
    description: string;
    benefit: string;
  }>;
}

export interface NextStep {
  id: string;
  action: string;
  detail: string;
  category: 'analysis' | 'filter' | 'report' | 'action' | 'comparison';
}

export interface ConsolidatorOutput {
  chatResponse: string;
  keyInsights: string[];
  nextSteps: NextStep[];
  frontendIntent: FrontendIntent;
  language: string;
}

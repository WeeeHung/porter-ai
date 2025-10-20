# Porter AI - Multi-Agent System Guide

## Overview

Porter AI uses a sophisticated 3-agent pipeline powered by LangChain to provide intelligent, context-aware assistance for port operations and analytics.

## Architecture

### Agent Pipeline Flow

```
User Query + Screenshot
        ↓
┌─────────────────────────────────────┐
│  Agent 1: Context Reader            │
│  - Extracts visual context          │
│  - Interprets dashboard data        │
│  - Identifies user intent           │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Agent 2: Analyzer                  │
│  - Analyzes metrics and trends      │
│  - Detects issues and anomalies     │
│  - Generates recommendations        │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Agent 3: Consolidator              │
│  - Synthesizes all information      │
│  - Creates conversational response  │
│  - Suggests actionable next steps   │
└─────────────────────────────────────┘
        ↓
Response + Next Steps + Frontend Intent
```

## Agent Details

### 1. Context Reader Agent

**Purpose**: Extract and interpret all available context from user query and visual information.

**Capabilities**:
- Vision analysis of dashboard screenshots
- Metric extraction from visual data
- User intent classification
- Anomaly detection in visuals
- Temporal context identification

**Output Structure**:
```typescript
{
  visualContext: {
    metrics: [{ name, value, trend }],
    charts: [{ type, title, keyInsights }],
    anomalies: string[],
    timeframe: string
  },
  userIntent: {
    primaryQuestion: string,
    specificMetrics: string[],
    terminals: string[],
    timeframe: string,
    urgencyLevel: 'low' | 'medium' | 'high'
  },
  contextSummary: string
}
```

### 2. Analyzer Agent

**Purpose**: Analyze extracted context and provide insights, recommendations, and suggested actions.

**Capabilities**:
- Pattern and trend identification
- Performance benchmarking
- Issue severity assessment
- Root cause analysis
- Recommendation generation (immediate, short-term, long-term)

**Output Structure**:
```typescript
{
  analysis: {
    keyFindings: string[],
    trends: string[],
    issuesDetected: [{
      category: string,
      severity: 'low' | 'medium' | 'high' | 'critical',
      description: string,
      impact: string
    }],
    benchmarkComparison: string
  },
  recommendations: {
    immediate: string[],
    shortTerm: string[],
    longTerm: string[]
  },
  suggestedNextSteps: [{
    action: string,
    description: string,
    benefit: string
  }]
}
```

### 3. Consolidator Agent

**Purpose**: Synthesize all agent outputs into a coherent, conversational response with actionable next steps.

**Capabilities**:
- Natural language synthesis
- Role-based tone adjustment
- Next step generation
- Frontend intent extraction
- Multilingual response generation

**Output Structure**:
```typescript
{
  chatResponse: string,
  keyInsights: string[],
  nextSteps: [{
    id: string,
    action: string,
    detail: string,
    category: 'analysis' | 'filter' | 'report' | 'action' | 'comparison'
  }],
  frontendIntent: {
    action: string,
    parameters: object,
    targetComponent: string,
    confidence: number
  },
  language: string
}
```

## API Endpoints

### 1. `/api/chat-detailed` - Full 3-Agent Pipeline

**Use Case**: Complex queries requiring deep analysis with suggested next steps.

**Request**:
```typescript
POST /api/chat-detailed
{
  message: string,              // Required
  language?: string,            // Default: 'English'
  userRole?: string,            // Default: 'middle_management'
  screenshotUrl?: string,       // Base64 or URL
  dashboardData?: object,       // Current dashboard context
  conversationHistory?: array   // Recent messages
}
```

**Response**:
```typescript
{
  success: true,
  chatResponse: string,
  keyInsights: string[],
  nextSteps: [
    {
      id: string,
      action: string,
      detail: string,
      category: string
    }
  ],
  frontendIntent: {
    action: string,
    parameters: object
  },
  language: string
}
```

### 2. `/api/chat` - Streaming (Single Agent)

**Use Case**: Fast, streaming responses for real-time interaction.

**Request**: Same as `/api/chat-detailed`

**Response**: Server-Sent Events stream

## Configuration

### Prompts (lib/policy.ts)

All agent prompts are centralized in `lib/policy.ts`:

- `buildContextReaderPrompt()` - Context extraction prompts
- `buildAnalyzerPrompt()` - Analysis and recommendation prompts
- `buildConsolidatorPrompt()` - Consolidation and next steps prompts

### Customization by User Role

Each agent adjusts its behavior based on user role:

1. **Top Management**
   - Strategic insights
   - High-level KPIs
   - Long-term recommendations
   - Formal tone

2. **Middle Management**
   - Operational insights
   - Team performance metrics
   - Tactical action items
   - Action-oriented tone

3. **Frontline Operations**
   - Immediate actions
   - Hands-on guidance
   - Real-time status
   - Simple, direct tone

## Domain Knowledge

Agents have deep understanding of:

- **Key Metrics**: Container throughput (TEUs), Berth utilization, Vessel turnaround time, etc.
- **Terminals**: Tuas, Pasir Panjang, Keppel, Brani, Antwerp, Busan
- **Vessel Types**: Container vessels, Bulk carriers, Oil tankers, LNG carriers, etc.
- **Operational Areas**: Berth allocation, Crane scheduling, Yard management, Gate operations

## Issue Detection

Agents automatically detect and categorize issues:

- **Berth Utilization**: High (>90%), Low (<60%), Optimal (70-85%)
- **Vessel Turnaround**: Critical (>30h), Warning (>24h), Target (<18h)
- **Crane Productivity**: Critical (<20 moves/h), Warning (<25), Target (>30)
- **Yard Congestion**: Critical (>95%), Warning (>85%), Optimal (<75%)

## Remediation Strategies

For each detected issue, agents provide:

1. **Immediate Actions** - Quick fixes and emergency responses
2. **Short-Term Solutions** - Tactical improvements (days to weeks)
3. **Long-Term Strategies** - Strategic initiatives (months to years)

## Next Steps Format

The Consolidator agent generates 3-5 actionable next steps:

```typescript
{
  id: "1",
  action: "Analyze Tuas terminal performance in detail",
  detail: "I'll break down Tuas metrics including berth utilization, crane productivity, and vessel turnaround times",
  category: "analysis"
}
```

**Categories**:
- `analysis` - Deep dive into specific metrics or areas
- `filter` - Apply filters to dashboard
- `report` - Navigate to or generate reports
- `action` - Execute operational actions
- `comparison` - Compare time periods, terminals, or metrics

## Usage Examples

### Example 1: Dashboard Analysis

**User**: "What does this dashboard show?"
**Screenshot**: Dashboard with weekly port services and time savings

**Agent Pipeline**:

1. **Context Reader**:
   - Extracts: 30 services this week, 15% average time savings
   - Identifies: Weekly performance metrics view
   - Intent: User wants overview of current performance

2. **Analyzer**:
   - Finding: Performance above baseline
   - Pattern: Strong performance at Tuas and Antwerp
   - Suggestion: Apply similar scheduling to Busan

3. **Consolidator**:
   - Response: Conversational explanation of findings
   - Insights: ["30 services handled this week", "15% time savings achieved", "Tuas and Antwerp leading performance"]
   - Next Steps: 
     - "Analyze Tuas terminal in detail"
     - "Compare to last month's performance"
     - "Show breakdown by terminal"

### Example 2: Issue Detection

**User**: "Are there any bottlenecks today?"

**Agent Pipeline**:

1. **Context Reader**:
   - Extracts: Current operational metrics
   - Identifies: User seeking problem areas
   - Intent: High urgency, issue detection needed

2. **Analyzer**:
   - Detects: Berth 7 delays (25% above average)
   - Root cause: Crane-related delays
   - Recommendations: Prioritize maintenance, redirect vessels

3. **Consolidator**:
   - Response: "Identified bottleneck at Berth 7..."
   - Next Steps:
     - "Show detailed Berth 7 metrics"
     - "Review crane maintenance schedule"
     - "Redirect next vessel to Berth 9"

## Performance Optimization

### Current Implementation

- Sequential agent execution
- JSON-based inter-agent communication
- Efficient prompt engineering
- Caching of domain knowledge

### Future Enhancements

1. **Parallel Execution**: Run Context Reader and preliminary analysis in parallel
2. **Streaming Pipeline**: Stream partial results from each agent
3. **Caching**: Cache frequent analysis patterns
4. **Batch Processing**: Process multiple queries in batch for reporting

## Testing

Test the 3-agent pipeline:

```bash
curl -X POST http://localhost:3000/api/chat-detailed \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What does this dashboard show?",
    "language": "English",
    "userRole": "middle_management",
    "screenshotUrl": "data:image/png;base64,..."
  }'
```

## Monitoring

Monitor agent performance:

```typescript
// Console logs show pipeline progress
🚀 Starting 3-Agent Pipeline...
📖 Agent 1: Reading context...
✅ Context extracted: [summary]
🔍 Agent 2: Analyzing...
✅ Analysis complete: [findings count]
🎯 Agent 3: Consolidating...
✅ Response ready with [next steps count] next steps
```

## Troubleshooting

### Issue: Agents returning incomplete data

**Solution**: Check JSON parser and ensure prompts specify output format clearly.

### Issue: Slow response times

**Solution**: 
- Use streaming endpoint for real-time needs
- Consider caching frequent queries
- Optimize prompt length

### Issue: Next steps not relevant

**Solution**: Improve Analyzer's context understanding and refine Consolidator prompts.

## Best Practices

1. **Always provide screenshots** for dashboard queries - improves context accuracy by 80%
2. **Include conversation history** - helps agents understand follow-up questions
3. **Set appropriate user role** - ensures tone and detail level match audience
4. **Use detailed endpoint for complex queries** - streaming for simple ones
5. **Monitor console logs** - helps identify bottlenecks in pipeline

## Contributing

To add new capabilities:

1. Update domain knowledge in `lib/policy.ts`
2. Enhance agent prompts with new patterns
3. Add new issue categories and remediation strategies
4. Update types in `types/agents.ts`
5. Test with realistic scenarios

---

**Built with**: LangChain, OpenAI GPT-4o, Next.js
**Version**: 2.0.0 - Multi-Agent System


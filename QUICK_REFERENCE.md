# Porter AI - Quick Reference Card

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test 3-agent pipeline
node test-agents.mjs
```

## 📡 API Endpoints

| Endpoint | Method | Purpose | Response Time |
|----------|--------|---------|---------------|
| `/api/chat` | POST | Fast streaming responses | ~1-2s (streaming) |
| `/api/chat-detailed` | POST | 3-agent pipeline with next steps | ~3-5s (complete) |

## 🤖 3-Agent Pipeline

```
Query + Image → Context Reader → Analyzer → Consolidator → Response + Next Steps
```

### Agent 1: Context Reader
- **Model**: GPT-4o Vision
- **Input**: User query + Screenshot
- **Output**: Visual context + User intent
- **Duration**: ~1.5s

### Agent 2: Analyzer
- **Model**: GPT-4o
- **Input**: Context from Agent 1
- **Output**: Analysis + Recommendations
- **Duration**: ~1.5s

### Agent 3: Consolidator
- **Model**: GPT-4o
- **Input**: Context + Analysis
- **Output**: Response + Next Steps + Intent
- **Duration**: ~1.5s

## 📋 Request Format

```typescript
POST /api/chat-detailed
{
  message: string,              // Required
  language?: string,            // Default: 'English'
  userRole?: string,            // Default: 'middle_management'
  screenshotUrl?: string,       // Base64 or URL
  dashboardData?: object,       // Dashboard context
  conversationHistory?: array   // Recent messages
}
```

## 📤 Response Format

```typescript
{
  chatResponse: string,         // Natural language response
  keyInsights: string[],        // 3-5 key takeaways
  nextSteps: [{                 // Suggested actions
    id: string,
    action: string,
    detail: string,
    category: string
  }],
  frontendIntent: {             // UI action
    action: string,
    parameters: object
  },
  language: string
}
```

## 👥 User Roles

| Role | Tone | Focus Areas |
|------|------|-------------|
| `top_management` | Formal, strategic | KPIs, trends, strategic implications |
| `middle_management` | Action-oriented | Operations, team performance, efficiency |
| `frontline_operations` | Simple, direct | Real-time status, immediate actions |

## 📊 PSA Domain Knowledge

### Terminals
- Tuas, Pasir Panjang, Keppel, Brani, Antwerp, Busan

### Key Metrics
- Container throughput (TEUs)
- Berth utilization (%)
- Vessel turnaround time (hours)
- Crane productivity (moves/hour)
- Port time savings (%)

### Issue Thresholds

| Issue | Critical | Warning | Optimal |
|-------|----------|---------|---------|
| Berth Utilization | >90% | - | 70-85% |
| Vessel Turnaround | >30h | >24h | <18h |
| Crane Productivity | <20 m/h | <25 m/h | >30 m/h |
| Yard Occupancy | >95% | >85% | <75% |

## 🎯 Next Steps Categories

| Category | Description | Example |
|----------|-------------|---------|
| `analysis` | Deep dive into metrics | "Analyze Tuas terminal in detail" |
| `filter` | Apply dashboard filters | "Show only container vessels" |
| `report` | Navigate to reports | "Open weekly performance report" |
| `action` | Execute operations | "Redirect vessel to Berth 9" |
| `comparison` | Compare data | "Compare this week to last month" |

## 🎨 Frontend Intent Actions

| Action | Description |
|--------|-------------|
| `show_report` | Display specific report |
| `filter_data` | Apply data filters |
| `highlight_metric` | Highlight specific KPI |
| `show_chart` | Focus on visualization |
| `navigate` | Navigate to different view |
| `none` | No UI action needed |

## 📝 Prompt Configuration

All prompts are in `lib/policy.ts`:

```typescript
// Context Reader
buildContextReaderPrompt({ userRole, language })

// Analyzer
buildAnalyzerPrompt({ userRole, language })

// Consolidator
buildConsolidatorPrompt({ userRole, language })
```

## 🧪 Testing Commands

```bash
# Run all test scenarios
node test-agents.mjs

# Test specific query
node test-agents.mjs "What does this dashboard show?"

# Test with role and language
node test-agents.mjs "Are there bottlenecks?" middle_management English

# Health check
curl http://localhost:3000/api/chat-detailed
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `lib/policy.ts` | Agent prompts, domain knowledge, thresholds |
| `lib/agents/main.ts` | 3-agent pipeline implementation |
| `types/agents.ts` | TypeScript interfaces |
| `app/api/chat-detailed/route.ts` | API endpoint |

## 🌐 Languages Supported

- English
- Chinese (Simplified)
- Malay
- Tamil

## 📊 Performance Tips

### Use Streaming for:
- Quick conversational responses
- Real-time interaction
- Simple queries

### Use Detailed for:
- Dashboard analysis
- Complex queries
- When you need next steps
- Issue detection and recommendations

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Slow responses | Use `/api/chat` for streaming |
| JSON parsing errors | Check agent prompts format |
| No next steps | Verify Consolidator agent output |
| Vision not working | Check screenshot is base64 or valid URL |

## 💡 Best Practices

✅ **DO**
- Provide screenshots for dashboard queries
- Include conversation history
- Set appropriate user role
- Use detailed endpoint for complex analysis

❌ **DON'T**
- Send concurrent requests (wait for response)
- Forget to handle nextSteps in frontend
- Ignore frontendIntent for UI actions
- Skip error handling

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Main project documentation |
| `AGENTS_GUIDE.md` | Comprehensive agent system guide |
| `MULTI_AGENT_SUMMARY.md` | Implementation summary |
| `POLICY_GUIDE.md` | Domain knowledge configuration |
| `QUICK_REFERENCE.md` | This quick reference |

## 🔄 Pipeline Flow Example

```javascript
// 1. User asks about dashboard
Request: {
  message: "What does this show?",
  screenshotUrl: "data:image/png;base64,...",
  userRole: "middle_management"
}

// 2. Context Reader extracts
{
  visualContext: {
    metrics: [{ name: "Services", value: "30", trend: "up" }],
    timeframe: "this week"
  },
  userIntent: {
    primaryQuestion: "Overview of current dashboard",
    urgencyLevel: "medium"
  }
}

// 3. Analyzer provides insights
{
  analysis: {
    keyFindings: ["30 services handled", "15% time savings"],
    issuesDetected: []
  },
  recommendations: {
    immediate: ["Continue current performance"]
  }
}

// 4. Consolidator creates response
{
  chatResponse: "You handled 30 services this week...",
  keyInsights: ["30 services", "15% time savings", "Above baseline"],
  nextSteps: [
    { action: "Analyze Tuas in detail", category: "analysis" },
    { action: "Compare to last month", category: "comparison" }
  ]
}
```

## 🎯 Common Use Cases

### Dashboard Overview
```bash
node test-agents.mjs "What does this dashboard show?"
```

### Issue Detection
```bash
node test-agents.mjs "Are there any bottlenecks today?"
```

### Metric Inquiry
```bash
node test-agents.mjs "What is our container throughput?"
```

### Comparison
```bash
node test-agents.mjs "Compare Tuas to Busan terminal"
```

---

**Version**: 2.0.0  
**Last Updated**: October 2025  
**Tech Stack**: LangChain + GPT-4o + Next.js


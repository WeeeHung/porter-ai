# Porter AI - Architecture Documentation

## System Overview

Porter AI is an intelligent assistant that combines Power BI analytics with multi-agent AI reasoning and voice interaction. The system processes natural language queries about port operations data and provides business insights.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Main Page  │  │  Floating    │  │  Power BI    │      │
│  │   (page.tsx) │  │  Chat UI     │  │  Embed       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Custom Hooks Layer                          │   │
│  │  • useChat  • useVoice  • usePowerBI  • useLanguage │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ API Routes
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                      API Layer (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   /api/chat  │  │ /api/powerbi │  │  /api/voice  │      │
│  │              │  │  • token     │  │  • transcribe│      │
│  │              │  │  • reports   │  │  • speak     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Multi-Agent │ │   Power BI   │ │    Voice     │
│   System     │ │   Service    │ │   Service    │
├──────────────┤ ├──────────────┤ ├──────────────┤
│              │ │              │ │              │
│ Orchestrator │ │ • Auth       │ │ • Whisper    │
│      ↓       │ │ • Client     │ │   (STT)      │
│   Reader     │ │ • Token Mgmt │ │ • ElevenLabs │
│      ↓       │ │              │ │   (TTS)      │
│   Analyst    │ │              │ │              │
│      ↓       │ │              │ │              │
│  Presenter   │ │              │ │              │
│              │ │              │ │              │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   OpenAI     │ │   Azure AD   │ │  ElevenLabs  │
│   GPT-4      │ │   + Power BI │ │     API      │
└──────────────┘ └──────────────┘ └──────────────┘
```

## Component Details

### Frontend Layer

#### Pages & Layout

- **`app/layout.tsx`**: Root layout with Mantine provider, theme configuration
- **`app/page.tsx`**: Main dashboard page with Power BI embed and chat

#### Components

- **`PowerBIEmbed.tsx`**: Power BI dashboard embedding with token management
- **`FloatingChat.tsx`**: Collapsible chat interface with message history
- **`ChatMessage.tsx`**: Individual message bubble component
- **`VoiceControl.tsx`**: Microphone button with recording state
- **`LanguageSelector.tsx`**: Dropdown for language selection

#### Custom Hooks

- **`useChat.ts`**: Manages chat state, message sending, API calls
- **`useVoice.ts`**: Handles audio recording, transcription, speech synthesis
- **`usePowerBI.ts`**: Manages embed token state and auto-refresh
- **`useLanguage.ts`**: Language preference with localStorage persistence

### API Layer

#### Chat API (`/api/chat`)

**Purpose**: Process user queries through multi-agent system

**Flow**:

```
POST /api/chat
  ├─ Validate request
  ├─ Build agent context
  ├─ Run orchestrator
  │   ├─ Reader extracts dashboard data
  │   ├─ Analyst performs analysis
  │   └─ Presenter formats response
  └─ Return formatted response
```

**Request**:

```json
{
  "message": "What are the current throughput metrics?",
  "language": "en",
  "dashboardData": {
    /* current dashboard state */
  },
  "conversationHistory": [
    /* previous messages */
  ]
}
```

**Response**:

```json
{
  "response": "The current container throughput...",
  "metadata": {
    "processingTime": 2500,
    "agentsInvoked": ["reader", "analyst", "presenter"],
    "language": "en"
  },
  "analysis": {
    /* trends, comparisons, anomalies */
  },
  "presentation": {
    /* summary, keyFindings, recommendations */
  }
}
```

#### Power BI API

**`POST /api/powerbi/token`**: Generate embed token

- Authenticates via ServicePrincipal
- Returns token + embed URL
- Token valid for 60 minutes

**`GET /api/powerbi/reports`**: Fetch report metadata

- Lists available reports in workspace
- Returns report details

#### Voice API

**`POST /api/voice/transcribe`**: Speech-to-Text

- Accepts audio blob (WebM format)
- Uses OpenAI Whisper API
- Returns text + detected language

**`POST /api/voice/speak`**: Text-to-Speech

- Accepts text + language code
- Uses ElevenLabs multilingual voices
- Returns audio stream (MP3)

### Service Layer

#### Multi-Agent System

**Architecture**: Sequential agent pipeline with GPT-4

```typescript
// Agent Interface
interface Agent {
  systemPrompt: string;
  temperature: number;
  execute(context: AgentContext): Promise<Output>;
}
```

**Agents**:

1. **Reader Agent** (`lib/agents/reader.ts`)

   - **Role**: Extract dashboard context
   - **Input**: User query + dashboard data
   - **Output**: Structured metrics + relevant data points
   - **Temperature**: 0.3 (factual, precise)

2. **Analyst Agent** (`lib/agents/analyst.ts`)

   - **Role**: Analyze trends and patterns
   - **Input**: Reader output + user query
   - **Output**: Trends, comparisons, anomalies, insights
   - **Temperature**: 0.4 (analytical)

3. **Presenter Agent** (`lib/agents/presenter.ts`)
   - **Role**: Format business-friendly response
   - **Input**: Analyst output + user query + language
   - **Output**: Structured presentation with recommendations
   - **Temperature**: 0.6 (creative communication)

**Orchestrator** (`lib/agents/orchestrator.ts`):

```typescript
async function runOrchestrator(context: AgentContext) {
  const readerOutput = await runReaderAgent(context);
  const analystOutput = await runAnalystAgent(context, readerOutput);
  const presenterOutput = await runPresenterAgent(context, analystOutput);

  return {
    response: presenterOutput.formattedResponse,
    context: readerOutput.context,
    analysis: analystOutput,
    presentation: presenterOutput,
    metadata: {
      /* processing info */
    },
  };
}
```

#### Power BI Service

**Authentication Flow**:

```
1. ServicePrincipal credentials → Azure AD
2. Azure AD → Access token (OAuth 2.0)
3. Access token → Power BI API
4. Power BI API → Embed token
5. Embed token → Frontend (valid 60 min)
```

**Token Refresh**:

- Frontend auto-refreshes every 50 minutes
- Prevents expiration (60 min lifetime)
- Seamless user experience

**Client** (`lib/powerbi/client.ts`):

```typescript
class PowerBIClient {
  async generateEmbedToken(workspaceId, reportId): Promise<EmbedToken>;
  async getReport(workspaceId, reportId): Promise<Report>;
  async getReports(workspaceId): Promise<Report[]>;
  async refreshDataset(datasetId): Promise<void>;
}
```

#### Voice Service

**Speech-to-Text Flow**:

```
1. MediaRecorder captures audio (WebM)
2. Audio blob → /api/voice/transcribe
3. OpenAI Whisper API processes audio
4. Language detection via heuristics
5. Return transcribed text + language
```

**Text-to-Speech Flow**:

```
1. Text + language → /api/voice/speak
2. Select appropriate voice from VOICE_CONFIGS
3. ElevenLabs API synthesizes speech
4. Return audio stream (MP3)
5. Frontend plays via Audio element
```

**Voice Configs** (`types/voice.ts`):

```typescript
{
  en: { voiceId: 'EXAVITQu4vr4xnSDxMaL', voiceName: 'Sarah' },
  'zh-CN': { voiceId: 'XrExE9yKIg1WjnnlVkGX', voiceName: 'Matilda' },
  // ... other languages
}
```

## Data Flow

### Typical User Interaction

```
1. User types or speaks question
   ↓
2. Voice → Transcription (if voice input)
   ↓
3. Question + Dashboard context → /api/chat
   ↓
4. Orchestrator chains agents:
   Reader → Analyst → Presenter
   ↓
5. Formatted response returned
   ↓
6. Response displayed in chat
   ↓
7. Optional: Text → Speech synthesis
   ↓
8. Audio played to user
```

### Dashboard Embedding Flow

```
1. Component mounts → usePowerBI hook
   ↓
2. POST /api/powerbi/token
   ↓
3. ServicePrincipal auth → Azure AD
   ↓
4. Access token → Power BI REST API
   ↓
5. Embed token generated
   ↓
6. Token + embedUrl returned
   ↓
7. powerbi-client SDK embeds dashboard
   ↓
8. User interacts with dashboard
   ↓
9. After 50 min → Auto-refresh token
```

## Technology Stack

### Frontend

- **Framework**: Next.js 14.1 (App Router)
- **Language**: TypeScript 5
- **UI Library**: Mantine 7.5
- **Icons**: Tabler Icons React
- **State Management**: React hooks + context

### Backend (API Routes)

- **Runtime**: Next.js API Routes (Node.js)
- **Authentication**: Azure MSAL Node
- **HTTP Client**: Fetch API

### AI & Voice

- **LLM**: OpenAI GPT-4 Turbo
- **STT**: OpenAI Whisper
- **TTS**: ElevenLabs API
- **Voice Processing**: MediaRecorder API

### Analytics

- **BI Platform**: Power BI Embedded
- **Auth**: ServicePrincipal (OAuth 2.0)
- **SDK**: powerbi-client 2.23

### Development

- **Package Manager**: npm
- **Type Checking**: TypeScript
- **Linting**: ESLint (Next.js config)
- **Styling**: CSS + Mantine theme

## Security Considerations

### Environment Variables

- All secrets in `.env.local` (not committed)
- Server-side only access (API routes)
- No client-side exposure

### Authentication

- ServicePrincipal for Power BI (not user credentials)
- Token rotation every 50 minutes
- Least privilege access

### API Security

- Rate limiting (TODO: implement)
- Input validation on all endpoints
- Error messages don't expose internals

### Voice Privacy

- Audio processed server-side
- Not stored permanently
- HTTPS required for microphone access

## Performance Optimization

### Current Implementations

1. **Token Caching**: Power BI tokens reused for 50 min
2. **Component Lazy Loading**: Dynamic imports for heavy components
3. **Agent Parallel Execution**: When possible (future enhancement)
4. **Memoization**: React hooks prevent unnecessary re-renders

### Future Optimizations

1. **Streaming Responses**: LLM streaming for faster TTFB
2. **Edge Functions**: Deploy API routes to edge
3. **CDN**: Static assets on CDN
4. **Caching**: Redis for frequently accessed data

## Extensibility

### Adding New Agents

```typescript
// 1. Create agent file
export async function runNewAgent(context, input) {
  // Agent logic
}

// 2. Update orchestrator
const newAgentOutput = await runNewAgent(context, analystOutput);

// 3. Update types
interface NewAgentOutput {
  /* ... */
}
```

### Adding New Languages

```typescript
// 1. Update i18n.ts
translations.newLang = {
  /* translations */
};

// 2. Update voice.ts
VOICE_CONFIGS.newLang = { voiceId: "...", voiceName: "..." };

// 3. Test language detection
```

### MCP Integration (Future)

```typescript
// Agent functions already compatible with MCP patterns
// Future: Expose as MCP tools
{
  "name": "analyze_port_metrics",
  "description": "Analyze port operation metrics",
  "inputSchema": { /* AgentContext */ }
}
```

## Monitoring & Observability

### Logging

- Console logs for development
- Production: Consider structured logging (Winston, Pino)

### Error Tracking

- Client errors: Browser console
- Server errors: API route error handlers
- Future: Sentry or similar service

### Metrics

- Power BI usage via Azure portal
- OpenAI usage via OpenAI dashboard
- ElevenLabs usage via ElevenLabs dashboard

## Deployment

### Development

```bash
npm run dev  # localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

### Deployment Targets

- **Vercel**: Recommended (native Next.js support)
- **AWS**: EC2 + Load Balancer
- **Azure**: App Service
- **Docker**: Containerized deployment

### Environment Variables (Production)

- Set all in deployment platform
- Use secret management service
- Rotate credentials regularly

## Maintenance

### Regular Tasks

1. **Update Dependencies**: Monthly security updates
2. **Rotate Secrets**: Quarterly credential rotation
3. **Monitor Usage**: Check API quotas and costs
4. **Review Logs**: Weekly error log review

### Troubleshooting

- Check browser console for client errors
- Check server logs for API errors
- Verify environment variables are set
- Test API keys in isolation

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Maintainer**: PSA Digital Innovation Team

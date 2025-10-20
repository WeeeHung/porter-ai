# Porter AI - Intelligent Port Operations Navigator

An AI-powered assistant for port operations analytics, combining Power BI dashboards with multi-agent LLM reasoning and voice interaction capabilities.

## Features

- 🤖 **3-Agent AI Pipeline**: LangChain-powered system with Context Reader, Analyzer, and Consolidator agents
- 🎯 **Suggested Next Steps**: Each response includes actionable follow-up suggestions
- 👁️ **Vision Analysis**: Automatic dashboard screenshot analysis with GPT-4o Vision
- 📊 **Power BI Integration**: Embedded dashboards with automatic token refresh
- 🎤 **Voice Interaction**: Speech-to-Text and Text-to-Speech with ElevenLabs
- 🌍 **Multilingual Support**: English, Chinese, Malay, Tamil (expandable)
- 💬 **Intelligent Chat**: Two modes - streaming (fast) and detailed (comprehensive)
- 🎨 **Modern UI**: Built with Mantine components (no raw divs, no Tailwind)
- 🏢 **Role-Based Responses**: Customized for Top Management, Middle Management, and Frontline Operations

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript
- **UI Library**: Mantine UI v7
- **AI**: LangChain + OpenAI GPT-4o (multi-agent orchestration with vision)
- **Voice**: ElevenLabs (STT/TTS) + OpenAI Whisper
- **Analytics**: Power BI Embedded with ServicePrincipal authentication
- **Authentication**: Azure AD via @azure/msal-node

## Project Structure

```
porter-ai/
├── app/
│   ├── layout.tsx                 # Global Mantine provider + layout
│   ├── page.tsx                   # Main dashboard page
│   ├── api/
│   │   ├── chat/route.ts          # Streaming chat endpoint (single agent)
│   │   ├── chat-detailed/route.ts # Detailed analysis (3-agent pipeline) ⭐ NEW
│   │   ├── powerbi/
│   │   │   ├── token/route.ts     # Generate embed tokens
│   │   │   └── reports/route.ts   # Fetch report metadata
│   │   └── voice/
│   │       ├── transcribe/route.ts # OpenAI Whisper STT
│   │       └── speak/route.ts      # ElevenLabs TTS
│   └── components/
│       ├── PowerBIEmbed.tsx       # Power BI iframe component
│       ├── FloatingInputBar.tsx   # Chat UI with voice button
│       ├── ActivityBar.tsx        # Activity indicators
│       ├── VoiceControl.tsx       # Voice input/output controls
│       └── LanguageSelector.tsx   # Language switcher
├── lib/
│   ├── powerbi/
│   │   ├── client.ts              # Power BI REST API client
│   │   └── auth.ts                # Token generation logic
│   ├── agents/
│   │   └── main.ts                # 3-agent pipeline with LangChain ⭐ UPDATED
│   ├── policy.ts                  # Agent prompts & domain knowledge ⭐ NEW
│   ├── voice/
│   │   ├── elevenlabs.ts          # ElevenLabs API wrapper
│   │   └── audioUtils.ts          # Audio processing helpers
│   └── i18n.ts                    # Translation utilities
├── hooks/
│   ├── useChat.ts                 # Chat state & API calls
│   ├── useVoice.ts                # Voice recording & playback
│   ├── usePowerBI.ts              # Embed token & dashboard state
│   └── useLanguage.ts             # Language switching logic
├── config/
│   └── powerbi.ts                 # Power BI config
├── types/
│   ├── powerbi.ts                 # Power BI types
│   ├── agents.ts                  # Multi-agent types
│   └── voice.ts                   # Voice API types
├── styles/
│   └── globals.css                # Global styles
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- OpenAI API key
- ElevenLabs API key
- Power BI workspace with ServicePrincipal access

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd porter-ai
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# Power BI
POWERBI_CLIENT_ID=your_client_id_here
POWERBI_WORKSPACE_ID=your_workspace_id_here
POWERBI_REPORT_ID=your_report_id_here
POWERBI_CLIENT_SECRET=your_client_secret_here
POWERBI_TENANT_ID=your_tenant_id_here

# OpenAI
OPENAI_API_KEY=sk_your_openai_key_here

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Multi-Agent Architecture

### 3-Agent Pipeline Flow

```
User Query + Screenshot
        ↓
┌─────────────────────────────────────┐
│  Agent 1: Context Reader            │
│  - Vision analysis (GPT-4o)         │
│  - Extract metrics & trends         │
│  - Identify user intent             │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Agent 2: Analyzer                  │
│  - Analyze patterns & issues        │
│  - Detect anomalies                 │
│  - Generate recommendations         │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Agent 3: Consolidator              │
│  - Synthesize natural response      │
│  - Create actionable next steps     │
│  - Extract frontend intent          │
└─────────────────────────────────────┘
        ↓
Response + Key Insights + Next Steps
```

### Agent Details

1. **Context Reader Agent** (`lib/agents/main.ts`)

   - Uses GPT-4o Vision for screenshot analysis
   - Extracts visible metrics, charts, and anomalies
   - Interprets user intent and urgency level
   - Output: Structured visual and textual context

2. **Analyzer Agent** (`lib/agents/main.ts`)

   - Analyzes trends against PSA thresholds
   - Detects operational issues (berth utilization, crane productivity, etc.)
   - Generates immediate, short-term, and long-term recommendations
   - Output: Analysis, recommendations, suggested next steps

3. **Consolidator Agent** (`lib/agents/main.ts`)
   - Synthesizes all information into natural language
   - Adjusts tone based on user role (Top/Middle/Frontline)
   - Creates 3-5 actionable next steps
   - Extracts frontend intent for UI actions
   - Output: Final response with key insights and next steps

### LangChain Integration

- **Sequential Pipeline**: Agents run in sequence with structured data flow
- **JSON Output Parsing**: Type-safe agent communication
- **Vision Support**: Context Reader uses GPT-4o Vision
- **Efficient Streaming**: Separate streaming endpoint for real-time responses
- **Error Handling**: Graceful fallbacks for each agent

### Domain Knowledge

All agents are configured with PSA-specific knowledge from `lib/policy.ts`:

- **Terminals**: Tuas, Pasir Panjang, Keppel, Brani, Antwerp, Busan
- **Key Metrics**: TEUs, berth utilization, vessel turnaround time, crane productivity
- **Issue Thresholds**: Automated detection of operational bottlenecks
- **Remediation Strategies**: Immediate, short-term, and long-term action plans

## Power BI Integration

### Authentication Flow

1. ServicePrincipal authenticates via Azure AD
2. Obtains access token using `@azure/msal-node`
3. Generates embed token via Power BI REST API
4. Tokens auto-refresh every 50 minutes (valid for 60)

### Embedding

- Uses `powerbi-client` SDK for embedding
- Configurable filters and navigation panes
- Error handling and reconnection logic

## Voice Features

### Speech-to-Text

- Uses OpenAI Whisper API for transcription
- Automatic language detection
- Supports WebM audio format

### Text-to-Speech

- Uses ElevenLabs multilingual voices
- Language-specific voice selection
- High-quality audio synthesis

## Multilingual Support

### Supported Languages

1. **English** (en)
2. **Simplified Chinese** (zh-CN)
3. **Spanish** (es)
4. **Arabic** (ar) - RTL support
5. **French** (fr)
6. **Hindi** (hi)

### Implementation

- UI strings translated via `lib/i18n.ts`
- Automatic browser language detection
- Persistent language preference in localStorage
- Language-specific voice synthesis

## Styling Guidelines

### No Raw Divs Policy

All UI components use Mantine semantic components:

- `Stack` - Vertical layouts
- `Group` - Horizontal layouts
- `Flex` - Flexible layouts
- `Container`, `Paper`, `Card` - Containers
- `Box` - Generic wrapper

### Theme

Maritime-inspired color scheme:

- Primary: Blue shades (#228be6)
- Secondary: Teal (#15aabf)
- Accent: Green (#20c997)

## API Endpoints

### Chat

- `POST /api/chat` - Fast streaming responses (single agent)
- `POST /api/chat-detailed` - Comprehensive analysis (3-agent pipeline) with next steps ⭐ NEW

### Power BI

- `POST /api/powerbi/token` - Generate embed token
- `GET /api/powerbi/reports` - Fetch report metadata

### Voice

- `POST /api/voice/transcribe` - Convert speech to text (OpenAI Whisper)
- `POST /api/voice/speak` - Convert text to speech (ElevenLabs)

### Testing

```bash
# Test the 3-agent pipeline
node test-agents.mjs

# Test custom query
node test-agents.mjs "Are there any bottlenecks today?" middle_management English
```

## Development

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Power BI Token Issues

- Verify ServicePrincipal has workspace access
- Check tenant ID and client ID are correct
- Ensure client secret hasn't expired

### Voice Not Working

- Check microphone permissions in browser
- Verify ElevenLabs API key is valid
- Test OpenAI API key for transcription

### Language Not Changing

- Clear browser localStorage
- Check i18n.ts for language support
- Verify translations are complete

## Documentation

- 📘 **[AGENTS_GUIDE.md](AGENTS_GUIDE.md)** - Comprehensive multi-agent system guide
- 📋 **[MULTI_AGENT_SUMMARY.md](MULTI_AGENT_SUMMARY.md)** - Quick reference and implementation summary
- 📝 **[POLICY_GUIDE.md](POLICY_GUIDE.md)** - Domain knowledge and policy configuration
- 🎯 **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide

## Future Enhancements

- [x] ✅ Multi-agent pipeline with LangChain
- [x] ✅ Vision analysis of dashboards
- [x] ✅ Suggested next steps feature
- [ ] Parallel agent execution for better performance
- [ ] Streaming pipeline (stream from each agent)
- [ ] Dashboard interaction tracking (clicks, filters)
- [ ] Advanced predictive analytics
- [ ] User authentication and personalization
- [ ] Export conversation history
- [ ] Mobile responsive optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

Proprietary - Port of Singapore Authority (PSA)

## Support

For issues or questions, contact the PSA Digital Innovation team.

---

Built with ❤️ for PSA Port Operations

# Porter AI - Intelligent Port Operations Navigator

An AI-powered assistant for port operations analytics, combining Power BI dashboards with multi-agent LLM reasoning and voice interaction capabilities.

## Features

- 🤖 **Multi-Agent AI System**: Sophisticated reasoning pipeline with Reader, Analyst, and Presenter agents
- 📊 **Power BI Integration**: Embedded dashboards with automatic token refresh
- 🎤 **Voice Interaction**: Speech-to-Text and Text-to-Speech with ElevenLabs
- 🌍 **Multilingual Support**: 6 languages (English, Simplified Chinese, Spanish, Arabic, French, Hindi)
- 💬 **Intelligent Chat**: Context-aware conversations about port operations data
- 🎨 **Modern UI**: Built with Mantine components (no raw divs, no Tailwind)
- 🔄 **MCP-Ready**: Modular agent architecture for future Model Context Protocol integration

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript
- **UI Library**: Mantine UI v7
- **AI**: OpenAI GPT-4 (multi-agent orchestration)
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
│   │   ├── chat/route.ts          # Multi-agent LLM endpoint
│   │   ├── powerbi/
│   │   │   ├── token/route.ts     # Generate embed tokens
│   │   │   └── reports/route.ts   # Fetch report metadata
│   │   └── voice/
│   │       ├── transcribe/route.ts # ElevenLabs STT
│   │       └── speak/route.ts      # ElevenLabs TTS
│   └── components/
│       ├── PowerBIEmbed.tsx       # Power BI iframe component
│       ├── FloatingChat.tsx       # Chat UI with voice button
│       ├── ChatMessage.tsx        # Message bubbles
│       ├── VoiceControl.tsx       # Voice input/output controls
│       └── LanguageSelector.tsx   # Language switcher
├── lib/
│   ├── powerbi/
│   │   ├── client.ts              # Power BI REST API client
│   │   └── auth.ts                # Token generation logic
│   ├── agents/
│   │   ├── reader.ts              # Reads dashboard context
│   │   ├── analyst.ts             # Analyzes trends & comparisons
│   │   ├── presenter.ts           # Formats business insights
│   │   └── orchestrator.ts        # Chains agents together
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

### Agent Flow

```
User Query → Orchestrator → Reader → Analyst → Presenter → Response
```

### Agent Responsibilities

1. **Reader Agent** (`lib/agents/reader.ts`)

   - Extracts current dashboard metrics and context
   - Identifies relevant KPIs and filters
   - Provides structured data snapshot

2. **Analyst Agent** (`lib/agents/analyst.ts`)

   - Performs trend analysis and comparisons
   - Identifies anomalies and patterns
   - Generates data-driven insights

3. **Presenter Agent** (`lib/agents/presenter.ts`)
   - Formats insights into business language
   - Creates actionable recommendations
   - Aligns with PSA strategic priorities

### MCP Extensibility

The agent architecture is designed to be MCP-compatible:

- Each agent has clear input/output interfaces
- Uses standard function calling patterns
- Modular and independently testable
- Ready for future MCP server integration

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

- `POST /api/chat` - Send message, receive AI response

### Power BI

- `POST /api/powerbi/token` - Generate embed token
- `GET /api/powerbi/reports` - Fetch report metadata

### Voice

- `POST /api/voice/transcribe` - Convert speech to text
- `POST /api/voice/speak` - Convert text to speech

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

## Future Enhancements

- [ ] Streaming LLM responses for better UX
- [ ] Dashboard interaction tracking (clicks, filters)
- [ ] Advanced analytics and predictive insights
- [ ] MCP server integration
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

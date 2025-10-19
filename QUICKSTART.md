# Porter AI - Quick Start Guide

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages:

- Next.js 14.1.0
- Mantine UI 7.5.0
- OpenAI SDK
- ElevenLabs integration
- Power BI Client
- Azure MSAL

### 2. Configure Environment Variables

The `.env.local` file needs to be created with your API keys. A template is provided in `.env.example`.

**Required Variables:**

```env
# Power BI - Already configured
POWERBI_CLIENT_ID=your_client_id_here
POWERBI_WORKSPACE_ID=your_workspace_id_here
POWERBI_REPORT_ID=your_report_id_here
POWERBI_CLIENT_SECRET=your_client_secret_here
POWERBI_TENANT_ID=your_tenant_id_here

# OpenAI - Need to add your key
OPENAI_API_KEY=sk-your_openai_key_here

# ElevenLabs - Need to add your key
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 What's Included

### ✅ Complete Features

1. **Power BI Dashboard Embedding**

   - Automatic token refresh (every 50 minutes)
   - ServicePrincipal authentication
   - Interactive filters and navigation

2. **Multi-Agent AI System**

   - Reader Agent: Extracts dashboard context
   - Analyst Agent: Analyzes trends and anomalies
   - Presenter Agent: Formats business insights
   - Orchestrator: Chains agents together

3. **Voice Integration**

   - Speech-to-Text using OpenAI Whisper
   - Text-to-Speech using ElevenLabs
   - Automatic language detection

4. **Multilingual Support**

   - English, Chinese, Spanish, Arabic, French, Hindi
   - RTL support for Arabic
   - Language-specific voice synthesis

5. **Modern UI**
   - Mantine components (no raw divs)
   - Floating chat interface
   - Responsive design
   - Maritime-themed colors

## 🎯 Next Steps

### Before Running

1. **Get OpenAI API Key**

   - Visit [platform.openai.com](https://platform.openai.com)
   - Create account and generate API key
   - Add to `.env.local` as `OPENAI_API_KEY`

2. **Get ElevenLabs API Key**

   - Visit [elevenlabs.io](https://elevenlabs.io)
   - Sign up and get API key
   - Add to `.env.local` as `ELEVENLABS_API_KEY`

3. **Verify Power BI Access**
   - Ensure ServicePrincipal has workspace permissions
   - Test by running: `npm run dev`

### Testing the Application

1. **Test Power BI Embedding**

   - Dashboard should load on homepage
   - Check browser console for any errors

2. **Test Chat Function**

   - Click on the floating chat
   - Try asking: "What are the current metrics?"
   - Verify AI response appears

3. **Test Voice Features**

   - Click microphone icon
   - Allow microphone permissions
   - Speak a question
   - Verify transcription and response

4. **Test Language Switching**
   - Use language selector in header
   - Switch to different languages
   - Verify UI translations update

## 🔧 Troubleshooting

### Power BI Not Loading

**Issue**: White screen or token error

**Solution**:

- Check `POWERBI_CLIENT_SECRET` hasn't expired
- Verify ServicePrincipal has workspace access
- Check browser console for detailed error

### Voice Not Working

**Issue**: Microphone doesn't activate

**Solution**:

- Check browser microphone permissions
- Use HTTPS (required for getUserMedia)
- Verify `ELEVENLABS_API_KEY` is valid

### Chat Not Responding

**Issue**: Messages send but no response

**Solution**:

- Verify `OPENAI_API_KEY` is correct
- Check API quota/billing on OpenAI dashboard
- Check network tab for API errors

### Build Errors

**Issue**: TypeScript or module errors

**Solution**:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

## 📁 Key Files to Know

- `app/page.tsx` - Main dashboard page
- `app/layout.tsx` - Global layout with Mantine provider
- `app/components/FloatingChat.tsx` - Chat interface
- `lib/agents/orchestrator.ts` - Multi-agent workflow
- `hooks/useChat.ts` - Chat logic
- `hooks/useVoice.ts` - Voice recording logic

## 🔐 Security Notes

- Never commit `.env.local` to version control
- Keep API keys secure
- Use environment variables for all secrets
- ServicePrincipal credentials should be rotated regularly

## 📞 Support

For issues or questions:

1. Check the main `README.md` for detailed documentation
2. Review browser console for error messages
3. Contact PSA Digital Innovation team

## 🎨 Customization

### Change Theme Colors

Edit `app/layout.tsx`:

```typescript
theme={{
  primaryColor: 'blue', // Change to 'teal', 'cyan', etc.
  // ... other theme settings
}}
```

### Add New Languages

1. Add to `lib/i18n.ts` - translations object
2. Add voice config in `types/voice.ts`
3. Update language selector

### Modify Agent Behavior

Edit system prompts in:

- `lib/agents/reader.ts`
- `lib/agents/analyst.ts`
- `lib/agents/presenter.ts`

## ✨ Features Roadmap

- [ ] Streaming LLM responses
- [ ] User authentication
- [ ] Conversation history export
- [ ] Mobile optimization
- [ ] MCP server integration
- [ ] Advanced dashboard interactions

---

**Built for PSA Port Operations** 🚢

Ready to run? Execute: `npm run dev`

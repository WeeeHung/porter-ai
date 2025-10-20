import { NextRequest, NextResponse } from 'next/server';
import { runMainAgentStreaming } from '@/lib/agents/main';
import { AgentContext } from '@/types/agents';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, language = 'en', userRole = 'frontline_operations', dashboardData, conversationHistory = [], screenshotUrl } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build agent context
    const context: AgentContext = {
      userQuery: message,
      language,
      userRole,
      dashboardData,
      conversationHistory,
      screenshotUrl,
    };

    // Run single agent with streaming
    const stream = await runMainAgentStreaming(context);

    // Return streaming response
    // Format: Each line is a JSON object with {type: 'intent'|'text', data: ...}
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

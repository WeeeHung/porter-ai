import { NextRequest, NextResponse } from 'next/server';
import { runOrchestratorStreaming } from '@/lib/agents/orchestrator';
import { AgentContext } from '@/types/agents';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, language = 'en', userRole = 'frontline_operations', dashboardData, conversationHistory = [] } = body;

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
    };

    // Run multi-agent orchestrator with streaming
    const stream = await runOrchestratorStreaming(context);

    // Return streaming response
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


import { NextRequest, NextResponse } from 'next/server';
import { runMainAgent } from '@/lib/agents/main';
import { AgentContext } from '@/types/agents';

/**
 * Detailed Chat API - Uses 3-Agent Pipeline
 * 
 * This endpoint provides a more comprehensive analysis using three specialized agents:
 * 1. Context Reader - Extracts context from image + query
 * 2. Analyzer - Analyzes and suggests actions
 * 3. Consolidator - Creates final response with actionable next steps
 * 
 * Use this for:
 * - Complex queries requiring deep analysis
 * - Dashboard analysis with screenshots
 * - Situations where you want suggested next steps
 * 
 * For faster, streaming responses, use /api/chat instead
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      language = 'English', 
      userRole = 'middle_management', 
      dashboardData, 
      conversationHistory = [], 
      screenshotUrl 
    } = body;

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

    console.log('🚀 Processing detailed chat request with 3-agent pipeline');
    console.log('User Role:', userRole);
    console.log('Language:', language);
    console.log('Has Screenshot:', !!screenshotUrl);

    // Run 3-agent pipeline
    const response = await runMainAgent(context);

    console.log('✅ 3-agent pipeline completed');
    console.log('Next Steps provided:', response.nextSteps?.length || 0);

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error('Detailed Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process detailed chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for testing
 */
export async function GET() {
  return NextResponse.json({
    message: 'Detailed Chat API - 3 Agent Pipeline',
    usage: 'POST with { message, language?, userRole?, dashboardData?, conversationHistory?, screenshotUrl? }',
    agents: [
      'Context Reader - Extracts visual and textual context',
      'Analyzer - Analyzes data and suggests actions',
      'Consolidator - Creates final response with next steps'
    ],
    features: [
      'Deep analysis of dashboard screenshots',
      'Actionable next steps suggestions',
      'Key insights extraction',
      'Frontend intent detection',
      'Role-based response customization'
    ]
  });
}


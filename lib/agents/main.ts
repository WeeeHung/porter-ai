import { 
  AgentContext, 
  AgentResponse, 
  ContextReaderOutput, 
  AnalyzerOutput, 
  ConsolidatorOutput 
} from '@/types/agents';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { 
  buildContextReaderPrompt, 
  buildAnalyzerPrompt, 
  buildConsolidatorPrompt,
  buildStreamingSystemPrompt,
  FEW_SHOT_EXAMPLES
} from '@/lib/policy';

// ============================================================================
// LANGCHAIN MODEL SETUP
// ============================================================================

const gpt4Vision = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1500,
});

const gpt4 = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1200,
});

const jsonParser = new JsonOutputParser();

// ============================================================================
// AGENT 1: CONTEXT READER
// ============================================================================

async function runContextReaderAgent(
  context: AgentContext
): Promise<ContextReaderOutput> {
  console.log('📖 [Agent 1/3] Context Reader - Starting...');
  
  const systemPrompt = buildContextReaderPrompt({
    userRole: context.userRole,
    language: context.language,
  });

  const userContentParts: any[] = [
    { 
      type: 'text', 
      text: `User Query: ${context.userQuery}\n\n${
        context.dashboardData 
          ? `Dashboard Data: ${JSON.stringify(context.dashboardData, null, 2)}\n\n` 
          : ''
      }Extract and analyze all context from the query and image.` 
    },
  ];

  // Add image if provided
  if (context.screenshotUrl) {
    userContentParts.push({
      type: 'image_url',
      image_url: { url: context.screenshotUrl },
    });
    console.log('   → Processing with screenshot');
  }

  try {
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage({ content: userContentParts }),
    ];

    const response = await gpt4Vision.invoke(messages);
    const parsed = await jsonParser.parse(response.content as string);

    console.log('✅ [Agent 1/3] Context Reader - Complete');
    return parsed as ContextReaderOutput;
  } catch (error) {
    console.error('❌ [Agent 1/3] Context Reader - Error:', error);
    // Fallback response
    return {
      visualContext: {
        metrics: [],
        charts: [],
        anomalies: [],
        timeframe: 'current',
      },
      userIntent: {
        primaryQuestion: context.userQuery,
        specificMetrics: [],
        terminals: [],
        timeframe: '',
        urgencyLevel: 'medium',
      },
      contextSummary: `User asked: ${context.userQuery}`,
    };
  }
}

// ============================================================================
// AGENT 2: ANALYZER
// ============================================================================

async function runAnalyzerAgent(
  context: AgentContext,
  contextReaderOutput: ContextReaderOutput
): Promise<AnalyzerOutput> {
  console.log('🔍 [Agent 2/3] Analyzer - Starting...');
  console.log('   → Analyzing context:', contextReaderOutput.contextSummary);
  
  const systemPrompt = buildAnalyzerPrompt({
    userRole: context.userRole,
    language: context.language,
  });

  const userPrompt = `Context from Context Reader Agent:
${JSON.stringify(contextReaderOutput, null, 2)}

User's Original Query: ${context.userQuery}

${context.conversationHistory.length > 0 
  ? `Recent Conversation: ${JSON.stringify(context.conversationHistory.slice(-2), null, 2)}\n` 
  : ''}

Analyze this context and provide insights, recommendations, and suggested next steps.`;

  try {
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ];

    const response = await gpt4.invoke(messages);
    const parsed = await jsonParser.parse(response.content as string);

    console.log('✅ [Agent 2/3] Analyzer - Complete');
    return parsed as AnalyzerOutput;
  } catch (error) {
    console.error('❌ [Agent 2/3] Analyzer - Error:', error);
    // Fallback response
    return {
      analysis: {
        keyFindings: ['Processing your query...'],
        trends: [],
        issuesDetected: [],
        benchmarkComparison: '',
      },
      recommendations: {
        immediate: [],
        shortTerm: [],
        longTerm: [],
      },
      suggestedNextSteps: [
        {
          action: 'Show more details',
          description: 'Get additional information about this query',
          benefit: 'Better understanding of the situation',
        },
      ],
    };
  }
}

// ============================================================================
// AGENT 3: CONSOLIDATOR
// ============================================================================

async function runConsolidatorAgent(
  context: AgentContext,
  contextReaderOutput: ContextReaderOutput,
  analyzerOutput: AnalyzerOutput
): Promise<ConsolidatorOutput> {
  console.log('🎯 [Agent 3/3] Consolidator - Starting...');
  console.log('   → Creating final response with next steps');
  
  const systemPrompt = buildConsolidatorPrompt({
    userRole: context.userRole,
    language: context.language,
  });

  const userPrompt = `User's Original Query: ${context.userQuery}

Context Reader Output:
${JSON.stringify(contextReaderOutput, null, 2)}

Analyzer Output:
${JSON.stringify(analyzerOutput, null, 2)}

Consolidate all this information into a natural, conversational response with actionable next steps for the user.`;

  try {
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ];

    const response = await gpt4.invoke(messages);
    const parsed = await jsonParser.parse(response.content as string);

    console.log('✅ [Agent 3/3] Consolidator - Complete');
    console.log('   → Generated', parsed.nextSteps?.length || 0, 'next steps');
    return parsed as ConsolidatorOutput;
  } catch (error) {
    console.error('❌ [Agent 3/3] Consolidator - Error:', error);
    // Fallback response
    return {
      chatResponse: `I understand you're asking about: ${context.userQuery}. Let me help you with that.`,
      keyInsights: ['Processing your request...'],
      nextSteps: [
        {
          id: '1',
          action: 'Get more information',
          detail: 'I can provide additional details about your query',
          category: 'analysis',
        },
      ],
      frontendIntent: {
        action: 'none',
      },
      language: context.language,
    };
  }
}

// ============================================================================
// MAIN AGENT PIPELINE (3 AGENTS)
// ============================================================================

/**
 * Main Agent Pipeline - Orchestrates 3 specialized agents
 * Agent 1: Context Reader - Extracts context from image + query
 * Agent 2: Analyzer - Analyzes and suggests actions
 * Agent 3: Consolidator - Consolidates and creates final response with next steps
 */
export async function runMainAgent(context: AgentContext): Promise<AgentResponse> {
  try {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Starting 3-Agent Pipeline');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // AGENT 1: Context Reader
    const startTime = Date.now();
    const contextReaderOutput = await runContextReaderAgent(context);
    console.log('   Summary:', contextReaderOutput.contextSummary);
    
    // AGENT 2: Analyzer
    const analyzerOutput = await runAnalyzerAgent(context, contextReaderOutput);
    console.log('   Key Findings:', analyzerOutput.analysis.keyFindings.length);

    // AGENT 3: Consolidator
    const consolidatorOutput = await runConsolidatorAgent(
      context,
      contextReaderOutput,
      analyzerOutput
    );
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Pipeline Complete in', totalTime, 'seconds');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      chatResponse: consolidatorOutput.chatResponse,
      frontendIntent: consolidatorOutput.frontendIntent,
      language: consolidatorOutput.language,
      keyInsights: consolidatorOutput.keyInsights,
      nextSteps: consolidatorOutput.nextSteps,
    };
  } catch (error) {
    console.error('\n❌ Pipeline Failed:', error);
    throw new Error('Failed to process request through agent pipeline');
  }
}

// ============================================================================
// STREAMING VERSION (Single Agent for Performance)
// ============================================================================

/**
 * Streaming version - Uses single agent for better streaming performance
 * For detailed multi-agent analysis, use runMainAgent instead
 */
export async function runMainAgentStreaming(context: AgentContext): Promise<ReadableStream> {
  const systemPrompt = buildStreamingSystemPrompt({
    userRole: context.userRole,
    language: context.language,
  });

  const userPrompt = `User Query: ${context.userQuery}

${context.dashboardData ? `Dashboard Context: ${JSON.stringify(context.dashboardData, null, 2)}` : ''}

${context.conversationHistory.length > 0 ? `Recent conversation: ${JSON.stringify(context.conversationHistory.slice(-3), null, 2)}` : ''}

Provide a helpful response in ${context.language}. If an image of the dashboard is provided, incorporate its contents and ONLY describe the data user is interested in.

ONE SHOT EXAMPLE:
${FEW_SHOT_EXAMPLES.dashboard_analysis.response}
`;

  try {
    const userContent: any[] = [
      { type: 'text', text: userPrompt },
    ];

    if (context.screenshotUrl) {
      userContent.push({ 
        type: 'image_url', 
        image_url: { url: context.screenshotUrl }
      });
    }

    console.log('🎙️ Streaming mode activated');
    if (context.screenshotUrl) {
      console.log('   → Processing with screenshot');
    }

    // Use LangChain for streaming
    const model = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 600,
      streaming: true,
    });

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage({ content: userContent }),
    ];

    // Convert LangChain stream to ReadableStream
    const stream = await model.stream(messages);

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.content;
            if (content) {
              const textChunk = JSON.stringify({
                type: 'text',
                data: content,
              }) + '\n';
              controller.enqueue(textChunk);
            }
          }
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });
  } catch (error) {
    console.error('Main Agent streaming error:', error);
    throw new Error('Failed to stream response');
  }
}

// ============================================================================
// PARALLEL AGENT EXECUTION (Future Enhancement)
// ============================================================================

/**
 * Future optimization: Run Context Reader and partial analysis in parallel
 * This can reduce latency by ~30% for complex queries
 */
export async function runMainAgentOptimized(context: AgentContext): Promise<AgentResponse> {
  try {
    console.log('🚀 Starting Optimized 3-Agent Pipeline...');
    
    // Run Context Reader
    const contextReaderOutput = await runContextReaderAgent(context);
    
    // Future: Could run preliminary analysis in parallel with context reading
    // const [contextReaderOutput, preliminaryAnalysis] = await Promise.all([...]);
    
    const analyzerOutput = await runAnalyzerAgent(context, contextReaderOutput);
    const consolidatorOutput = await runConsolidatorAgent(
      context,
      contextReaderOutput,
      analyzerOutput
    );

    return {
      chatResponse: consolidatorOutput.chatResponse,
      frontendIntent: consolidatorOutput.frontendIntent,
      language: consolidatorOutput.language,
      keyInsights: consolidatorOutput.keyInsights,
      nextSteps: consolidatorOutput.nextSteps,
    };
  } catch (error) {
    console.error('Optimized Agent Pipeline error:', error);
    throw new Error('Failed to process request');
  }
}

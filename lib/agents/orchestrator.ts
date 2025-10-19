import { AgentContext, OrchestratorResult } from '@/types/agents';
import { runReaderAgent } from './reader';
import { runAnalystAgent } from './analyst';
import { runPresenterAgent, runPresenterAgentStreaming } from './presenter';

/**
 * Orchestrator - Coordinates the multi-agent workflow
 * Chains Reader → Analyst → Presenter in sequence
 */
export async function runOrchestrator(context: AgentContext): Promise<OrchestratorResult> {
  const startTime = Date.now();
  const agentsInvoked: string[] = [];

  try {
    // Step 1: Reader Agent - Extract dashboard context
    agentsInvoked.push('reader');
    const readerOutput = await runReaderAgent(context);

    // Step 2: Analyst Agent - Analyze trends and patterns
    agentsInvoked.push('analyst');
    const analystOutput = await runAnalystAgent(context, readerOutput);

    // Step 3: Presenter Agent - Format for business audience
    agentsInvoked.push('presenter');
    const presenterOutput = await runPresenterAgent(context, analystOutput);

    const processingTime = Date.now() - startTime;

    return {
      response: presenterOutput.formattedResponse,
      context: readerOutput.context,
      analysis: analystOutput,
      presentation: presenterOutput,
      metadata: {
        processingTime,
        agentsInvoked,
        language: context.language,
      },
    };
  } catch (error) {
    console.error('Orchestrator error:', error);
    throw new Error('Failed to process multi-agent workflow');
  }
}

/**
 * Orchestrator - Streaming version
 * Chains Reader → Analyst → Presenter (streamed)
 */
export async function runOrchestratorStreaming(context: AgentContext): Promise<ReadableStream> {
  try {
    // Step 1: Reader Agent - Extract dashboard context
    const readerOutput = await runReaderAgent(context);

    // Step 2: Analyst Agent - Analyze trends and patterns
    const analystOutput = await runAnalystAgent(context, readerOutput);

    // Step 3: Presenter Agent - Stream formatted response
    const stream = await runPresenterAgentStreaming(context, analystOutput);

    return stream;
  } catch (error) {
    console.error('Orchestrator streaming error:', error);
    throw new Error('Failed to process multi-agent workflow');
  }
}

/**
 * Simple query handler for questions that don't need full agent chain
 * Used for greetings, clarifications, or simple questions
 */
export async function handleSimpleQuery(
  query: string,
  language: string
): Promise<string> {
  // For simple queries, we might just use a direct LLM call
  // without invoking the full agent chain
  return `I'm Porter AI, your intelligent port operations navigator. How can I help you analyze the dashboard data?`;
}


import { AgentContext, ReaderOutput, DashboardContext } from '@/types/agents';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Reader Agent - Extracts and understands dashboard context
 * Responsible for reading current metrics, filters, and visual data
 */
export async function runReaderAgent(context: AgentContext): Promise<ReaderOutput> {
  // Build role-specific instructions
  const roleInstructions = {
    top_management: 'Focus on high-level strategic metrics, KPIs, year-over-year trends, and executive-level insights. Emphasize performance against targets and competitive positioning.',
    middle_management: 'Focus on operational efficiency metrics, team performance, resource utilization, and actionable insights for process improvements.',
    frontline_operations: 'Focus on day-to-day operational data, real-time metrics, immediate issues, and practical information needed for daily tasks.',
  };

  const systemPrompt = `You are a Dashboard Reader Agent for a port operations dashboard.
Your role is to extract and understand the current state of the dashboard data.

USER ROLE CONTEXT: The user is in ${context.userRole.replace('_', ' ')} role.
${roleInstructions[context.userRole]}

Extract:
1. Current metric values (KPIs) relevant to their role
2. Active filters
3. Visual data and trends visible
4. Time periods shown
5. Key data points relevant to the user's query and their level

Be precise and factual. Only report what's actually present in the dashboard data.

Return your response as a JSON object with the following structure:
{
  "extractedMetrics": { /* key-value pairs of metrics */ },
  "relevantDataPoints": [ /* array of relevant data points */ ]
}`;

  const userPrompt = `User Query: ${context.userQuery}

Dashboard Context: ${JSON.stringify(context.dashboardData, null, 2)}

Extract the relevant metrics, data points, and context from this dashboard that are related to the user's query.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      context: context.dashboardData || {} as DashboardContext,
      extractedMetrics: result.extractedMetrics || {},
      relevantDataPoints: result.relevantDataPoints || [],
    };
  } catch (error) {
    console.error('Reader Agent error:', error);
    throw new Error('Failed to process dashboard context');
  }
}


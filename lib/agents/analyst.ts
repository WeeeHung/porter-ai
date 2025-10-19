import { AgentContext, ReaderOutput, AnalystOutput } from '@/types/agents';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyst Agent - Analyzes trends, comparisons, and anomalies
 * Performs deep analytical work on the extracted data
 */
export async function runAnalystAgent(
  context: AgentContext,
  readerOutput: ReaderOutput
): Promise<AnalystOutput> {
  // Build role-specific analytical focus
  const roleAnalysisFocus = {
    top_management: 'Strategic insights, long-term trends, competitive benchmarks, ROI implications, and board-level decision factors.',
    middle_management: 'Operational efficiency, resource optimization, team performance metrics, process bottlenecks, and tactical improvements.',
    frontline_operations: 'Immediate operational status, real-time issues, shift-level performance, practical alerts, and hands-on actionable data.',
  };

  const systemPrompt = `You are a Data Analyst Agent specializing in port operations analytics.
Your role is to analyze dashboard data and identify:

1. Trends - Directional changes in metrics (up/down/stable)
2. Comparisons - Current vs historical performance
3. Anomalies - Unusual patterns or outliers
4. Insights - Meaningful observations from the data

USER ROLE CONTEXT: The user is in ${context.userRole.replace('_', ' ')} role.
Tailor your analysis for their level: ${roleAnalysisFocus[context.userRole]}

Focus on:
- Container throughput patterns
- Berth utilization rates
- Vessel turnaround times
- Operational efficiency metrics
- Year-over-year or period-over-period comparisons

Be analytical, data-driven, and specific with numbers.

Return your analysis as a JSON object with the following structure:
{
  "trends": [ /* array of trend objects */ ],
  "comparisons": [ /* array of comparison objects */ ],
  "anomalies": [ /* array of anomaly objects */ ],
  "insights": [ /* array of insight strings */ ]
}`;

  const userPrompt = `User Query: ${context.userQuery}

Extracted Dashboard Context:
${JSON.stringify(readerOutput, null, 2)}

Analyze this data to identify trends, comparisons, anomalies, and insights relevant to the user's query.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      trends: result.trends || [],
      comparisons: result.comparisons || [],
      anomalies: result.anomalies || [],
      insights: result.insights || [],
    };
  } catch (error) {
    console.error('Analyst Agent error:', error);
    throw new Error('Failed to analyze dashboard data');
  }
}


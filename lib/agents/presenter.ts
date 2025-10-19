import { AgentContext, AnalystOutput, PresenterOutput } from '@/types/agents';
import OpenAI from 'openai';
import type { Stream } from 'openai/streaming';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Presenter Agent - Formats insights into business-friendly language (Non-streaming)
 * Creates clear, actionable responses aligned with PSA strategy
 */
export async function runPresenterAgent(
  context: AgentContext,
  analysis: AnalystOutput
): Promise<PresenterOutput> {
  // Build role-specific presentation style
  const rolePresentationStyle = {
    top_management: 'Executive summary style: strategic implications, high-level KPIs, business impact, and decision-ready insights. Use formal, boardroom-appropriate language.',
    middle_management: 'Management report style: operational insights, performance metrics, resource implications, and tactical action items. Use clear, action-oriented language.',
    frontline_operations: 'Operational briefing style: practical information, immediate actions, specific details, and hands-on guidance. Use simple, direct language that frontline staff can quickly understand and act upon.',
  };

  const systemPrompt = `You are a Business Presenter Agent for Port of Singapore Authority (PSA).
Your role is to translate analytical insights into clear, actionable business communication.

USER ROLE CONTEXT: The user is in ${context.userRole.replace('_', ' ')} role.
Presentation Style: ${rolePresentationStyle[context.userRole]}

Guidelines:
1. Use business-friendly language appropriate for their role level
2. Structure responses clearly with summaries, findings, and recommendations
3. Align with PSA's strategic priorities: efficiency, sustainability, innovation
4. Provide actionable recommendations relevant to their role
5. Be concise but comprehensive
6. Use the user's language: ${context.language}

Tone: Professional, helpful, and strategic.

Return your response as a JSON object with the following structure:
{
  "summary": "Brief summary string",
  "keyFindings": [ /* array of key finding strings */ ],
  "recommendations": [ /* array of recommendation strings */ ],
  "actionItems": [ /* array of action item strings */ ],
  "formattedResponse": "Complete formatted response in the user's language"
}`;

  const userPrompt = `User Query: ${context.userQuery}

Analysis Results:
${JSON.stringify(analysis, null, 2)}

Create a well-structured business response that includes:
1. A brief summary
2. Key findings (3-5 bullet points)
3. Recommendations or action items if applicable
4. A formatted final response in ${context.language}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      summary: result.summary || '',
      keyFindings: result.keyFindings || [],
      recommendations: result.recommendations || [],
      actionItems: result.actionItems || [],
      formattedResponse: result.formattedResponse || result.summary || '',
    };
  } catch (error) {
    console.error('Presenter Agent error:', error);
    throw new Error('Failed to format presentation');
  }
}

/**
 * Presenter Agent - Streaming version
 * Streams the formatted response as it's generated
 */
export async function runPresenterAgentStreaming(
  context: AgentContext,
  analysis: AnalystOutput
): Promise<ReadableStream> {
  // Build role-specific presentation style
  const rolePresentationStyle = {
    top_management: 'Executive summary style: strategic implications, high-level KPIs, business impact, and decision-ready insights. Use formal, boardroom-appropriate language.',
    middle_management: 'Management report style: operational insights, performance metrics, resource implications, and tactical action items. Use clear, action-oriented language.',
    frontline_operations: 'Operational briefing style: practical information, immediate actions, specific details, and hands-on guidance. Use simple, direct language that frontline staff can quickly understand and act upon.',
  };

  const systemPrompt = `You are a Business Presenter Agent for Port of Singapore Authority (PSA).
Your role is to translate analytical insights into clear, actionable business communication.

USER ROLE CONTEXT: The user is in ${context.userRole.replace('_', ' ')} role.
Presentation Style: ${rolePresentationStyle[context.userRole]}

Guidelines:
1. Use business-friendly language appropriate for their role level
2. Structure responses clearly with summaries, findings, and recommendations
3. Align with PSA's strategic priorities: efficiency, sustainability, innovation
4. Provide actionable recommendations relevant to their role
5. Be concise but comprehensive
6. Use the user's language: ${context.language}

Tone: Professional, helpful, and strategic.

Provide a well-structured response that directly answers the user's question based on the analysis.`;

  const userPrompt = `User Query: ${context.userQuery}

Analysis Results:
${JSON.stringify(analysis, null, 2)}

Create a well-structured business response in ${context.language}.`;

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      stream: true,
      max_completion_tokens: 200,
    });

    // Convert OpenAI stream to ReadableStream
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(content);
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
    console.error('Presenter Agent streaming error:', error);
    throw new Error('Failed to stream presentation');
  }
}


import { AgentContext, AgentResponse } from '@/types/agents';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Main Agent - Single unified agent that handles all user requests
 * Extracts intent and returns both a chat response and frontend-intent object
 */
export async function runMainAgent(context: AgentContext): Promise<AgentResponse> {
  // Build role-specific instructions
  const roleInstructions = {
    top_management: 'Respond with executive-level insights, strategic implications, and high-level KPIs. Use formal, boardroom-appropriate language.',
    middle_management: 'Respond with operational insights, performance metrics, and tactical action items. Use clear, action-oriented language.',
    frontline_operations: 'Respond with practical information, immediate actions, and hands-on guidance. Use simple, direct language.',
  };

  const systemPrompt = `You are Porter AI, an intelligent assistant for Port of Singapore Authority (PSA) operations.

USER ROLE: ${context.userRole.replace('_', ' ')}
${roleInstructions[context.userRole]}

LANGUAGE: Respond in ${context.language}

Your job is to:
1. Understand the user's intent from their query
2. Provide a helpful chat response that will be spoken aloud
3. Extract the frontend intent (what UI action should happen)

Frontend Intent Actions:
- "show_report": Display or navigate to a specific report
- "filter_data": Apply filters to dashboard
- "highlight_metric": Highlight specific metrics or KPIs
- "show_chart": Focus on a specific chart or visualization
- "navigate": Navigate to a different view or page
- "none": No specific UI action needed (conversational only)

Example intents:
- "Show me container throughput" -> action: "show_chart", parameters: { chartType: "container_throughput" }
- "Filter by this month" -> action: "filter_data", parameters: { timeRange: "current_month" }
- "What's the current berth utilization?" -> action: "highlight_metric", parameters: { metric: "berth_utilization" }
- "Hello" or "Thank you" -> action: "none"

Return your response as a JSON object with this structure:
{
  "chatResponse": "The natural language response to speak to the user",
  "frontendIntent": {
    "action": "action_name",
    "parameters": { /* relevant parameters */ },
    "targetComponent": "optional component identifier",
    "confidence": 0.95
  },
  "language": "${context.language}"
}

Make the chatResponse conversational, helpful, and appropriate for the user's role.`;

  const userPrompt = `User Query: ${context.userQuery}

${context.dashboardData ? `Dashboard Context: ${JSON.stringify(context.dashboardData, null, 2)}` : ''}

${context.conversationHistory.length > 0 ? `Conversation History: ${JSON.stringify(context.conversationHistory.slice(-3), null, 2)}` : ''}

Analyze the query and provide a helpful response. If an image is provided, incorporate its contents.`;

  try {
    const userContent: any[] = [
      { type: 'text', text: userPrompt },
    ];

    if (context.screenshotUrl) {
      // Handle both regular URLs and Base64 data URLs
      const imageUrl = context.screenshotUrl.startsWith('data:') 
        ? context.screenshotUrl 
        : context.screenshotUrl;
      
      userContent.push({ 
        type: 'image_url', 
        image_url: { url: imageUrl }
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent as any },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';

    return {
      chatResponse: content,
      frontendIntent: { action: 'none' },
      language: context.language,
    };
  } catch (error) {
    console.error('Main Agent error:', error);
    throw new Error('Failed to process request');
  }
}

/**
 * Main Agent - Streaming version
 * Streams the chat response while still providing the frontend intent
 */
export async function runMainAgentStreaming(context: AgentContext): Promise<ReadableStream> {
  const roleInstructions = {
    top_management: 'Respond with executive-level insights, strategic implications, and high-level KPIs. Use formal, boardroom-appropriate language.',
    middle_management: 'Respond with operational insights, performance metrics, and tactical action items. Use clear, action-oriented language.',
    frontline_operations: 'Respond with practical information, immediate actions, and hands-on guidance. Use simple, direct language.',
  };

  const systemPrompt = `You are Porter AI, an intelligent assistant for Port of Singapore Authority (PSA) operations.

USER ROLE: ${context.userRole.replace('_', ' ')}
${roleInstructions[context.userRole]}

LANGUAGE: Respond in ${context.language}

Your job is to understand the user's query and provide a helpful, conversational response.
Keep responses concise, actionable, and appropriate for their role level.

Tone: Professional, helpful, and friendly.`;

  const userPrompt = `User Query: ${context.userQuery}

${context.dashboardData ? `Dashboard Context: ${JSON.stringify(context.dashboardData, null, 2)}` : ''}

${context.conversationHistory.length > 0 ? `Recent conversation: ${JSON.stringify(context.conversationHistory.slice(-3), null, 2)}` : ''}

Provide a helpful response in ${context.language}. If an image of the dashboard is provided, incorporate its contents and ONLY describe the data user is interested in.

ONE SHOT EXAMPLE:
I see that we handled around 30 services this week, and average port time savings are about 15%. That’s pretty solid — slightly above last month’s baseline.

It looks like most of the gains came from Tuas and Antwerp, especially during midweek scheduling windows. The pattern suggests our automated berth allocation is starting to pay off.

If we push similar scheduling parameters to Busan, we could probably shave another 2–3% off waiting time next month. Want me to break down the data by terminal or vessel type?
`;

  try {
    const userContent: any[] = [
      { type: 'text', text: userPrompt },
    ];

    if (context.screenshotUrl) {
      // Handle both regular URLs and Base64 data URLs
      const imageUrl = context.screenshotUrl
      
      userContent.push({ 
        type: 'image_url', 
        image_url: { url: imageUrl }
      });
    }

    console.log("Screenshot URL :", context.screenshotUrl )

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent as any },
      ],
      temperature: 0.7,
      stream: true,
      max_completion_tokens: 600,
    });

    // Convert OpenAI stream to ReadableStream
    return new ReadableStream({
      async start(controller) {
        try {
          // Stream the chat response only (no intent)
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
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


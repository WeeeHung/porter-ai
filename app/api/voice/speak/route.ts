import { NextRequest, NextResponse } from 'next/server';
import { getElevenLabsClient } from '@/lib/voice/elevenlabs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, language = 'en' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const client = getElevenLabsClient();
    const audioStream = await client.synthesizeStream(text, language);

    // Return streaming audio response
    return new NextResponse(audioStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Speech synthesis API error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getElevenLabsClient } from '@/lib/voice/elevenlabs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    const language = formData.get('language') as string || 'en';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    const client = getElevenLabsClient();
    const result = await client.transcribe(audioFile, language);

    return NextResponse.json({
      text: result.text,
      detectedLanguage: result.detectedLanguage,
    });
  } catch (error) {
    console.error('Transcription API error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}


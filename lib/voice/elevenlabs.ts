import { VOICE_CONFIGS } from '@/types/voice';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

/**
 * ElevenLabs API Client for Speech-to-Text and Text-to-Speech
 */
export class ElevenLabsClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders(): HeadersInit {
    return {
      'xi-api-key': this.apiKey,
    };
  }

  /**
   * Convert audio to text (Speech-to-Text)
   */
  async transcribe(audioBlob: Blob, language: string = 'en'): Promise<{ text: string; detectedLanguage: string }> {
    try {
      // ElevenLabs doesn't have direct STT, so we'll use a workaround
      // In production, you might want to use Whisper API or another STT service
      // For now, we'll create a placeholder that uses OpenAI Whisper
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      // Add language parameter to Whisper API for better accuracy
      formData.append('language', this.mapLanguageCode(language));

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Simple language detection based on character patterns
      const detectedLanguage = this.detectLanguage(result.text);

      return {
        text: result.text,
        detectedLanguage,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Map our language codes to Whisper's language codes
   */
  private mapLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      'en': 'en',
      'zh-CN': 'zh',
      'es': 'es',
      'fr': 'fr',
      'ar': 'ar',
      'hi': 'hi',
    };
    return languageMap[language] || 'en';
  }

  /**
   * Convert text to speech (Text-to-Speech) with streaming
   */
  async synthesizeStream(text: string, language: string = 'en'): Promise<ReadableStream> {
    try {
      const voiceConfig = VOICE_CONFIGS[language] || VOICE_CONFIGS.en;
      // Use the streaming endpoint for faster response
      const url = `${ELEVENLABS_API_BASE}/text-to-speech/${voiceConfig.voiceId}/stream`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Speech synthesis failed: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      return response.body;
    } catch (error) {
      console.error('Speech synthesis error:', error);
      throw new Error('Failed to synthesize speech');
    }
  }

  /**
   * Convert text to speech (Text-to-Speech) - Non-streaming (kept for backwards compatibility)
   */
  async synthesize(text: string, language: string = 'en'): Promise<ArrayBuffer> {
    try {
      const voiceConfig = VOICE_CONFIGS[language] || VOICE_CONFIGS.en;
      const url = `${ELEVENLABS_API_BASE}/text-to-speech/${voiceConfig.voiceId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Speech synthesis failed: ${response.statusText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Speech synthesis error:', error);
      throw new Error('Failed to synthesize speech');
    }
  }

  /**
   * Detect language from text using simple heuristics
   */
  private detectLanguage(text: string): string {
    // Chinese characters
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh-CN';
    
    // Arabic characters
    if (/[\u0600-\u06ff]/.test(text)) return 'ar';
    
    // Hindi/Devanagari characters
    if (/[\u0900-\u097f]/.test(text)) return 'hi';
    
    // Spanish indicators (common words)
    if (/\b(el|la|los|las|un|una|es|está|por|para|con)\b/i.test(text)) return 'es';
    
    // French indicators
    if (/\b(le|la|les|un|une|est|dans|pour|avec|être)\b/i.test(text)) return 'fr';
    
    // Default to English
    return 'en';
  }

  /**
   * Get available voices for a language
   */
  async getVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }
}

// Singleton instance
let elevenLabsInstance: ElevenLabsClient | null = null;

export function getElevenLabsClient(): ElevenLabsClient {
  if (!elevenLabsInstance) {
    const apiKey = process.env.ELEVENLABS_API_KEY || '';
    elevenLabsInstance = new ElevenLabsClient(apiKey);
  }
  return elevenLabsInstance;
}


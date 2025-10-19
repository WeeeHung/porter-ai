export interface TranscriptionRequest {
  audio: Blob | Buffer;
  language?: string;
}

export interface TranscriptionResponse {
  text: string;
  detectedLanguage: string;
  confidence: number;
}

export interface SpeechRequest {
  text: string;
  language: string;
  voiceId?: string;
}

export interface SpeechResponse {
  audio: ArrayBuffer | Buffer;
  contentType: string;
}

export interface VoiceConfig {
  language: string;
  voiceId: string;
  voiceName: string;
}

/**
 * Language-specific voice configurations for ElevenLabs TTS
 * Each language is mapped to a specific voice optimized for that language
 * All voices use the eleven_multilingual_v2 model for best quality
 */
export const VOICE_CONFIGS: Record<string, VoiceConfig> = {
  en: {
    language: 'en',
    voiceId: 'aFxDLa1A1dSRlzW8nziT',
    voiceName: 'Lim',
  },
  'zh-CN': {
    language: 'zh-CN',
    voiceId: 'fQj4gJSexpu8RDE2Ii5m',
    voiceName: 'Yu',
  },
  es: {
    language: 'es',
    voiceId: '5IDdqnXnlsZ1FCxoOFYg',
    voiceName: 'Jesus',
  },
  ar: {
    language: 'ar',
    voiceId: 'LXrTqFIgiubkrMkwvOUr',
    voiceName: 'Masry',
  },
  fr: {
    language: 'fr',
    voiceId: 'kENkNtk0xyzG09WW40xE',
    voiceName: 'Marcel',
  },
  hi: {
    language: 'hi',
    voiceId: 'bUTE2M5LdnqaUCd5tJB3',
    voiceName: 'Vihan',
  },
};


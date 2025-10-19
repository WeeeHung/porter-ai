/**
 * Internationalization utilities for Porter AI
 * Supports: English, Simplified Chinese, Spanish, Arabic, French, Hindi
 */

export type SupportedLanguage = 'en' | 'zh-CN' | 'es' | 'ar' | 'fr' | 'hi';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
  },
  'zh-CN': {
    code: 'zh-CN',
    name: 'Simplified Chinese',
    nativeName: '简体中文',
    direction: 'ltr',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
  },
};

// Translation strings for UI elements
export const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    appName: 'Porter AI',
    appTagline: 'Intelligent Port Operations Navigator',
    chat: 'Chat',
    dashboard: 'Dashboard',
    askQuestion: 'Ask Porter...',
    send: 'Send',
    listening: 'Listening...',
    processing: 'Processing...',
    speakYourQuestion: 'Speak your question',
    stopRecording: 'Stop recording',
    selectLanguage: 'Select Language',
    clearChat: 'Clear chat',
    collapse: 'Collapse',
    expand: 'Expand',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    welcomeMessage: 'Hello! I\'m Porter AI. How can I help you understand the port operations data today?',
    activity: 'Activity',
    userSettings: 'User Settings',
    action: 'Action',
    yourRole: 'Your Role',
    topManagement: 'Top Management',
    middleManagement: 'Middle Management',
    frontlineOperations: 'Frontline Operations',
  },
  'zh-CN': {
    appName: 'Porter AI',
    appTagline: '智能港口运营导航',
    chat: '聊天',
    dashboard: '仪表板',
    askQuestion: '问 Porter...',
    send: '发送',
    listening: '听取中...',
    processing: '处理中...',
    speakYourQuestion: '说出你的问题',
    stopRecording: '停止录音',
    selectLanguage: '选择语言',
    clearChat: '清除聊天',
    collapse: '折叠',
    expand: '展开',
    loading: '加载中...',
    error: '错误',
    retry: '重试',
    welcomeMessage: '您好！我是Porter AI。今天我如何帮助您了解港口运营数据？',
    activity: '活动',
    userSettings: '用户设置',
    action: '操作',
    yourRole: '您的角色',
    topManagement: '高层管理',
    middleManagement: '中层管理',
    frontlineOperations: '一线运营',
  },
  es: {
    appName: 'Porter AI',
    appTagline: 'Navegador Inteligente de Operaciones Portuarias',
    chat: 'Chat',
    dashboard: 'Panel',
    askQuestion: 'Pregunta a Porter...',
    send: 'Enviar',
    listening: 'Escuchando...',
    processing: 'Procesando...',
    speakYourQuestion: 'Di tu pregunta',
    stopRecording: 'Detener grabación',
    selectLanguage: 'Seleccionar idioma',
    clearChat: 'Limpiar chat',
    collapse: 'Contraer',
    expand: 'Expandir',
    loading: 'Cargando...',
    error: 'Error',
    retry: 'Reintentar',
    welcomeMessage: '¡Hola! Soy Porter AI. ¿Cómo puedo ayudarte a entender los datos de operaciones portuarias hoy?',
    activity: 'Actividad',
    userSettings: 'Configuración de Usuario',
    action: 'Acción',
    yourRole: 'Su Rol',
    topManagement: 'Alta Gerencia',
    middleManagement: 'Gerencia Media',
    frontlineOperations: 'Operaciones de Primera Línea',
  },
  ar: {
    appName: 'Porter AI',
    appTagline: 'ملاح ذكي لعمليات الموانئ',
    chat: 'دردشة',
    dashboard: 'لوحة المعلومات',
    askQuestion: 'اسأل بورتر...',
    send: 'إرسال',
    listening: 'الاستماع...',
    processing: 'المعالجة...',
    speakYourQuestion: 'قل سؤالك',
    stopRecording: 'إيقاف التسجيل',
    selectLanguage: 'اختر اللغة',
    clearChat: 'مسح الدردشة',
    collapse: 'طي',
    expand: 'توسيع',
    loading: 'جار التحميل...',
    error: 'خطأ',
    retry: 'إعادة المحاولة',
    welcomeMessage: 'مرحباً! أنا Porter AI. كيف يمكنني مساعدتك في فهم بيانات عمليات الموانئ اليوم؟',
    activity: 'النشاط',
    userSettings: 'إعدادات المستخدم',
    action: 'إجراء',
    yourRole: 'دورك',
    topManagement: 'الإدارة العليا',
    middleManagement: 'الإدارة الوسطى',
    frontlineOperations: 'العمليات الميدانية',
  },
  fr: {
    appName: 'Porter AI',
    appTagline: 'Navigateur Intelligent des Opérations Portuaires',
    chat: 'Chat',
    dashboard: 'Tableau de bord',
    askQuestion: 'Demandez à Porter...',
    send: 'Envoyer',
    listening: 'Écoute...',
    processing: 'Traitement...',
    speakYourQuestion: 'Posez votre question',
    stopRecording: 'Arrêter l\'enregistrement',
    selectLanguage: 'Choisir la langue',
    clearChat: 'Effacer le chat',
    collapse: 'Réduire',
    expand: 'Développer',
    loading: 'Chargement...',
    error: 'Erreur',
    retry: 'Réessayer',
    welcomeMessage: 'Bonjour! Je suis Porter AI. Comment puis-je vous aider à comprendre les données des opérations portuaires aujourd\'hui?',
    activity: 'Activité',
    userSettings: 'Paramètres Utilisateur',
    action: 'Action',
    yourRole: 'Votre Rôle',
    topManagement: 'Direction Générale',
    middleManagement: 'Encadrement Intermédiaire',
    frontlineOperations: 'Opérations de Première Ligne',
  },
  hi: {
    appName: 'Porter AI',
    appTagline: 'बुद्धिमान बंदरगाह संचालन नेविगेटर',
    chat: 'चैट',
    dashboard: 'डैशबोर्ड',
    askQuestion: 'Porter से पूछें...',
    send: 'भेजें',
    listening: 'सुन रहा है...',
    processing: 'प्रसंस्करण...',
    speakYourQuestion: 'अपना प्रश्न बोलें',
    stopRecording: 'रिकॉर्डिंग बंद करें',
    selectLanguage: 'भाषा चुनें',
    clearChat: 'चैट साफ़ करें',
    collapse: 'संक्षिप्त करें',
    expand: 'विस्तार करें',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    retry: 'पुनः प्रयास करें',
    welcomeMessage: 'नमस्ते! मैं Porter AI हूं। आज मैं बंदरगाह संचालन डेटा को समझने में आपकी कैसे मदद कर सकता हूं?',
    activity: 'गतिविधि',
    userSettings: 'उपयोगकर्ता सेटिंग्स',
    action: 'कार्रवाई',
    yourRole: 'आपकी भूमिका',
    topManagement: 'शीर्ष प्रबंधन',
    middleManagement: 'मध्य प्रबंधन',
    frontlineOperations: 'फ्रंटलाइन संचालन',
  },
};

/**
 * Get translation for a key in the current language
 */
export function t(key: string, language: SupportedLanguage = 'en'): string {
  return translations[language]?.[key] || translations.en[key] || key;
}

/**
 * Get language info by code
 */
export function getLanguageInfo(code: SupportedLanguage): LanguageInfo {
  return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES.en;
}

/**
 * Get all supported languages as array
 */
export function getAllLanguages(): LanguageInfo[] {
  return Object.values(SUPPORTED_LANGUAGES);
}

/**
 * Detect browser language
 */
export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language || 'en';
  
  // Check if browser language is supported
  if (browserLang.startsWith('zh')) return 'zh-CN';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('ar')) return 'ar';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('hi')) return 'hi';
  
  return 'en';
}

/**
 * Format date according to language
 */
export function formatDate(date: Date, language: SupportedLanguage): string {
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    'zh-CN': 'zh-CN',
    es: 'es-ES',
    ar: 'ar-SA',
    fr: 'fr-FR',
    hi: 'hi-IN',
  };
  
  return date.toLocaleDateString(localeMap[language], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format number according to language
 */
export function formatNumber(num: number, language: SupportedLanguage): string {
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    'zh-CN': 'zh-CN',
    es: 'es-ES',
    ar: 'ar-SA',
    fr: 'fr-FR',
    hi: 'hi-IN',
  };
  
  return num.toLocaleString(localeMap[language]);
}


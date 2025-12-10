import ar from '$lib/assets/lang/ar.txt?raw';
import fr from '$lib/assets/lang/fr.txt?raw';
import eng from '$lib/assets/lang/eng.txt?raw';


type Language = 'en' | 'ar' | 'fr';

interface LanguageContent {
  common: Record<string, string>;
  home?: Record<string, string>;
  login?: Record<string, string>;
  signup?: Record<string, string>;
  dashboard?: Record<string, string>;
  validation?: Record<string, string>;
  [key: string]: Record<string, string> | undefined;
}

let cachedLanguages: Record<Language, LanguageContent> = {} as Record<Language, LanguageContent>;

export function loadLanguages(): void {  
  try {
    cachedLanguages['ar'] = JSON.parse(ar);
  } catch (error) {
    console.error(`Failed to load language file for ar:`, error);
    cachedLanguages['ar'] = { common: {} };
  }

  try {
    cachedLanguages['en'] = JSON.parse(eng);
  } catch (error) {
    console.error(`Failed to load language file for en:`, error);
    cachedLanguages['en'] = { common: {} };
  }

  try {
    cachedLanguages['fr'] = JSON.parse(fr);
  } catch (error) {
    console.error(`Failed to load language file for fr:`, error);
    cachedLanguages['fr'] = { common: {} };
  }
}

export function getLanguageContent(lang: string = 'en'): LanguageContent {
  const normalizedLang = (lang.toLowerCase() as Language) || 'en';
  
  if (!cachedLanguages[normalizedLang]) {
    loadLanguages();
  }
  
  return cachedLanguages[normalizedLang] || cachedLanguages['en'];
}

export function getAllLanguages(): Record<Language, LanguageContent> {
  if (Object.keys(cachedLanguages).length === 0) {
    loadLanguages();
  }
  return cachedLanguages;
}

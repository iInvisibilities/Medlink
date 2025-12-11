import ar from '$lib/assets/lang/ar.txt?raw';
import fr from '$lib/assets/lang/fr.txt?raw';
import eng from '$lib/assets/lang/eng.txt?raw';


type Language = 'en' | 'ar' | 'fr';

interface PricingContent {
  label?: string;
  title?: string;
  intro?: string;
  valueTitle?: string;
  valueBody?: string;
  capTitle?: string;
  capBody?: string;
  revenueTitle?: string;
  revenueBody?: string;
  antiAbuseTitle?: string;
  antiAbuseBody?: string;
}

type HomeExtraEntry = string | PricingContent | undefined;

interface HomeExtraContent {
  pricing?: PricingContent;
  footerCopyright?: string;
  [key: string]: HomeExtraEntry;
}

interface LanguageContent {
  common: Record<string, string>;
  home?: Record<string, string>;
  homeExtra?: HomeExtraContent;
  search?: Record<string, string>;
  login?: Record<string, string>;
  signup?: Record<string, string>;
  dashboard?: Record<string, string>;
  validation?: Record<string, string>;
  nav?: Record<string, string>;
  notifications?: Record<string, string>;
  admin?: Record<string, string>;
  reset?: Record<string, string>;
  resetToken?: Record<string, string>;
  account?: Record<string, string>;
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

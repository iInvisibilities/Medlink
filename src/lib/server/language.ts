import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const languageMap: Record<string, string> = {
  en: 'eng',
  ar: 'ar',
  fr: 'fr'
};

let cachedLanguages: Record<Language, LanguageContent> = {} as Record<Language, LanguageContent>;

export function loadLanguages(): void {
  const langDir = path.join(__dirname, '../assets/lang');
  
  (['en', 'ar', 'fr'] as Language[]).forEach((lang) => {
    const filename = languageMap[lang];
    const filePath = path.join(langDir, `${filename}.txt`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      cachedLanguages[lang] = JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load language file for ${lang}:`, error);
      cachedLanguages[lang] = { common: {} };
    }
  });
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

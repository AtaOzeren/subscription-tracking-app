import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import all translation files
import en from './en/common.json';
import de from './de/common.json';
import tr from './tr/common.json';
import it from './it/common.json';
import fr from './fr/common.json';
import ru from './ru/common.json';

const resources = {
  en: { common: en },
  de: { common: de },
  tr: { common: tr },
  it: { common: it },
  fr: { common: fr },
  ru: { common: ru },
};

// Get device language or fallback to English
const getDeviceLanguage = () => {
  const deviceLanguage = Localization.locale?.split('-')[0] || 'en';
  
  // Check if device language is supported
  if (resources[deviceLanguage as keyof typeof resources]) {
    return deviceLanguage;
  }
  
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Will be overridden by stored language
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export const getDeviceLanguageCode = getDeviceLanguage;
export default i18n;
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '../locales';
import { storageService } from '../services/storageService';

export type LanguageCode = 'en' | 'de' | 'tr' | 'it' | 'fr' | 'ru';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const availableLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (languageCode: LanguageCode) => Promise<void>;
  isLoading: boolean;
  isFirstTime: boolean;
  setIsFirstTime: (value: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(availableLanguages[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      setIsLoading(true);
      
      // Try to get stored language
      const storedLanguage = await storageService.getLanguage();
      
      if (storedLanguage) {
        // Language is stored, use it
        const language = availableLanguages.find(lang => lang.code === storedLanguage);
        if (language) {
          setCurrentLanguage(language);
          await i18n.changeLanguage(storedLanguage);
        }
      } else {
        // No stored language, check if it's first time
        const hasSeenLanguageScreen = await storageService.getHasSeenLanguageScreen();
        
        if (!hasSeenLanguageScreen) {
          // First time using the app
          setIsFirstTime(true);
          // Use device language as default
          const deviceLanguageCode = i18n.language;
          const deviceLanguage = availableLanguages.find(lang => lang.code === deviceLanguageCode);
          if (deviceLanguage) {
            setCurrentLanguage(deviceLanguage);
            await i18n.changeLanguage(deviceLanguageCode);
          }
        } else {
          // Not first time but no language stored (edge case)
          // Use device language
          const deviceLanguageCode = i18n.language;
          const deviceLanguage = availableLanguages.find(lang => lang.code === deviceLanguageCode);
          if (deviceLanguage) {
            setCurrentLanguage(deviceLanguage);
            await i18n.changeLanguage(deviceLanguageCode);
          }
        }
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (languageCode: LanguageCode) => {
    try {
      // Don't set loading during language change to prevent navigation reset
      // setIsLoading(true);
      
      // Change i18n language
      await i18n.changeLanguage(languageCode);
      
      // Update current language
      const language = availableLanguages.find(lang => lang.code === languageCode);
      if (language) {
        setCurrentLanguage(language);
      }
      
      // Store language preference
      await storageService.setLanguage(languageCode);
      
      // Mark that user has seen language screen
      await storageService.setHasSeenLanguageScreen(true);
      setIsFirstTime(false);
      
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      // setIsLoading(false);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    isLoading,
    isFirstTime,
    setIsFirstTime,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
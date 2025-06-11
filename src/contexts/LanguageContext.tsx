import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the available languages
const languages = {
  en: {
    dashboard: 'Dashboard',
    admin: 'Admin',
    login: 'Login',
    logout: 'Logout',
    videoNews: 'Video News',
    translate: 'Translate',
    translating: 'Translating...',
    original: 'Original',
    showMore: 'Show More',
    showLess: 'Show Less',
    reportError: 'Report Error',
    positive: 'Positive',
    negative: 'Negative',
    neutral: 'Neutral',
    finance: 'Finance',
    health: 'Health',
    education: 'Education',
    defense: 'Defense',
    agriculture: 'Agriculture',
    transport: 'Transportation',
    other: 'Other',
    // Adding missing translation keys
    sentiment: 'Sentiment',
    departments: 'Departments',
    languages: 'Languages',
    lastUpdated: 'Last Updated',
    refresh: 'Refresh',
    transcript: 'Transcript',
    languageAssistant: 'Language Assistant',
    typeYourMessage: 'Type your message...',
    fetchNews: 'Fetch News',
    fetching: 'Fetching...',
    newsFetched: 'News fetched successfully',
    rateLimitExceeded: 'Rate limit exceeded. Please try again in {time} seconds.',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    admin: 'प्रशासन',
    login: 'लॉग इन करें',
    logout: 'लॉग आउट',
    videoNews: 'वीडियो समाचार',
    translate: 'अनुवाद करें',
    translating: 'अनुवाद हो रहा है...',
    original: 'मूल',
    showMore: 'और दिखाएं',
    showLess: 'कम दिखाएं',
    reportError: 'त्रुटि की रिपोर्ट करें',
    positive: 'सकारात्मक',
    negative: 'नकारात्मक',
    neutral: 'तटस्थ',
    finance: 'वित्त',
    health: 'स्वास्थ्य',
    education: 'शिक्षा',
    defense: 'रक्षा',
    agriculture: 'कृषि',
    transport: 'परिवहन',
    other: 'अन्य',
    // Adding missing translation keys with Hindi equivalents
    sentiment: 'भावना',
    departments: 'विभाग',
    languages: 'भाषाएँ',
    lastUpdated: 'आखरी अपडेट',
    refresh: 'रीफ्रेश',
    transcript: 'प्रतिलेख',
    languageAssistant: 'भाषा सहायक',
    typeYourMessage: 'अपने संदेश को टाइप करें...',
    fetchNews: 'समाचार प्राप्त करें',
    fetching: 'प्राप्त कर रहे हैं...',
    newsFetched: 'समाचार सफलतापूर्वक प्राप्त किए गए',
    rateLimitExceeded: 'दर सीमा पार हो गई। कृपया {time} सेकंड में पुनः प्रयास करें।',
  },
};

// Define available languages list for UI
export const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' }
];

// Define context types
type LanguageContextType = {
  language: string;
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: keyof typeof languages.en) => string;
  availableLanguages: { code: string; name: string }[];
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  currentLanguage: 'en',
  setLanguage: () => {},
  t: (key) => key as string,
  availableLanguages: availableLanguages,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>(() => {
    // Try to get the language from localStorage, default to 'en'
    return localStorage.getItem('language') || 'en';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: keyof typeof languages.en): string => {
    return languages[language as keyof typeof languages]?.[key] || languages.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      currentLanguage: language, 
      setLanguage, 
      t,
      availableLanguages 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

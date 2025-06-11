/**
 * Google Translate API using RapidAPI
 * API Key: f0745d3465mshf1f82be2025de81p19453ajsn8edd0c277b00
 */

import { geminiService, GeminiMessage } from '@/services/geminiService';

// Cache for translations to avoid excessive API calls
const translationCache: Record<string, string> = {};

export const fetchTranslation = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
  if (!text) return '';
  
  // Create a cache key
  const cacheKey = `${text}_${sourceLang}_${targetLang}`;
  
  // Check if translation is in cache
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }
  
  try {
    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. 
      Return ONLY the translated text, without any additional explanations or formatting.
      If the text is already in ${targetLang}, return it as is.
      Text to translate: "${text}"`;

    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    const translatedText = await geminiService.sendMessage(messages);
    
    // Cache the translation
    translationCache[cacheKey] = translatedText.trim();
    
    return translatedText.trim();
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
};

export const getTranslation = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
  if (!text) return '';
  
  // Create a cache key
  const cacheKey = `${text}_${sourceLang}_${targetLang}`;
  
  // Check if translation is in cache
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }
  
  // Not in cache, fetch from API
  const translation = await fetchTranslation(text, sourceLang, targetLang);
  
  // Store in cache
  translationCache[cacheKey] = translation;
  
  return translation;
};

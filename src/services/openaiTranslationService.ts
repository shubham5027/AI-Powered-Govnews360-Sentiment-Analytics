import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@/config/openai';

if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key is not configured. Please update the API key in src/config/openai.ts');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const openaiTranslationService = {
  translate: async (text: string, targetLanguage: string) => {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured. Please update the API key in src/config/openai.ts');
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text to ${targetLanguage}. 
            Return ONLY the translated text, without any additional explanations or formatting.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const translatedText = completion.choices[0]?.message?.content;
      
      if (!translatedText) {
        throw new Error('Translation failed: No response from OpenAI');
      }

      return translatedText;
    } catch (error) {
      console.error('OpenAI translation error:', error);
      throw error;
    }
  },
}; 
import OpenAI from "openai";

// const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_KEY = typeof window !== "undefined"
  ? (window as any).__NEXT_PUBLIC_DEEPSEEK_API_KEY
  : process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';


const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: DEEPSEEK_API_KEY
});

export const deepseekTranslationService = {
  translate: async (text: string, sourceLanguage: string = 'en', targetLanguage: string) => {
    try {
      const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
        Return ONLY the translated text, without any additional explanations or formatting.
        If the text is already in ${targetLanguage}, return it as is.
        Text to translate: "${text}"`;

      const completion = await openai.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: "You are a professional translator. Translate the given text accurately while maintaining the original meaning and context." 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        model: "deepseek-chat",
      });

      const translatedText = completion.choices[0]?.message?.content?.trim();
      
      if (!translatedText) {
        throw new Error('Translation failed: No response from provider');
      }

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
}; 
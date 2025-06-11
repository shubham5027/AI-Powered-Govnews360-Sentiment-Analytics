import axios from 'axios';

const MERLIN_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOGE1YmQwOTYtZTQ2OC00ZjEwLTk2Y2MtOWU2ZjUwMjIxZjY3IiwidHlwZSI6ImFwaV90b2tlbiJ9.QL-Qjs13w0VxiLng4b_9AS8uD16n1u7fM3vT31pX7F0';

export const merlinTranslationService = {
  translate: async (text: string, sourceLanguage: string = 'en', targetLanguage: string) => {
    try {
      const options = {
        method: 'POST',
        url: 'https://api.edenai.run/v2/translation/automatic_translation',
        headers: {
          authorization: `Bearer ${MERLIN_API_KEY}`,
        },
        data: {
          providers: 'microsoft',
          text,
          source_language: sourceLanguage,
          target_language: targetLanguage,
        },
      };

      const response = await axios.request(options);
      
      // Get translation from modernmt provider
      const translation = response.data.modernmt?.text;

      if (!translation) {
        throw new Error('Translation failed: No response from provider');
      }

      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Translation failed: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  },
}; 
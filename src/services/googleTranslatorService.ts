import translate from 'translate';

export const googleTranslatorService = {
  translate: async (text: string, targetLanguage: string) => {
    try {
      const result = await translate(text, {
        to: targetLanguage,
        from: 'en'
      });

      return result;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  },
}; 
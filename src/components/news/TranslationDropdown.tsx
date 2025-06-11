import { useState } from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { googleTranslatorService } from '@/services/googleTranslatorService';
import { toast } from 'sonner';

interface TranslationDropdownProps {
  text: string;
  onTranslate: (translatedText: string) => void;
}

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' },
];

export function TranslationDropdown({ text, onTranslate }: TranslationDropdownProps) {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async (targetLang: string) => {
    if (!text) return;

    setIsTranslating(true);
    try {
      const translatedText = await googleTranslatorService.translate(text, targetLang);
      onTranslate(translatedText);
      toast.success('Translation completed');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate content');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          disabled={isTranslating}
        >
          <Languages className="h-4 w-4 mr-2" />
          {isTranslating ? 'Translating...' : 'Translate'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleTranslate(language.code)}
            disabled={isTranslating}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
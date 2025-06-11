import { useState } from 'react';
import { Globe, ExternalLink, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { getTranslation } from '@/lib/translateApi';
import NewsFeedbackForm from './NewsFeedbackForm';
import { Badge } from '@/components/ui/badge';
import { TranslationDropdown } from './TranslationDropdown';
import { merlinTranslationService } from '@/services/merlinTranslationService';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  translatedTitle?: string;
  translatedContent?: string;
  source: string;
  url: string;
  date: string;
  department: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  language: string;
}

interface NewsCardProps {
  news: NewsItem;
  className?: string;
}

export default function NewsCard({ news, className }: NewsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [translated, setTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);
  const { t, currentLanguage } = useLanguage();
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);

  const toggleExpand = () => setExpanded(!expanded);
  
  const toggleTranslation = async () => {
    if (news.translatedTitle || translated) {
      setTranslated(!translated);
      return;
    }
    
    setIsTranslating(true);
    try {
      const targetLang = currentLanguage || 'en';
      const sourceLang = news.language || 'en';
      
      if (sourceLang !== targetLang) {
        news.translatedTitle = await merlinTranslationService.translate(
          news.title,
          sourceLang,
          targetLang
        );
      } else {
        news.translatedTitle = news.title;
      }
      
      setTranslated(true);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate content');
    } finally {
      setIsTranslating(false);
    }
  };
  
  const reportError = () => {
    toast.success("Error report submitted. Our team will review it.");
  };

  const openFeedbackForm = () => {
    if (news.sentiment === 'negative') {
      setFeedbackFormOpen(true);
    } else {
      toast.info("Feedback form is only available for negative news articles");
    }
  };

  const handleTranslate = (translatedText: string) => {
    setTranslatedTitle(translatedText);
    setTranslated(true);
  };

  const title = translated && translatedTitle ? translatedTitle : news.title;
  const content = news.content;
  
  const formattedDate = new Date(news.date).toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  const sentimentColor = {
    positive: 'bg-sentiment-positive',
    neutral: 'bg-sentiment-neutral',
    negative: 'bg-sentiment-negative',
  }[news.sentiment];

  const departmentColor = {
    finance: 'bg-department-finance',
    health: 'bg-department-health',
    education: 'bg-department-education',
    defense: 'bg-department-defense',
    agriculture: 'bg-department-agriculture',
    transport: 'bg-department-transport',
    default: 'bg-department-default',
  }[news.department as keyof typeof departmentColor] || 'bg-department-default';

  return (
    <>
      <Card className={cn("overflow-hidden transition-all duration-200", className)}>
        <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Globe size={14} />
                {news.source}
              </span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold leading-tight mb-2">{title}</h3>
              <TranslationDropdown text={news.title} onTranslate={handleTranslate} />
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span
                className={cn(
                  "department-tag",
                  departmentColor
                )}
              >
                {t(news.department as any)}
              </span>
              <span
                className={cn(
                  "sentiment-badge",
                  {
                    "sentiment-badge-positive": news.sentiment === "positive",
                    "sentiment-badge-neutral": news.sentiment === "neutral",
                    "sentiment-badge-negative": news.sentiment === "negative",
                  }
                )}
              >
                {t(news.sentiment)}
              </span>
              <span className="department-tag bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                {news.language.toUpperCase()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className={cn(
            "text-sm text-muted-foreground transition-all duration-300",
            expanded ? "" : "line-clamp-4"
          )}>
            {content}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={toggleTranslation}
              disabled={isTranslating}
            >
              {isTranslating ? t('translating') : (translated ? t('original') : t('translate'))}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={openFeedbackForm}
            >
              <Flag className="h-3 w-3 mr-1" />
              {t('reportError')}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              asChild
            >
              <a href={news.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                <ExternalLink className="h-3 w-3 mr-1" />
                Source
              </a>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={toggleExpand}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  {t('showLess')}
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  {t('showMore')}
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <NewsFeedbackForm
        open={feedbackFormOpen}
        onOpenChange={setFeedbackFormOpen}
        newsTitle={title}
        newsContent={content}
        newsUrl={news.url}
      />
    </>
  );
}

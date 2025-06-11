import { useState } from 'react';
import { Play, Film, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { merlinTranslationService } from '@/services/merlinTranslationService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface VideoNews {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  source: string;
  date: string;
  duration: string;
  transcript: string;
  translatedTranscript?: string;
  department: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  language?: string;
  translatedTitle?: string;
}

interface VideoNewsCardProps {
  video: VideoNews;
  className?: string;
}

export default function VideoNewsCard({ video, className }: VideoNewsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [translated, setTranslated] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { t, currentLanguage } = useLanguage();
  
  const toggleExpand = () => setExpanded(!expanded);
  const toggleTranslation = async () => {
    if (video.translatedTitle || translated) {
      setTranslated(!translated);
      return;
    }
    
    setIsTranslating(true);
    try {
      const targetLang = currentLanguage || 'en';
      const sourceLang = video.language || 'en';
      
      if (sourceLang !== targetLang) {
        video.translatedTitle = await merlinTranslationService.translate(
          video.title,
          sourceLang,
          targetLang
        );
      } else {
        video.translatedTitle = video.title;
      }
      
      setTranslated(true);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate content');
    } finally {
      setIsTranslating(false);
    }
  };
  
  const formattedDate = new Date(video.date).toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  const title = translated && video.translatedTitle ? video.translatedTitle : video.title;
  const transcript = video.transcript;

  const sentimentColor = {
    positive: 'bg-sentiment-positive',
    neutral: 'bg-sentiment-neutral',
    negative: 'bg-sentiment-negative',
  }[video.sentiment];

  const departmentColor = {
    finance: 'bg-department-finance',
    health: 'bg-department-health',
    education: 'bg-department-education',
    defense: 'bg-department-defense',
    agriculture: 'bg-department-agriculture',
    transport: 'bg-department-transport',
    default: 'bg-department-default',
  }[video.department as keyof typeof departmentColor] || 'bg-department-default';

  return (
    <>
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Globe size={14} />
              {video.source}
            </span>
            <span>•</span>
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{video.duration}</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            <span
              className={cn(
                "department-tag",
                departmentColor
              )}
            >
              {t(video.department as any)}
            </span>
            <span
              className={cn(
                "sentiment-badge",
                {
                  "sentiment-badge-positive": video.sentiment === "positive",
                  "sentiment-badge-neutral": video.sentiment === "neutral",
                  "sentiment-badge-negative": video.sentiment === "negative",
                }
              )}
            >
              {t(video.sentiment)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="relative mb-4 group cursor-pointer" onClick={() => setDialogOpen(true)}>
            <AspectRatio ratio={16 / 9}>
              <img
                src={video.thumbnail}
                alt={video.title}
                className="rounded-md object-cover w-full h-full"
              />
            </AspectRatio>
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                <Play size={24} className="text-gray-900 ml-1" />
              </div>
            </div>
          </div>
          
          <div className="text-sm font-medium mb-2">{t('transcript')}:</div>
          <div className={cn(
            "text-sm text-muted-foreground transition-all duration-300",
            expanded ? "" : "line-clamp-3"
          )}>
            {transcript}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-wrap items-center justify-between gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={toggleTranslation}
          >
            {translated ? t('original') : t('translate')}
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
        </CardFooter>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4">
            <DialogTitle>{video.title}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <AspectRatio ratio={16 / 9}>
              <iframe
                src={video.videoUrl}
                className="w-full h-full"
                allowFullScreen
                title={video.title}
              ></iframe>
            </AspectRatio>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">{t('transcript')}:</div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={toggleTranslation}
              >
                {translated ? t('original') : t('translate')}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground max-h-40 overflow-y-auto">
              {transcript}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

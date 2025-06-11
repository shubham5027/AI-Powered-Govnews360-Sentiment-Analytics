import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Grid, Newspaper, Video, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import NewsCard, { NewsItem } from '@/components/news/NewsCard';
import NewsCardSkeleton from '@/components/news/NewsCardSkeleton';
import VideoNewsCard, { VideoNews } from '@/components/news/VideoNewsCard';
import VideoNewsCardSkeleton from '@/components/news/VideoNewsCardSkeleton';
import SentimentPieChart from '@/components/charts/SentimentPieChart';
import DepartmentBarChart from '@/components/charts/DepartmentBarChart';
import LanguageBarChart from '@/components/charts/LanguageBarChart';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { fetchTranslation } from '@/lib/translateApi';
import { Filters } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { newsService } from '@/services/newsService';

const fetchDashboardData = async () => {
  try {
    const newsApiUrl = `https://newsapi.org/v2/top-stories?apiKey=${import.meta.env.VITE_NEWS_API_KEY}&category=general`;
    const newsApiResponse = await fetch(newsApiUrl).catch(() => null);
    
    const gNewsUrl = `https://gnews.io/api/v4/top-headlines?token=${import.meta.env.VITE_GNEWS_API_KEY}&lang=en&max=10`;
    const gNewsResponse = await fetch(gNewsUrl).catch(() => null);
    
    const mediaStackUrl = `http://api.mediastack.com/v1/news?access_key=${import.meta.env.VITE_MEDIASTACK_API_KEY}&languages=en&limit=10`;
    const mediaStackResponse = await fetch(mediaStackUrl).catch(() => null);
    
    let articles = [];
    let source = '';
    
    if (newsApiResponse && newsApiResponse.ok) {
      const data = await newsApiResponse.json();
      articles = data.articles || [];
      source = 'newsapi';
    } else if (gNewsResponse && gNewsResponse.ok) {
      const data = await gNewsResponse.json();
      articles = data.articles || [];
      source = 'gnews';
    } else if (mediaStackResponse && mediaStackResponse.ok) {
      const data = await mediaStackResponse.json();
      articles = data.data || [];
      source = 'mediastack';
    } else {
      return getDefaultNewsData();
    }
    
    const newsItems = await processArticles(articles, source);
    const videoNews = getDefaultNewsData().videoNews;
    
    const sentimentDistribution = calculateSentimentDistribution(newsItems);
    const departmentCounts = calculateDepartmentCounts(newsItems);
    const languageCounts = calculateLanguageCounts(newsItems);
    
    return {
      newsItems,
      videoNews,
      stats: {
        sentimentDistribution,
        departmentCounts,
        languageCounts,
      },
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    toast.error('Failed to fetch news data. Using fallback data.');
    return getDefaultNewsData();
  }
};

const processArticles = async (articles, source) => {
  const departmentKeywords = {
    finance: ['finance', 'economy', 'budget', 'stock', 'market', 'bank', 'investment'],
    health: ['health', 'hospital', 'covid', 'disease', 'doctor', 'medical', 'vaccine'],
    education: ['education', 'school', 'university', 'student', 'teaching', 'college'],
    defense: ['defense', 'military', 'war', 'army', 'security', 'terrorist', 'weapon'],
    agriculture: ['farm', 'agriculture', 'crop', 'farmer', 'food', 'rural'],
    transport: ['transport', 'train', 'road', 'highway', 'traffic', 'airport', 'railway'],
  };
  
  const sentimentKeywords = {
    positive: ['growth', 'increase', 'improve', 'success', 'benefit', 'good', 'positive', 'gain'],
    negative: ['decline', 'decrease', 'crisis', 'failure', 'problem', 'bad', 'negative', 'loss'],
  };
  
  const processedArticles = [];
  
  for (const article of articles) {
    try {
      let title, content, url, publishedAt, sourceName;
      
      if (source === 'newsapi') {
        title = article.title;
        content = article.description || article.content;
        url = article.url;
        publishedAt = article.publishedAt;
        sourceName = article.source?.name || 'News';
      } else if (source === 'gnews') {
        title = article.title;
        content = article.description;
        url = article.url;
        publishedAt = article.publishedAt;
        sourceName = article.source?.name || 'News';
      } else if (source === 'mediastack') {
        title = article.title;
        content = article.description;
        url = article.url;
        publishedAt = article.published_at;
        sourceName = article.source || 'News';
      }
      
      if (!title || !content) continue;
      
      let department = 'other';
      const combinedText = (title + ' ' + content).toLowerCase();
      
      for (const [dept, keywords] of Object.entries(departmentKeywords)) {
        if (keywords.some(keyword => combinedText.includes(keyword))) {
          department = dept;
          break;
        }
      }
      
      let sentiment = 'neutral';
      if (sentimentKeywords.positive.some(keyword => combinedText.includes(keyword))) {
        sentiment = 'positive';
      } else if (sentimentKeywords.negative.some(keyword => combinedText.includes(keyword))) {
        sentiment = 'negative';
      }
      
      const language = 'en';
      
      let translatedTitle = '';
      let translatedContent = '';
      
      if (language === 'en') {
        try {
          translatedTitle = await fetchTranslation(title, 'en', 'hi');
          translatedContent = await fetchTranslation(content.substring(0, 200), 'en', 'hi');
        } catch (error) {
          console.error('Translation error:', error);
          translatedTitle = title;
          translatedContent = content;
        }
      }
      
      processedArticles.push({
        id: Math.random().toString(36).substring(2, 15),
        title,
        content,
        translatedTitle,
        translatedContent,
        source: sourceName,
        url,
        date: publishedAt,
        department,
        sentiment: sentiment as 'positive' | 'neutral' | 'negative',
        language,
      });
    } catch (error) {
      console.error('Error processing article:', error);
    }
  }
  
  return processedArticles;
};

const calculateSentimentDistribution = (newsItems) => {
  const distribution = { positive: 0, neutral: 0, negative: 0 };
  
  newsItems.forEach(item => {
    distribution[item.sentiment]++;
  });
  
  return distribution;
};

const calculateDepartmentCounts = (newsItems) => {
  const counts = {};
  
  newsItems.forEach(item => {
    counts[item.department] = (counts[item.department] || 0) + 1;
  });
  
  return counts;
};

const calculateLanguageCounts = (newsItems) => {
  const counts = {};
  
  newsItems.forEach(item => {
    counts[item.language] = (counts[item.language] || 0) + 1;
  });
  
  return counts;
};

const getDefaultNewsData = () => {
  return {
    newsItems: [
      {
        id: '1',
        title: 'Government Announces New Healthcare Initiative',
        content: 'The Ministry of Health has announced a new healthcare initiative aimed at improving access to medical services in rural areas. The program, which will be rolled out next month, includes mobile health clinics and telemedicine services.',
        translatedTitle: 'सरकार ने नई स्वास्थ्य पहल की घोषणा की',
        translatedContent: 'स्वास्थ्य मंत्रालय ने ग्रामीण क्षेत्रों में चिकित्सा सेवाओं तक पहुंच में सुधार के उद्देश्य से एक नई स्वास्थ्य पहल की घोषणा की है। कार्यक्रम, जिसे अगले महीने शुरू किया जाएगा, में मोबाइल स्वास्थ्य क्लिनिक और टेलीमेडिसिन सेवाएं शामिल हैं।',
        source: 'healthnews.com',
        url: 'https://example.com/news/1',
        date: '2023-04-15T14:30:00',
        department: 'health',
        sentiment: 'positive' as 'positive',
        language: 'en',
      },
      {
        id: '2',
        title: 'वित्त मंत्री ने बजट घाटे पर चिंता व्यक्त की',
        content: 'केंद्रीय वित्त मंत्री ने आज संसद में बोलते हुए बढ़ते बजट घाटे पर चिंता व्यक्त की। उन्होंने कहा कि सरकार व्यय को कम करने और राजस्व बढ़ाने के लिए कई उपाय कर रही है। वित्त मंत्री ने कहा कि महामारी के कारण अर्थव्यवस्था पर दबाव बढ़ा है।',
        translatedTitle: 'Finance Minister Expresses Concern Over Budget Deficit',
        translatedContent: 'The Union Finance Minister, speaking in Parliament today, expressed concern over the rising budget deficit. She said the government is taking several measures to reduce expenditure and increase revenue. The Finance Minister said that the economy has been under pressure due to the pandemic.',
        source: 'financenews.in',
        url: 'https://example.com/news/2',
        date: '2023-04-16T10:15:00',
        department: 'finance',
        sentiment: 'negative' as 'negative',
        language: 'hi',
      },
      {
        id: '3',
        title: 'New Education Policy Implementation Shows Positive Results',
        content: 'The implementation of the new education policy has shown positive results in its first phase, according to a report released by the Education Ministry today. The report highlights improved learning outcomes and increased enrollment in rural schools.',
        translatedTitle: 'नई शिक्षा नीति के कार्यान्वयन से सकारात्मक परिणाम दिखे',
        translatedContent: 'शिक्षा मंत्रालय द्वारा आज जारी एक रिपोर्ट के अनुसार, नई शिक्षा नीति के कार्यान्वयन ने अपने पहले चरण में सकारात्मक परिणाम दिखाए हैं। रिपोर्ट में बेहतर शिक्षा परिणामों और ग्रामीण स्कूलों में बढ़ते नामांकन पर प्रकाश डाला गया है।',
        source: 'educationtoday.org',
        url: 'https://example.com/news/3',
        date: '2023-04-14T09:45:00',
        department: 'education',
        sentiment: 'positive' as 'positive',
        language: 'en',
      },
      {
        id: '4',
        title: 'Defense Ministry Announces Procurement of New Equipment',
        content: 'The Ministry of Defense has announced the procurement of new military equipment worth $2 billion. The procurement includes advanced surveillance systems and communication equipment. The ministry spokesperson said this is part of the ongoing modernization of the armed forces.',
        translatedTitle: 'रक्षा मंत्रालय ने नए उपकरणों की खरीद की घोषणा की',
        translatedContent: 'रक्षा मंत्रालय ने 2 अरब डॉलर के नए सैन्य उपकरणों की खरीद की घोषणा की है। इस खरीद में उन्नत निगरानी प्रणाली और संचार उपकरण शामिल हैं। मंत्रालय के प्रवक्ता ने कहा कि यह सशस्त्र बलों के चल रहे आधुनिकीकरण का हिस्सा है।',
        source: 'defensenews.com',
        url: 'https://example.com/news/4',
        date: '2023-04-13T16:20:00',
        department: 'defense',
        sentiment: 'neutral' as 'neutral',
        language: 'en',
      },
      {
        id: '5',
        title: 'கடுமையான வெள்ளத்தால் பாதிக்கப்பட்ட விவசாயிகளுக்கு நிவாரணம் அறிவிப்பு',
        content: 'கடுமையான வெள்ளத்தால் பாதிக்கப்பட்ட விவசாயிகளுக்கு அரசு நிவாரணம் அறிவித்துள்ளது. விவசாய அமைச்சர் நேற்று இதை அறிவித்தார். பாதிக்கப்பட்ட ஒவ்வொரு விவசாயிக்கும் ரூ.10,000 நிவாரணம் வழங்கப்படும் என்று கூறினார்.',
        translatedTitle: 'Relief Announced for Farmers Affected by Severe Floods',
        translatedContent: 'The government has announced relief for farmers affected by severe floods. The Agriculture Minister announced this yesterday. He said that relief of Rs.10,000 will be provided to each affected farmer.',
        source: 'agrinews.in',
        url: 'https://example.com/news/5',
        date: '2023-04-12T11:30:00',
        department: 'agriculture',
        sentiment: 'positive' as 'positive',
        language: 'ta',
      },
      {
        id: '6',
        title: 'Metro Rail Project Delayed Due to Land Acquisition Issues',
        content: 'The metro rail project in the capital city has been delayed by six months due to land acquisition issues. The Transport Minister said that the government is working to resolve the issues and expedite the project. The minister also mentioned that the cost of the project has increased by 15% due to the delay.',
        translatedTitle: 'भूमि अधिग्रहण के मुद्दों के कारण मेट्रो रेल परियोजना में देरी',
        translatedContent: 'राजधानी शहर में मेट्रो रेल परियोजना भूमि अधिग्रहण के मुद्दों के कारण छह महीने देरी हो गई है। परिवहन मंत्री ने कहा कि सरकार मुद्दों को हल करने और परियोजना को तेज करने के लिए काम कर रही है। मंत्री ने यह भी उल्लेख किया कि देरी के कारण परियोजना की लागत 15% बढ़ गई है।',
        source: 'transportnews.com',
        url: 'https://example.com/news/6',
        date: '2023-04-11T14:00:00',
        department: 'transport',
        sentiment: 'negative' as 'negative',
        language: 'en',
      },
    ],
    videoNews: [
      {
        id: '1',
        title: 'Finance Minister\'s Budget Presentation Highlights',
        thumbnail: 'https://plus.unsplash.com/premium_photo-1682088095924-13b9d1e9133f',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        source: 'financeTV',
        date: '2023-04-10T11:00:00',
        duration: '12:45',
        transcript: 'The Finance Minister presented the annual budget today, highlighting several key initiatives for economic growth. The budget includes increased allocation for infrastructure, healthcare, and education. The Minister also announced tax relief for the middle class and incentives for small businesses.',
        translatedTranscript: 'वित्त मंत्री ने आज वार्षिक बजट प्रस्तुत किया, जिसमें आर्थिक विकास के लिए कई प्रमुख पहलों पर प्रकाश डाला गया। बजट में बुनियादी ढांचे, स्वास्थ्य सेवा और शिक्षा के लिए आवंटन में वृद्धि शामिल है। मंत्री ने मध्यम वर्ग के लिए कर राहत और छोटे व्यवसायों के लिए प्रोत्साहन की भी घोषणा की।',
        department: 'finance',
        sentiment: 'positive' as 'positive',
      },
      {
        id: '2',
        title: 'Health Minister Launches National Vaccination Drive',
        thumbnail: 'https://plus.unsplash.com/premium_photo-1661331911412-330f43c07401',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        source: 'healthTV',
        date: '2023-04-09T14:30:00',
        duration: '8:20',
        transcript: 'The Health Minister today launched a national vaccination drive aimed at immunizing children against preventable diseases. The minister said that the drive will cover all districts in the country and aims to reach 100% immunization coverage. Health officials from various states attended the launch event.',
        translatedTranscript: 'स्वास्थ्य मंत्री ने आज बच्चों को रोके जा सकने वाले रोगों से टीकाकरण के उद्देश्य से एक राष्ट्रीय टीकाकरण अभियान शुरू किया। मंत्री ने कहा कि यह अभियान देश के सभी जिलों को कवर करेगा और 100% टीकाकरण कवरेज तक पहुंचने का लक्ष्य रखता है। विभिन्न राज्यों के स्वास्थ्य अधिकारियों ने लॉन्च इवेंट में भाग लिया।',
        department: 'health',
        sentiment: 'positive' as 'positive',
      },
      {
        id: '3',
        title: 'रक्षा मंत्री ने सीमा सुरक्षा पर बयान दिया',
        thumbnail: 'https://plus.unsplash.com/premium_photo-1673548917471-3102c4970cb3',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        source: 'रक्षाTV',
        date: '2023-04-08T16:15:00',
        duration: '10:10',
        transcript: 'रक्षा मंत्री ने आज सीमा सुरक्षा पर एक महत्वपूर्ण बयान दिया। उन्होंने कहा कि सरकार सीमा सुरक्षा को मजबूत करने के लिए कई कदम उठा रही है। उन्होंने कहा कि सीमा पर उन्नत निगरानी प्रणालियों की तैनाती की जा रही है और सुरक्षा बलों को आधुनिक उपकरणों से लैस किया जा रहा है।',
        translatedTranscript: 'The Defense Minister today gave an important statement on border security. He said that the government is taking several steps to strengthen border security. He said that advanced surveillance systems are being deployed at the border and security forces are being equipped with modern equipment.',
        department: 'defense',
        sentiment: 'neutral' as 'neutral',
      },
    ],
    stats: {
      sentimentDistribution: {
        positive: 3,
        neutral: 1,
        negative: 2,
      },
      departmentCounts: {
        finance: 2,
        health: 1,
        education: 1,
        defense: 1,
        agriculture: 1,
        transport: 1,
      },
      languageCounts: {
        en: 4,
        hi: 1,
        ta: 1,
      },
    },
  };
};

export default function Dashboard() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<Filters>({
    departments: [],
    languages: ['en'],
    sentiments: []
  });
  const { t } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Listen for filter changes from sidebar
  useEffect(() => {
    const handleFiltersChanged = (event: CustomEvent<Filters>) => {
      setFilters(event.detail);
    };
    
    window.addEventListener('news-filters-changed', handleFiltersChanged as EventListener);
    return () => {
      window.removeEventListener('news-filters-changed', handleFiltersChanged as EventListener);
    };
  }, []);

  const { data, isLoading: queryLoading, error, refetch } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const filteredNews = React.useMemo(() => {
    if (!data?.newsItems) return [];
    
    return data.newsItems.filter(news => {
      const departmentMatch = filters.departments.length === 0 || filters.departments.includes(news.department);
      const languageMatch = filters.languages.length === 0 || filters.languages.includes(news.language);
      const sentimentMatch = filters.sentiments.length === 0 || filters.sentiments.includes(news.sentiment);
      
      return departmentMatch && languageMatch && sentimentMatch;
    });
  }, [data?.newsItems, filters]);

  const handleFetchNews = async () => {
    setIsLoading(true);
    try {
      const articles = await newsService.fetchNews();
      if (articles) {
        setNews(articles);
        toast.success('News fetched successfully');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            View and manage your news feed
          </p>
        </div>
        <Button
          onClick={handleFetchNews}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Fetching...' : 'Fetch News'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {queryLoading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <>
            <SentimentPieChart 
              data={data?.stats.sentimentDistribution || { positive: 0, neutral: 0, negative: 0 }} 
            />
            <DepartmentBarChart 
              data={data?.stats.departmentCounts || {}} 
            />
            <LanguageBarChart 
              data={data?.stats.languageCounts || {}} 
            />
          </>
        )}
      </div>
      
      <Separator />
      
      <Tabs defaultValue="news" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="news" className="flex items-center gap-1">
              <Newspaper className="h-4 w-4" />
              News Articles
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              {t('videoNews')}
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-1 rounded-md border">
            <button
              className={`p-2 ${view === 'grid' ? 'bg-muted' : ''}`}
              onClick={() => setView('grid')}
            >
              <Grid size={18} />
              <span className="sr-only">Grid View</span>
            </button>
            <button
              className={`p-2 ${view === 'list' ? 'bg-muted' : ''}`}
              onClick={() => setView('list')}
            >
              <Newspaper size={18} />
              <span className="sr-only">List View</span>
            </button>
          </div>
        </div>
        
        <TabsContent value="news" className="mt-0">
          <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <NewsCardSkeleton key={index} />
              ))
            ) : (
              filteredNews.map((news) => (
                <NewsCard key={news.id} news={news as NewsItem} />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="videos" className="mt-0">
          <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <VideoNewsCardSkeleton key={index} />
              ))
            ) : (
              data?.videoNews.map((video) => (
                <VideoNewsCard key={video.id} video={video as VideoNews} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

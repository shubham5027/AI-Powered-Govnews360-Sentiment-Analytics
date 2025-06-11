import { toast } from 'sonner';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const API_URL = 'https://newsapi.org/v2/top-headlines';
const RATE_LIMIT = {
  maxCalls: 5, // Maximum number of calls allowed
  timeWindow: 60000, // Time window in milliseconds (1 minute)
};

class NewsService {
  private lastCallTime: number = 0;
  private callCount: number = 0;

  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter if time window has passed
    if (now - this.lastCallTime > RATE_LIMIT.timeWindow) {
      this.callCount = 0;
      this.lastCallTime = now;
    }

    // Check if we've exceeded the rate limit
    if (this.callCount >= RATE_LIMIT.maxCalls) {
      const timeLeft = Math.ceil((RATE_LIMIT.timeWindow - (now - this.lastCallTime)) / 1000);
      toast.error(`Rate limit exceeded. Please try again in ${timeLeft} seconds.`);
      return false;
    }

    this.callCount++;
    return true;
  }

  async fetchNews(country: string = 'in', category: string = 'general') {
    if (!this.checkRateLimit()) {
      return null;
    }

    try {
      const response = await fetch(
        `${API_URL}?country=${country}&category=${category}&apiKey=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      return data.articles;
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to fetch news');
      return null;
    }
  }
}

export const newsService = new NewsService(); 
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import jsPDF from 'jspdf';

// Define types for admin data
export interface Alert {
  id: number;
  type: 'negative' | 'system';
  department?: string;
  message?: string;
  time: string;
  status: 'sent' | 'resolved' | 'pending';
}

export interface CrawlJob {
  id: number;
  target: string;
  startTime: string;
  endTime: string | null;
  status: 'completed' | 'running' | 'failed';
  itemsFound?: number;
  error?: string;
}

export interface AccuracyMetrics {
  [department: string]: number;
}

export interface AdminData {
  alerts: Alert[];
  crawlHistory: CrawlJob[];
  accuracyMetrics: AccuracyMetrics;
  totalArticles: number;
}

// Main admin service object
export const adminService = {
  // Fetch admin dashboard data
  fetchAdminData: async (): Promise<AdminData> => {
    try {
      // Fetch articles count using the custom function
      const { data: countResult, error: countError } = await supabase
        .rpc('count_articles') as { data: number | null, error: Error | null };
      
      const articlesCount = countResult || 0;
      
      if (countError) {
        console.error('Error counting articles:', countError);
      }

      // Fetch alerts and other data
      return {
        alerts: [
          { id: 1, type: 'negative', department: 'finance', time: new Date().toISOString(), status: 'sent' },
          { id: 2, type: 'negative', department: 'transport', time: new Date(Date.now() - 86400000).toISOString(), status: 'sent' },
          { id: 3, type: 'system', message: 'Crawler timeout for Health Department', time: new Date(Date.now() - 172800000).toISOString(), status: 'resolved' },
        ],
        crawlHistory: [
          { id: 1, target: 'All departments', startTime: new Date(Date.now() - 3600000).toISOString(), endTime: new Date().toISOString(), status: 'completed', itemsFound: articlesCount },
          { id: 2, target: 'Finance Department', startTime: new Date(Date.now() - 86400000).toISOString(), endTime: new Date(Date.now() - 86400000 + 1200000).toISOString(), status: 'completed', itemsFound: 32 },
          { id: 3, target: 'Health Department', startTime: new Date(Date.now() - 172800000).toISOString(), endTime: null, status: 'failed', error: 'Connection timeout' },
        ],
        accuracyMetrics: {
          finance: 92,
          health: 88,
          education: 95,
          defense: 90,
          agriculture: 87,
          transport: 89,
        },
        totalArticles: articlesCount
      };
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      throw error;
    }
  },
  
  // Trigger a new crawl job
  triggerCrawl: async (target: string = 'All departments'): Promise<CrawlJob> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const now = new Date();
    const newJob: CrawlJob = {
      id: Math.floor(Math.random() * 1000),
      target,
      startTime: now.toISOString(),
      endTime: null,
      status: 'running',
    };
    
    toast.success(`Crawl initiated for ${target}`);
    return newJob;
  },
  
  // Resolve an alert
  resolveAlert: async (alertId: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    try {
      // Simulate API call to resolve alert
      const email = 'admin@gmail.com'; // In real app, this would come from user context
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "e63542f7-3d7a-466c-9217-b30060624fe8",
          email: email,
          subject: `Alert Resolution #${alertId}`,
          message: `Alert #${alertId} has been resolved by admin.`,
        }),
      });
      
      toast.success(`Alert #${alertId} marked as resolved`);
      return true;
    } catch (error) {
      toast.error('Failed to resolve alert');
      return false;
    }
  },
  
  // Export data in different formats
  exportData: async (format: 'excel' | 'pdf' | 'raw'): Promise<void> => {
    try {
      // Dummy data for export
      const dummyData = {
        articles: [
          
            {
              id: 1,
              title: "India Targets Fiscal Deficit at 4.4% for 2025-26, Sets Path to Bring Down Debt",
              department: "finance",
              sentiment: "positive",
              date: new Date().toISOString(),
              source: "Reuters",
              url: "https://www.reuters.com/world/india/india-budget-india-targets-fiscal-deficit-44-2025-26-sets-path-bring-down-debt-2025-02-01/"
            },
            {
              id: 2,
              title: "India's April-October Fiscal Deficit at 46.5% of FY25 Target",
              department: "finance",
              sentiment: "neutral",
              date: new Date(Date.now() - 86400000).toISOString(),
              source: "Investing.com",
              url: "https://www.investing.com/news/economy/indias-apriloct-fiscal-deficit-at-465-of-fy25-target-3746487"
            },
            {
              id: 3,
              title: "Centre May Set Fiscal Deficit Target at 3.7-4.3% After 2025-26: Report",
              department: "finance",
              sentiment: "positive",
              date: new Date(Date.now() - 172800000).toISOString(),
              source: "Moneycontrol",
              url: "https://www.moneycontrol.com/news/business/economy/centre-may-set-fiscal-deficit-target-at-3-7-4-3-after-2025-26-report-12781753.html"
            },
            {
              id: 4,
              title: "India to Move Away from Fiscal Deficit Targeting After FY26",
              department: "finance",
              sentiment: "neutral",
              date: new Date(Date.now() - 259200000).toISOString(),
              source: "The Economic Times",
              url: "https://economictimes.indiatimes.com/news/economy/indicators/india-to-move-away-from-fiscal-deficit-targeting-after-fy26/articleshow/111987339.cms"
            },
            {
              id: 5,
              title: "Government Announces New Healthcare Initiative",
              department: "health",
              sentiment: "positive",
              date: new Date(Date.now() - 345600000).toISOString(),
              source: "healthnews.com",
              url: "https://example.com/news/1"
            },
            {
              id: 6,
              title: "Finance Minister Expresses Concern Over Budget Deficit",
              department: "finance",
              sentiment: "negative",
              date: new Date(Date.now() - 432000000).toISOString(),
              source: "financenews.in",
              url: "https://example.com/news/2"
            },
            {
              id: 7,
              title: "New Education Policy Implementation Shows Positive Results",
              department: "education",
              sentiment: "positive",
              date: new Date(Date.now() - 518400000).toISOString(),
              source: "educationtoday.org",
              url: "https://example.com/news/3"
            },
            {
              id: 8,
              title: "India's Fiscal Deficit for April-June FY25 Quarter Shrinks Sharply to 8.1%",
              department: "finance",
              sentiment: "positive",
              date: new Date(Date.now() - 604800000).toISOString(),
              source: "Business Today",
              url: "https://www.businesstoday.in/latest/economy/story/indias-fiscal-deficit-for-april-june-fy25-quarter-shrinks-sharply-to-81-heres-why-439637-2024-07-31"
            },
            {
              id: 9,
              title: "India's Central Bank Seen Cutting Rates for First Time Since May 2020",
              department: "finance",
              sentiment: "positive",
              date: new Date(Date.now() - 691200000).toISOString(),
              source: "Reuters",
              url: "https://www.reuters.com/markets/rates-bonds/indias-central-bank-seen-cutting-rates-first-time-since-may-2020-2025-02-04/"
            },
            {
              id: 10,
              title: "India Budget Aims to Boost Spending Power of Middle Class, Support Growth",
              department: "finance",
              sentiment: "positive",
              date: new Date(Date.now() - 777600000).toISOString(),
              source: "Reuters",
              url: "https://www.reuters.com/world/india/india-budget-aims-boost-farm-output-push-inclusive-growth-2025-02-01/"
            }
        ],
        metrics: {
          totalArticles: 468,
          sentimentDistribution: {
            positive: 250,
            neutral: 150,
            negative: 68
          },
          departmentDistribution: {
            finance: 120,
            health: 95,
            education: 80,
            defense: 65,
            agriculture: 55,
            transport: 53
          }
        }
      };

      let blob: Blob;
      let filename: string;
      let fileContent: string | Blob;

      switch (format) {
        case 'excel':
          // For Excel, we'll create a CSV file
          const csvContent = [
            ['ID', 'Title', 'Department', 'Sentiment', 'Date', 'Source', 'URL'],
            ...dummyData.articles.map(article => [
              article.id,
              article.title,
              article.department,
              article.sentiment,
              article.date,
              article.source,
              article.url
            ])
          ].map(row => row.join(',')).join('\n');

          fileContent = csvContent;
          blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          filename = 'news_data.csv';
          break;

        case 'pdf':
          // Create a new PDF document
          const doc = new jsPDF();
          
          // Add title
          doc.setFontSize(20);
          doc.text('News Data Report', 20, 20);
          
          // Add metrics section
          doc.setFontSize(12);
          doc.text(`Total Articles: ${dummyData.metrics.totalArticles}`, 20, 40);
          
          // Add sentiment distribution
          doc.text('Sentiment Distribution:', 20, 60);
          doc.text(`- Positive: ${dummyData.metrics.sentimentDistribution.positive}`, 20, 70);
          doc.text(`- Neutral: ${dummyData.metrics.sentimentDistribution.neutral}`, 20, 80);
          doc.text(`- Negative: ${dummyData.metrics.sentimentDistribution.negative}`, 20, 90);
          
          // Add department distribution
          doc.text('Department Distribution:', 20, 110);
          let yPos = 120;
          Object.entries(dummyData.metrics.departmentDistribution).forEach(([dept, count]) => {
            doc.text(`- ${dept}: ${count}`, 20, yPos);
            yPos += 10;
          });
          
          // Add articles section
          doc.text('Recent Articles:', 20, yPos + 10);
          yPos += 20;
          
          // Add articles with proper formatting
          dummyData.articles.forEach(article => {
            // Check if we need a new page
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }
            
            doc.setFontSize(10);
            doc.text(`ID: ${article.id}`, 20, yPos);
            doc.text(`Title: ${article.title}`, 20, yPos + 10);
            doc.text(`Department: ${article.department}`, 20, yPos + 20);
            doc.text(`Sentiment: ${article.sentiment}`, 20, yPos + 30);
            doc.text(`Date: ${article.date}`, 20, yPos + 40);
            doc.text(`Source: ${article.source}`, 20, yPos + 50);
            doc.text(`URL: ${article.url}`, 20, yPos + 60);
            
            yPos += 80; // Add some space between articles
          });
          
          fileContent = doc.output('blob');
          blob = new Blob([fileContent], { type: 'application/pdf' });
          filename = 'news_data.pdf';
          break;

        case 'raw':
          fileContent = JSON.stringify(dummyData, null, 2);
          blob = new Blob([fileContent], { type: 'application/json' });
          filename = 'news_data.json';
          break;
      }

      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      // Convert blob to base64 for email attachment
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        try {
          // Send email with attachment using Web3Forms
          const formData = new FormData();
          formData.append('access_key', 'e63542f7-3d7a-466c-9217-b30060624fe8');
          formData.append('email', 'admin@example.com'); // Replace with actual admin email
          formData.append('subject', `News Data Export - ${format.toUpperCase()}`);
          formData.append('message', `Please find attached the exported news data in ${format.toUpperCase()} format.`);
          formData.append('attachment', base64data);
          formData.append('attachment_name', filename);

          const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            toast.success(`Data exported and sent to your email as ${format.toUpperCase()}`);
          } else {
            toast.error('Failed to send email, but file was downloaded successfully');
          }
        } catch (error) {
          console.error('Error sending email:', error);
          toast.error('Failed to send email, but file was downloaded successfully');
        }
      };

    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
};

import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3,
  Home,
  CheckSquare,
  Menu,
  X,
  Newspaper,
  Video,
  Settings,
  PanelLeft,
  Filter,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const departments = [
  { id: 'finance', name: 'Finance', color: 'bg-department-finance' },
  { id: 'health', name: 'Health', color: 'bg-department-health' },
  { id: 'education', name: 'Education', color: 'bg-department-education' },
  { id: 'defense', name: 'Defense', color: 'bg-department-defense' },
  { id: 'agriculture', name: 'Agriculture', color: 'bg-department-agriculture' },
  { id: 'transport', name: 'Transport', color: 'bg-department-transport' },
];

// const languages = [
//   { id: 'en', name: 'English' },
//   { id: 'hi', name: 'Hindi' },
//   { id: 'ta', name: 'Tamil' },
//   { id: 'te', name: 'Telugu' },
//   { id: 'bn', name: 'Bengali' },
//   { id: 'mr', name: 'Marathi' },
// ];

const sentiments = [
  { id: 'positive', name: 'Positive', color: 'bg-sentiment-positive' },
  { id: 'neutral', name: 'Neutral', color: 'bg-sentiment-neutral' },
  { id: 'negative', name: 'Negative', color: 'bg-sentiment-negative' },
];

export type Filters = {
  departments: string[];
  languages: string[];
  sentiments: string[];
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  
  const [filters, setFilters] = useState<Filters>({
    departments: departments.map(d => d.id),
    languages: ['en'],
    sentiments: sentiments.map(s => s.id)
  });

  const toggleFilter = (type: keyof Filters, id: string) => {
    setFilters(prev => {
      const currentFilters = prev[type];
      const newFilters = currentFilters.includes(id)
        ? currentFilters.filter(f => f !== id)
        : [...currentFilters, id];
      
      const updatedFilters = { ...prev, [type]: newFilters };
      localStorage.setItem('news-filters', JSON.stringify(updatedFilters));
      
      return updatedFilters;
    });
  };

  useEffect(() => {
    const savedFilters = localStorage.getItem('news-filters');
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('news-filters-changed', { detail: filters }));
  }, [filters]);

  const toggleSidebar = () => setOpen(!open);

  return (
    <>
      {isMobile && open && (
        <div 
          className="fixed inset-0 z-40 bg-black/50" 
          onClick={toggleSidebar}
        />
      )}
      
      {isMobile && (
        <button
          className="fixed z-50 bottom-4 left-4 p-2 rounded-full bg-primary text-white shadow-lg"
          onClick={toggleSidebar}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
    
      <aside
        className={cn(
          "z-50 flex flex-col bg-sidebar text-sidebar-foreground w-[280px] border-r border-sidebar-border transition-all duration-300 ease-in-out",
          isMobile && "fixed inset-y-0 left-0",
          isMobile && !open && "-translate-x-full"
        )}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-sidebar-primary" />
            <h1 className="text-xl font-bold">GovNews360 AI</h1>
          </div>
          {!isMobile && (
            <button onClick={toggleSidebar}>
              <PanelLeft size={20} />
            </button>
          )}
        </div>
        
        <ScrollArea className="flex-1">
          <nav className="p-4 space-y-6">
            <div className="space-y-1">
              <NavLink 
                to="/" 
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                )}
              >
                <Home size={18} />
                <span>{t('dashboard')}</span>
              </NavLink>
              
              <NavLink 
                to="/admin" 
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                )}
              >
                <Settings size={18} />
                <span>{t('admin')}</span>
              </NavLink>

              <NavLink 
                to="/assistant" 
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                )}
              >
                <Bot size={18} />
                <span>{t('languageAssistant')}</span>
              </NavLink>
            </div>
            
            <Separator className="bg-sidebar-border" />
            
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-sidebar-foreground/60 mb-2 px-3">
                <div className="flex items-center gap-2">
                  <Filter size={14} />
                  {t('departments')}
                </div>
              </h3>
              <div className="space-y-1.5 px-3">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center gap-2">
                    <Switch 
                      id={`department-${dept.id}`} 
                      checked={filters.departments.includes(dept.id)}
                      onCheckedChange={() => toggleFilter('departments', dept.id)}
                    />
                    <Label 
                      htmlFor={`department-${dept.id}`}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <span className={cn("w-2 h-2 rounded-full", dept.color)} aria-hidden="true" />
                      {t(dept.id as any)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* <Separator className="bg-sidebar-border" /> */}
            
            {/* <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-sidebar-foreground/60 mb-2 px-3">
                <div className="flex items-center gap-2">
                  <Filter size={14} />
                  {t('languages')}
                </div>
              </h3> */}
              {/* <div className="space-y-1.5 px-3">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex items-center gap-2">
                    <Switch 
                      id={`language-${lang.id}`} 
                      checked={filters.languages.includes(lang.id)}
                      onCheckedChange={() => toggleFilter('languages', lang.id)}
                    />
                    <Label 
                      htmlFor={`language-${lang.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {lang.name}
                    </Label>
                  </div>
                ))}
              </div> */}
            {/* </div> */}
            
            <Separator className="bg-sidebar-border" />
            
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-sidebar-foreground/60 mb-2 px-3">
                <div className="flex items-center gap-2">
                  <Filter size={14} />
                  {t('sentiment')}
                </div>
              </h3>
              <div className="space-y-1.5 px-3">
                {sentiments.map((sentiment) => (
                  <div key={sentiment.id} className="flex items-center gap-2">
                    <Switch 
                      id={`sentiment-${sentiment.id}`} 
                      checked={filters.sentiments.includes(sentiment.id)}
                      onCheckedChange={() => toggleFilter('sentiments', sentiment.id)}
                    />
                    <Label 
                      htmlFor={`sentiment-${sentiment.id}`}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <span className={cn("w-2 h-2 rounded-full", sentiment.color)} aria-hidden="true" />
                      {t(sentiment.id as any)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Moon, 
  RefreshCw, 
  Sun, 
  User,
  LogOut,
  Clock,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const { user, logout } = useAuth();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Update the last updated time every minute
    const interval = setInterval(() => {
      setLastUpdated((prev) => prev);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    
    // Simulating refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Data refreshed successfully");
    }, 1000);
  };

  const formattedTime = formatDistanceToNow(lastUpdated, { addSuffix: true });

  // Extract username from user metadata or use email as fallback
  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || "Guest User";
  
  // Get avatar URL from user metadata or use default
  const avatarUrl = user?.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user";

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={16} />
          <span>{t('lastUpdated')}: {formattedTime}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground" 
            onClick={handleRefresh}
          >
            <RefreshCw 
              size={18} 
              className={isRefreshing ? "animate-spin" : ""} 
            />
            <span className="sr-only">{t('refresh')}</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell size={18} />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 text-muted-foreground"
              >
                {availableLanguages.find(l => l.code === language)?.name}
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Switch Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableLanguages.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={language === lang.code ? "bg-muted" : ""}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={avatarUrl} 
                    alt="User avatar" 
                  />
                  <AvatarFallback>
                    <User size={18} />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {displayName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => logout()}
              >
                <LogOut size={16} />
                <span>{t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

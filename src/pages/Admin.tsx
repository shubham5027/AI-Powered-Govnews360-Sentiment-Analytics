import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  BarChart3, 
  AlertTriangle, 
  Clock, 
  Database, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  RefreshCw,
  Check,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { adminService, Alert, CrawlJob } from '@/services/adminService';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Admin() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminData'],
    queryFn: adminService.fetchAdminData,
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  const handleTriggerCrawl = async (department: string = 'All departments') => {
    try {
      const newJob = await adminService.triggerCrawl(department);
      
      queryClient.setQueryData(['adminData'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          crawlHistory: [newJob, ...oldData.crawlHistory.slice(0, 9)]
        };
      });
      
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['adminData'] });
      }, 5000);
    } catch (error) {
      toast.error("Failed to start crawler job");
    }
  };
  
  const handleResolveAlert = async (alertId: number) => {
    try {
      await adminService.resolveAlert(alertId);
      
      queryClient.setQueryData(['adminData'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          alerts: oldData.alerts.map((alert: Alert) => 
            alert.id === alertId 
              ? { ...alert, status: 'resolved' } 
              : alert
          )
        };
      });
    } catch (error) {
      toast.error("Failed to resolve alert");
    }
  };
  
  const exportData = async (format: 'excel' | 'pdf' | 'raw') => {
    try {
      await adminService.exportData(format);
    } catch (error) {
      toast.error(`Failed to export data as ${format.toUpperCase()}`);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  const getTimeDiff = (start: string, end: string) => {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    return Math.round(diffMs / 60000);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage crawlers, view alerts, and access system metrics.
        </p>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="crawlers">Crawlers</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-16 animate-pulse bg-muted rounded"></div>
                  ) : (
                    '468'
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Negative Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-16 animate-pulse bg-muted rounded"></div>
                  ) : (
                    data?.alerts.filter(a => a.type === 'negative' && a.status !== 'resolved').length || 0
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Crawler Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-16 animate-pulse bg-muted rounded"></div>
                  ) : (
                    (() => {
                      const completed = data?.crawlHistory.filter(c => c.status === 'completed').length || 0;
                      const total = data?.crawlHistory.length || 1;
                      return `${Math.round((completed / total) * 100)}%`;
                    })()
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Sentiment Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-16 animate-pulse bg-muted rounded"></div>
                  ) : (
                    (() => {
                      const metrics = data?.accuracyMetrics || {};
                      const avg = Object.values(metrics).reduce((sum, val) => sum + val, 0) / 
                               Math.max(Object.values(metrics).length, 1);
                      return `${avg.toFixed(1)}%`;
                    })()
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Alert History
                </CardTitle>
                <CardDescription>
                  Recent alerts generated by the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-16 rounded-md animate-pulse bg-muted/50"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data?.alerts.map((alert: Alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {alert.type === 'negative' ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-destructive"></span>
                                <span className="font-medium">Negative Article Alert</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                <span className="font-medium">System Alert</span>
                              </>
                            )}
                            <Badge variant={alert.status === 'resolved' ? 'outline' : 'secondary'}>
                              {alert.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {alert.type === 'negative' 
                              ? `Negative article detected in ${alert.department} department`
                              : alert.message
                            }
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            {formatDate(alert.time)}
                          </div>
                          {alert.status !== 'resolved' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleResolveAlert(alert.id)}
                            >
                              <Check size={14} className="mr-1" /> Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={18} />
                  Department Accuracy
                </CardTitle>
                <CardDescription>
                  Sentiment analysis accuracy by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="h-4 rounded-md animate-pulse bg-muted/50"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(data?.accuracyMetrics || {}).map(([dept, accuracy]) => (
                      <div key={dept} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize">{dept}</span>
                          <span className="font-medium">{accuracy}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2"
                            style={{ width: `${accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="crawlers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock size={18} />
                    Crawler Management
                  </CardTitle>
                  <CardDescription>
                    Schedule and monitor crawler jobs
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleTriggerCrawl()}>
                    <RefreshCw size={16} className="mr-2" />
                    Run All Crawlers
                  </Button>
                  <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCw size={16} className="mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Results</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}>
                              <div className="h-4 w-full animate-pulse bg-muted rounded"></div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      data?.crawlHistory.map((job: CrawlJob) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.target}</TableCell>
                          <TableCell>
                            <Badge variant={
                              job.status === 'completed' ? 'default' : 
                              job.status === 'running' ? 'secondary' : 'destructive'
                            }>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(job.startTime)}</TableCell>
                          <TableCell>
                            {job.status === 'completed' && job.endTime ? 
                              `${getTimeDiff(job.startTime, job.endTime)} mins` : 
                              job.status === 'running' ? 'In progress' : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {job.status === 'completed' ? 
                              `${job.itemsFound} items` : 
                              job.status === 'failed' ? 
                              <span className="text-destructive">{job.error}</span> : 
                              'Pending'}
                          </TableCell>
                          <TableCell>
                            {job.status === 'failed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleTriggerCrawl(job.target)}
                              >
                                <RefreshCw size={14} className="mr-1" /> Retry
                              </Button>
                            )}
                            {job.status === 'completed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleTriggerCrawl(job.target)}
                              >
                                <RefreshCw size={14} className="mr-1" /> Run Again
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={18} />
                Alert Management
              </CardTitle>
              <CardDescription>
                View and manage system alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <TableCell key={j}>
                              <div className="h-4 w-full animate-pulse bg-muted rounded"></div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      data?.alerts.map((alert: Alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>
                            <Badge variant={alert.type === 'negative' ? 'destructive' : 'secondary'}>
                              {alert.type === 'negative' ? 'Negative Content' : 'System'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {alert.type === 'negative' 
                              ? `Negative article detected in ${alert.department} department`
                              : alert.message}
                          </TableCell>
                          <TableCell>{formatDate(alert.time)}</TableCell>
                          <TableCell>
                            <Badge variant={alert.status === 'resolved' ? 'outline' : 'secondary'}>
                              {alert.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {alert.status !== 'resolved' ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleResolveAlert(alert.id)}
                              >
                                <Check size={14} className="mr-1" /> Resolve
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-sm">Resolved</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={18} />
            Export Data
          </CardTitle>
          <CardDescription>
            Export dashboard data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => exportData('excel')}>
              <FileSpreadsheet size={16} className="mr-2" />
              Export as Excel
            </Button>
            <Button variant="outline" onClick={() => exportData('pdf')}>
              <FileText size={16} className="mr-2" />
              Export as PDF
            </Button>
            <Button variant="outline" onClick={() => exportData('raw')}>
              <Download size={16} className="mr-2" />
              Export Raw Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

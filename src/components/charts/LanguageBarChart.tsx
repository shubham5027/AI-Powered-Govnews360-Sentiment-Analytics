
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LanguageCounts {
  [key: string]: number;
}

interface LanguageBarChartProps {
  data: LanguageCounts;
  className?: string;
}

export default function LanguageBarChart({ data, className }: LanguageBarChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  
  const languageNames = {
    en: 'English',
    hi: 'Hindi',
    ta: 'Tamil',
    te: 'Telugu',
    bn: 'Bengali',
    mr: 'Marathi',
  };
  
  useEffect(() => {
    const newChartData = Object.entries(data).map(([lang, count]) => ({
      name: languageNames[lang as keyof typeof languageNames] || lang.toUpperCase(),
      count,
    }));
    
    setChartData(newChartData);
  }, [data]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Language Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{fontSize: 12}}
                interval={0}
                tickMargin={8}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} articles`, '']}
                contentStyle={{ fontSize: '12px' }}
              />
              <Bar 
                dataKey="count" 
                fill="#8884d8" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

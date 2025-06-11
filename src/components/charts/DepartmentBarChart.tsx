
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface DepartmentCounts {
  [key: string]: number;
}

interface DepartmentBarChartProps {
  data: DepartmentCounts;
  className?: string;
}

export default function DepartmentBarChart({ data, className }: DepartmentBarChartProps) {
  const { t } = useLanguage();
  const [chartData, setChartData] = useState<any[]>([]);
  
  const departmentColors = {
    finance: '#3b82f6',
    health: '#8b5cf6',
    education: '#f59e0b',
    defense: '#6366f1',
    agriculture: '#84cc16',
    transport: '#06b6d4',
    other: '#6b7280',
  };
  
  useEffect(() => {
    const newChartData = Object.entries(data).map(([dept, count]) => ({
      name: t(dept as any),
      count,
      color: departmentColors[dept as keyof typeof departmentColors] || departmentColors.other,
    }));
    
    setChartData(newChartData);
  }, [data, t]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Department Distribution</CardTitle>
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
              <Bar dataKey="count" fill="#3b82f6">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

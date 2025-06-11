
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

interface SentimentPieChartProps {
  data: SentimentDistribution;
  className?: string;
}

export default function SentimentPieChart({ data, className }: SentimentPieChartProps) {
  const { t } = useLanguage();
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    setChartData([
      { name: t('positive'), value: data.positive, color: '#10b981' },
      { name: t('neutral'), value: data.neutral, color: '#6b7280' },
      { name: t('negative'), value: data.negative, color: '#ef4444' },
    ]);
  }, [data, t]);
  
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return percent * 100 > 5 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{t('sentiment')} Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}`, '']} />
              <Legend formatter={(value) => <span className="text-sm">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

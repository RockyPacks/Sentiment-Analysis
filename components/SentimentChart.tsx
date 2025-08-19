
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Emotion } from '../types';

interface SentimentChartProps {
  data: Emotion[];
}

const COLORS = ['#34d399', '#60a5fa', '#facc15', '#f87171', '#c084fc', '#fb923c'];

export const SentimentChart: React.FC<SentimentChartProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.score - a.score);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <XAxis type="number" domain={[0, 1]} hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          tickLine={false} 
          axisLine={false} 
          stroke="#94a3b8"
          width={80}
          tick={{fontSize: 12}}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          contentStyle={{
            background: 'rgba(30, 41, 59, 0.9)',
            borderColor: '#475569',
            borderRadius: '0.5rem',
            color: '#cbd5e1'
          }}
          formatter={(value: number) => [value.toFixed(2), 'Score']}
        />
        <Bar dataKey="score" barSize={20} radius={[0, 10, 10, 0]}>
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

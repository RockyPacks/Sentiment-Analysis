
import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface ScoreGaugeProps {
  score: number; // from -1 to 1
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  // Normalize score from [-1, 1] to [0, 100]
  const normalizedScore = ((score + 1) / 2) * 100;
  const data = [{ name: 'Score', value: normalizedScore }];
  
  // Determine color based on score
  const getColor = (s: number) => {
    if (s > 0.3) return '#4ade80'; // green-400
    if (s < -0.3) return '#f87171'; // red-400
    return '#38bdf8'; // sky-400
  };
  const color = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg h-full bg-slate-900/50 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Sentiment Score</h3>
        <div className="w-full h-32 relative">
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                barSize={12}
                data={data}
                startAngle={180}
                endAngle={0}
                >
                <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                />
                <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                    fill={color}
                />
                </RadialBarChart>
            </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold" style={{ color }}>
                    {score.toFixed(2)}
                </span>
            </div>
        </div>
    </div>
  );
};

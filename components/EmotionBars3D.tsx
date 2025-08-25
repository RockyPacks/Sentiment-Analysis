import React from 'react';
import type { Emotion } from '../types';

interface EmotionBars3DProps {
  data: Emotion[];
}

const COLORS = ['#34d399', '#60a5fa', '#facc15', '#f87171', '#c084fc', '#fb923c'];

const EmotionBar: React.FC<{ emotion: Emotion; index: number }> = ({ emotion, index }) => {
  const color = COLORS[index % COLORS.length];
  const barWidth = `${Math.max(emotion.score * 100, 1)}%`;
  const animationDelay = `${index * 100}ms`;

  return (
    <div className="flex items-center mb-3 group">
      <div className="w-24 text-right pr-4 text-slate-400 text-sm truncate">{emotion.name}</div>
      <div className="flex-1 bg-slate-700/50 rounded-sm h-4 overflow-hidden">
         <div 
           className="h-full rounded-sm transition-all duration-300"
           style={{
             '--bar-width': barWidth,
             width: barWidth,
             backgroundColor: color,
             animation: `growBar 0.5s ${animationDelay} ease-out forwards`,
             boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)',
           } as React.CSSProperties}
           role="progressbar"
           aria-valuenow={emotion.score}
           aria-valuemin={0}
           aria-valuemax={1}
           aria-label={`${emotion.name} score`}
         >
          {/* Subtle highlight on top */}
          <div className="w-full h-1/2 bg-white/10 rounded-t-sm"></div>
         </div>
      </div>
      <div className="w-16 text-left pl-3 font-mono text-slate-300 text-sm">{emotion.score.toFixed(2)}</div>
    </div>
  );
};


export const EmotionBars3D: React.FC<EmotionBars3DProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500">
                <p>No specific emotions detected.</p>
            </div>
        );
    }

  const sortedData = [...data].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full h-full overflow-y-auto pr-2">
      {sortedData.map((emotion, index) => (
        <EmotionBar key={emotion.name} emotion={emotion} index={index} />
      ))}
    </div>
  );
};
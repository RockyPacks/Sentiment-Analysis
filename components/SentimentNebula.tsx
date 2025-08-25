import React from 'react';
import type { AnalyzedReview } from '../types';

interface SentimentNebulaProps {
  data: AnalyzedReview[];
}

const sentimentConfig = {
  Positive: { color: '#34d399', shadow: 'rgba(52, 211, 153, 0.7)' },
  Negative: { color: '#f87171', shadow: 'rgba(248, 113, 113, 0.7)' },
  Neutral: { color: '#60a5fa', shadow: 'rgba(96, 165, 250, 0.7)' },
  Mixed: { color: '#facc15', shadow: 'rgba(250, 204, 21, 0.7)' },
};

const NebulaParticle: React.FC<{ result: AnalyzedReview, index: number }> = ({ result, index }) => {
    const { analysis } = result;
    const config = sentimentConfig[analysis.overallSentiment];
    
    // Position from left: map score from [-1, 1] to [5%, 95%]
    const left = (analysis.sentimentScore + 1) / 2 * 90 + 5;
    // Random vertical position
    const top = 10 + Math.random() * 80;
    // Size based on max emotion score, or sentiment intensity
    const intensity = Math.abs(analysis.sentimentScore);
    const size = 6 + intensity * 10;
    // Random animation delay for twinkling effect
    const animationDelay = `${Math.random() * 2}s`;
    
    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: config.color,
        borderRadius: '50%',
        boxShadow: `0 0 12px 1px ${config.shadow}`,
        animation: `twinkle 2s ease-in-out ${animationDelay} infinite`,
    };

    return (
        <div className="group" style={style}>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg w-64">
                <p className="font-bold text-slate-300">{analysis.overallSentiment} ({analysis.sentimentScore.toFixed(2)})</p>
                <p className="text-slate-400 truncate italic">"{result.sourceText}"</p>
            </div>
        </div>
    );
};


export const SentimentNebula: React.FC<SentimentNebulaProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>Analysis results will appear here.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.7; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
       <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-red-500/0 via-slate-600 to-green-500/0" />
       <div className="absolute top-1/2 left-[5%] text-xs text-red-400">-1.0</div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 text-xs text-sky-400">0.0</div>
       <div className="absolute top-1/2 right-[5%] text-xs text-green-400">+1.0</div>
      {data.map((result, index) => (
        <NebulaParticle key={result.id} result={result} index={index} />
      ))}
    </div>
  );
};

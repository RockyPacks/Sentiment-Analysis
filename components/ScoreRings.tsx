import React from 'react';

interface ScoreRingsProps {
  score: number; // from -1 to 1
}

export const ScoreRings: React.FC<ScoreRingsProps> = ({ score }) => {
  const getColor = (s: number) => {
    if (s > 0.3) return '#4ade80'; // green-400
    if (s < -0.3) return '#f87171'; // red-400
    return '#38bdf8'; // sky-400
  };
  const color = getColor(score);

  const ringStyle: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      borderStyle: 'solid',
      borderRadius: '50%',
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider absolute top-6">Sentiment Score</h3>
        <div className="relative w-36 h-36">
            <div
                className="animate-spin-slow"
                style={{ ...ringStyle, width: '100%', height: '100%', borderWidth: '2px', borderColor: `${color}40`, boxShadow: `0 0 8px ${color}40` }}
            ></div>
            <div
                className="animate-spin-medium"
                style={{ ...ringStyle, width: '80%', height: '80%', borderWidth: '3px', borderColor: `${color}80`, boxShadow: `0 0 12px ${color}80` }} 
            ></div>
            <div
                className="animate-spin-fast"
                style={{ ...ringStyle, width: '60%', height: '60%', borderWidth: '2px', borderColor: color, boxShadow: `0 0 15px ${color}` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold" style={{ color }}>
                    {score.toFixed(2)}
                </span>
            </div>
        </div>
    </div>
  );
};
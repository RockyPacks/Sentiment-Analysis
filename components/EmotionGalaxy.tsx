import React from 'react';
import type { Emotion } from '../types';

interface EmotionGalaxyProps {
  data: Emotion[];
}

const COLORS = ['#34d399', '#60a5fa', '#facc15', '#f87171', '#c084fc', '#fb923c'];

const EmotionPlanet: React.FC<{ emotion: Emotion; index: number }> = ({ emotion, index }) => {
  const color = COLORS[index % COLORS.length];
  // Score (0-1) determines size (e.g., 8px to 24px) and distance from center.
  // Higher score = bigger and closer to center.
  const size = 8 + emotion.score * 16;
  // Orbit radius: higher score = smaller orbit
  const orbitRadius = 80 - emotion.score * 60;
  // Randomize starting position and animation duration for variety
  const animationDuration = 10 + Math.random() * 10;
  const animationDelay = Math.random() * -10;
  const startAngle = Math.random() * 360;

  const orbitStyle: React.CSSProperties = {
    width: `${orbitRadius * 2}px`,
    height: `${orbitRadius * 2}px`,
    animation: `spin ${animationDuration}s linear ${animationDelay}s infinite`,
  };

  const planetContainerStyle: React.CSSProperties = {
    transform: `rotate(${startAngle}deg)`,
  };

  const planetStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    boxShadow: `0 0 12px ${color}, inset 0 0 ${size / 4}px rgba(255,255,255,0.5)`,
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-slate-700/50" style={orbitStyle}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full" style={planetContainerStyle}>
        <div className="group absolute top-0 -translate-y-1/2">
          <div className="w-full h-full rounded-full transition-transform duration-300 group-hover:scale-125" style={planetStyle}></div>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            {emotion.name}: {emotion.score.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export const EmotionGalaxy: React.FC<EmotionGalaxyProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>No specific emotions detected.</p>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.score - a.score);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="w-2 h-2 bg-teal-300 rounded-full shadow-[0_0_15px_5px_rgba(50,215,195,0.4)]" aria-hidden="true"></div>
      {sortedData.map((emotion, index) => (
        <EmotionPlanet key={emotion.name} emotion={emotion} index={index} />
      ))}
    </div>
  );
};
import React from 'react';
import type { Sentiment } from '../types';
import { PositiveIcon, NegativeIcon, NeutralIcon, MixedIcon } from './IconComponents';

interface SentimentCubeProps {
  sentiment: Sentiment;
}

const sentimentConfig = {
  Positive: {
    icon: PositiveIcon,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  Negative: {
    icon: NegativeIcon,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  Neutral: {
    icon: NeutralIcon,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
  },
  Mixed: {
    icon: MixedIcon,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
};

const CubeFace: React.FC<{ transform: string; bgColor: string; borderColor: string; children: React.ReactNode }> = ({ transform, bgColor, borderColor, children }) => (
  <div
    className={`absolute w-[120px] h-[120px] flex items-center justify-center ${bgColor} border ${borderColor}`}
    style={{ transform, backfaceVisibility: 'hidden' }}
  >
    {children}
  </div>
);

export const SentimentCube: React.FC<SentimentCubeProps> = ({ sentiment }) => {
  const config = sentimentConfig[sentiment];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900/50 border border-slate-700 rounded-lg p-4">
         <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Overall Sentiment</h3>
        <div className="group flex-grow flex items-center justify-center" style={{ perspective: '1200px' }}>
            <div className="relative w-[120px] h-[120px] animate-cube-spin" style={{ transformStyle: 'preserve-3d' }}>
                <CubeFace transform="rotateY(0deg) translateZ(60px)" {...config}>
                    <div className="flex flex-col items-center text-center p-2">
                        <Icon className={`w-10 h-10 ${config.color}`} />
                        <p className={`mt-1 text-lg font-bold ${config.color}`}>{sentiment}</p>
                    </div>
                </CubeFace>
                <CubeFace transform="rotateY(90deg) translateZ(60px)" {...config}><Icon className={`w-12 h-12 ${config.color}`} /></CubeFace>
                <CubeFace transform="rotateY(180deg) translateZ(60px)" {...config}><Icon className={`w-12 h-12 ${config.color}`} /></CubeFace>
                <CubeFace transform="rotateY(-90deg) translateZ(60px)" {...config}><Icon className={`w-12 h-12 ${config.color}`} /></CubeFace>
                <CubeFace transform="rotateX(90deg) translateZ(60px)" {...config}><Icon className={`w-12 h-12 ${config.color}`} /></CubeFace>
                <CubeFace transform="rotateX(-90deg) translateZ(60px)" {...config}><Icon className={`w-12 h-12 ${config.color}`} /></CubeFace>
            </div>
        </div>
    </div>
  );
};
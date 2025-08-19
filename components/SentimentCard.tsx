
import React from 'react';
import type { Sentiment } from '../types';
import { PositiveIcon, NegativeIcon, NeutralIcon, MixedIcon } from './IconComponents';

interface SentimentCardProps {
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

export const SentimentCard: React.FC<SentimentCardProps> = ({ sentiment }) => {
  const config = sentimentConfig[sentiment];
  const Icon = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-lg h-full ${config.bgColor} border ${config.borderColor}`}>
      <Icon className={`w-16 h-16 mb-3 ${config.color}`} />
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Overall Sentiment</h3>
      <p className={`text-3xl font-bold ${config.color}`}>{sentiment}</p>
    </div>
  );
};

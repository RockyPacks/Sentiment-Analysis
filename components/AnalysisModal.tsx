import React from 'react';
import type { SentimentAnalysisResult } from '../types';
import { SentimentCube } from './SentimentCube';
import { ScoreRings } from './ScoreRings';
import { EmotionGalaxy } from './EmotionGalaxy';

interface AnalysisModalProps {
  result: SentimentAnalysisResult;
  onClose: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ result, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-modal-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative bg-slate-800/80 w-full max-w-4xl m-4 p-6 rounded-2xl shadow-lg border border-slate-700 animate-modal-slide-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 rounded-full hover:bg-slate-700 hover:text-white transition-colors z-10"
          aria-label="Close analysis modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-semibold text-center text-teal-400 mb-6">Analysis Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-56">
                <SentimentCube sentiment={result.overallSentiment} />
            </div>
            <div className="h-56">
                <ScoreRings score={result.sentimentScore} />
            </div>
            <div className="md:col-span-2 space-y-4">
                <h3 className="text-xl font-semibold text-slate-300 text-center md:text-left">Emotion Galaxy</h3>
                <div className="h-64 w-full bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <EmotionGalaxy data={result.emotions} />
                </div>
            </div>
            <div className="md:col-span-2 space-y-4">
                <h3 className="text-xl font-semibold text-slate-300 text-center md:text-left">Summary</h3>
                <div className="h-40 text-slate-400 bg-slate-900/50 p-4 rounded-lg border border-slate-700 overflow-y-auto">
                    {result.summary}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
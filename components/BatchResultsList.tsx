import React, { useState } from 'react';
import type { AnalyzedReview } from '../types';
import { PositiveIcon, NegativeIcon, NeutralIcon, MixedIcon } from './IconComponents';

const sentimentMap = {
    Positive: { icon: PositiveIcon, color: 'text-green-400', bg: 'bg-green-500/10' },
    Negative: { icon: NegativeIcon, color: 'text-red-400', bg: 'bg-red-500/10' },
    Neutral: { icon: NeutralIcon, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    Mixed: { icon: MixedIcon, color: 'text-amber-400', bg: 'bg-amber-500/10' },
};

const ResultItem: React.FC<{ result: AnalyzedReview }> = ({ result }) => {
    const [isOpen, setIsOpen] = useState(false);
    const config = sentimentMap[result.analysis.overallSentiment];
    const SentimentIcon = config.icon;

    return (
        <div className={`border border-slate-700 rounded-lg overflow-hidden transition-all duration-300 ${isOpen ? config.bg : 'bg-slate-800/50'}`}>
            <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-4 overflow-hidden">
                    <SentimentIcon className={`w-6 h-6 flex-shrink-0 ${config.color}`} />
                    <div className="flex-grow overflow-hidden">
                        <p className="text-sm text-slate-300 truncate">{result.sourceText}</p>
                        <p className="text-xs text-slate-500">{result.sourceFileName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                    <span className={`text-sm font-semibold ${config.color}`}>{result.analysis.overallSentiment}</span>
                    <span className="font-mono text-slate-400 text-sm hidden sm:block">{result.analysis.sentimentScore.toFixed(2)}</span>
                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 animate-fade-in">
                    <div className="mt-2 pt-4 border-t border-slate-700 space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-teal-400 mb-1">Full Text</h4>
                            <p className="text-sm text-slate-400 bg-slate-900/50 p-3 rounded-md max-h-32 overflow-y-auto">{result.sourceText}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-teal-400 mb-1">AI Summary</h4>
                            <p className="text-sm text-slate-400">{result.analysis.summary}</p>
                        </div>
                         {result.analysis.emotions.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-teal-400 mb-2">Emotions Detected</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.analysis.emotions.map(emotion => (
                                        <div key={emotion.name} className="bg-slate-700 px-2 py-1 rounded-full text-xs text-slate-300">
                                            {emotion.name} <span className="font-mono text-slate-400">{emotion.score.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {result.error && (
                             <div>
                                <h4 className="text-sm font-semibold text-red-400 mb-1">Processing Error</h4>
                                <p className="text-sm text-red-300">{result.error}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

interface BatchResultsListProps {
    results: AnalyzedReview[];
}

export const BatchResultsList: React.FC<BatchResultsListProps> = ({ results }) => {
    return (
        <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700">
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">Detailed Results</h2>
            <div className="space-y-2">
                {results.map(result => (
                    <ResultItem key={result.id} result={result} />
                ))}
            </div>
        </div>
    );
};

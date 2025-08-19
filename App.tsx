
import React, { useState, useCallback } from 'react';
import { analyzeSentiment } from './services/geminiService';
import type { SentimentAnalysisResult } from './types';
import { SentimentChart } from './components/SentimentChart';
import { ScoreGauge } from './components/ScoreGauge';
import { SentimentCard } from './components/SentimentCard';
import { LoadingSpinner } from './components/LoadingSpinner';

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<SentimentAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await analyzeSentiment(text);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [text]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
            Sentiment Analysis Dashboard
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Uncover emotional insights from your text with Gemini
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 animate-slide-in-up">
            <h2 className="text-2xl font-semibold mb-4 text-teal-400">Enter Text</h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your customer review, social media post, or any text here..."
              className="w-full h-64 p-4 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-300 resize-none text-slate-300"
              disabled={isLoading}
            />
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !text.trim()}
              className="mt-4 w-full flex justify-center items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? <LoadingSpinner /> : 'Analyze Sentiment'}
            </button>
          </div>

          {/* Analysis Output Section */}
          <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 min-h-[400px] flex items-center justify-center">
            {isLoading && (
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-slate-400">Analyzing text... this may take a moment.</p>
              </div>
            )}
            {error && (
              <div className="text-center text-red-400 animate-fade-in">
                <h3 className="text-xl font-semibold">An Error Occurred</h3>
                <p>{error}</p>
              </div>
            )}
            {!isLoading && !error && !analysisResult && (
              <div className="text-center text-slate-500 animate-fade-in">
                <h3 className="text-xl font-semibold">Awaiting Analysis</h3>
                <p>Your sentiment results will appear here.</p>
              </div>
            )}
            {analysisResult && (
              <div className="w-full animate-fade-in space-y-6">
                 <h2 className="text-2xl font-semibold text-center text-teal-400 mb-4">Analysis Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SentimentCard sentiment={analysisResult.overallSentiment} />
                    <ScoreGauge score={analysisResult.sentimentScore} />
                </div>
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-300">Emotion Breakdown</h3>
                    <div className="h-64 w-full bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <SentimentChart data={analysisResult.emotions} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-300">Summary</h3>
                    <p className="text-slate-400 bg-slate-900/50 p-4 rounded-lg border border-slate-700">{analysisResult.summary}</p>
                 </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

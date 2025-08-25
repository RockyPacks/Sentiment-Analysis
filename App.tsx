import React, { useState } from 'react';
import { ManualAnalyzer } from './components/ManualAnalyzer';
import { ReviewAggregator } from './components/ReviewAggregator';

type Page = 'aggregator' | 'manual';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('aggregator');

  const navButtonClasses = (isActive: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-teal-500 text-white'
        : 'text-slate-300 hover:bg-slate-700/50'
    }`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
            Sentiment Analysis Dashboard
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Uncover emotional insights from text with Gemini
          </p>
        </header>

        <nav className="flex justify-center mb-8">
          <div className="flex p-1 space-x-1 bg-slate-800/50 border border-slate-700 rounded-lg">
            <button
              onClick={() => setPage('aggregator')}
              className={navButtonClasses(page === 'aggregator')}
              aria-current={page === 'aggregator' ? 'page' : undefined}
            >
              Review Aggregator
            </button>
            <button
              onClick={() => setPage('manual')}
              className={navButtonClasses(page === 'manual')}
              aria-current={page === 'manual' ? 'page' : undefined}
            >
              Manual Analyzer
            </button>
          </div>
        </nav>

        <main>
          {page === 'aggregator' && <ReviewAggregator />}
          {page === 'manual' && <ManualAnalyzer />}
        </main>
      </div>
    </div>
  );
};

export default App;
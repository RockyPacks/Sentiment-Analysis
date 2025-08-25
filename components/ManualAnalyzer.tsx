import React, { useState, useCallback, useEffect } from 'react';
import { analyzeSentiment } from '../services/geminiService';
import type { SentimentAnalysisResult, AnalysisHistoryItem } from '../types';
import { EmotionGalaxy } from './EmotionGalaxy';
import { ScoreRings } from './ScoreRings';
import { SentimentCube } from './SentimentCube';
import { LoadingSpinner } from './LoadingSpinner';
import { ExportControls } from './ExportControls';
import { readFileContent } from '../services/fileReaderService';
import { UploadIcon, HistoryIcon, TrashIcon, PositiveIcon, NegativeIcon, NeutralIcon, MixedIcon } from './IconComponents';

const sentimentMap = {
    Positive: { icon: PositiveIcon, color: 'text-green-400' },
    Negative: { icon: NegativeIcon, color: 'text-red-400' },
    Neutral: { icon: NeutralIcon, color: 'text-sky-400' },
    Mixed: { icon: MixedIcon, color: 'text-amber-400' },
};

export const ManualAnalyzer: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<SentimentAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // Load history from localStorage on component mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('sentimentAnalysisHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      localStorage.removeItem('sentimentAnalysisHistory');
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sentimentAnalysisHistory', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  }, [history]);

  const handleAnalyze = useCallback(async () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      setError('Please enter some text to analyze.');
      return;
    }

    const wordCount = trimmedText.split(/\s+/).filter(Boolean).length;
    if (wordCount < 3) {
      setError('Please enter at least 3 words for a meaningful analysis.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setActiveHistoryId(null);
    try {
      const result = await analyzeSentiment(text);
      setAnalysisResult(result);

      // Add to history
      const newHistoryItem: AnalysisHistoryItem = {
        id: new Date().toISOString(),
        timestamp: new Date().toLocaleString(),
        sourceText: text,
        analysis: result,
      };
      setHistory(prevHistory => [newHistoryItem, ...prevHistory.slice(0, 19)]); // Keep latest 20
      setActiveHistoryId(newHistoryItem.id);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Analysis failed: ${errorMessage} Please try again.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [text]);
  
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    setError(null);
    setAnalysisResult(null);
    setText('');
    setFileName(file.name);
    setActiveHistoryId(null);

    try {
        const content = await readFileContent(file);
        setText(content);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while reading the file.';
        setError(errorMessage);
        setFileName(null);
    } finally {
        setIsParsingFile(false);
        if (event.target) {
            event.target.value = '';
        }
    }
  }, []);

  const clearFileUpload = useCallback(() => {
    setFileName(null);
    setText('');
    setError(null);
    setAnalysisResult(null);
    setActiveHistoryId(null);
  }, []);

  const handleSelectHistory = (item: AnalysisHistoryItem) => {
    setText(item.sourceText);
    setAnalysisResult(item.analysis);
    setError(null);
    setIsLoading(false);
    setFileName(null);
    setActiveHistoryId(item.id);
  };

  const handleDeleteHistory = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== idToDelete));
    if(activeHistoryId === idToDelete) {
        setAnalysisResult(null);
        setActiveHistoryId(null);
        setText('');
    }
  };
  
  const handleClearHistory = () => {
    setHistory([]);
    setAnalysisResult(null);
    setActiveHistoryId(null);
    setText('');
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      {/* Input & History Section (span 5) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 animate-slide-in-up space-y-4">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-teal-400">Enter Text</h2>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (fileName) setFileName(null); // Detach from file
                if (activeHistoryId) setActiveHistoryId(null); // Detach from history
              }}
              placeholder="Paste text here, or upload a file below..."
              className="w-full h-48 p-4 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-300 resize-none text-slate-300"
              disabled={isLoading || isParsingFile}
              aria-label="Text input for sentiment analysis"
            />
          </div>
          
          <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative px-3 bg-slate-800 text-slate-500 text-sm">OR</div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-slate-300">Upload a file</h3>
            {isParsingFile ? (
              <div className="flex items-center justify-center w-full h-32 px-6 border-2 border-slate-600 border-dashed rounded-lg bg-slate-900">
                  <LoadingSpinner />
                  <p className="ml-3 text-slate-400">Reading file content...</p>
              </div>
            ) : fileName ? (
                <div className="flex items-center justify-between p-3 pl-4 bg-slate-900 border border-slate-600 rounded-lg">
                    <span className="text-slate-300 truncate font-medium">{fileName}</span>
                    <button
                        onClick={clearFileUpload}
                        className="p-1 text-slate-400 rounded-full hover:bg-slate-700 hover:text-white transition-colors"
                        aria-label="Clear file"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div className="w-full">
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-900/50 hover:bg-slate-800/60 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                            <UploadIcon className="w-8 h-8 mb-4 text-slate-400" />
                            <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-slate-500">PDF, DOCX, JSON, or TXT</p>
                        </div>
                        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.json,.txt" disabled={isLoading || isParsingFile} />
                    </label>
                </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading || isParsingFile || !text.trim()}
            className="!mt-6 w-full flex justify-center items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {isLoading ? <><LoadingSpinner /><span>Analyzing...</span></> : 'Analyze Sentiment'}
          </button>
        </div>

        {/* History Panel */}
        <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 animate-slide-in-up">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-teal-400 flex items-center gap-2"><HistoryIcon className="w-6 h-6" /> Analysis History</h2>
                {history.length > 0 && (
                    <button onClick={handleClearHistory} className="text-xs text-slate-400 hover:text-red-400 transition-colors">Clear All</button>
                )}
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {history.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">Your past analyses will appear here.</p>
                ) : (
                    history.map(item => {
                        const SentimentIcon = sentimentMap[item.analysis.overallSentiment].icon;
                        const sentimentColor = sentimentMap[item.analysis.overallSentiment].color;
                        return (
                            <div
                                key={item.id}
                                onClick={() => handleSelectHistory(item)}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${activeHistoryId === item.id ? 'bg-teal-500/20 border-teal-500' : 'bg-slate-900/50 hover:bg-slate-700/50 border-transparent'} border`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <SentimentIcon className={`w-6 h-6 flex-shrink-0 ${sentimentColor}`} />
                                    <div className="overflow-hidden">
                                        <p className="text-sm text-slate-300 truncate">{item.sourceText}</p>
                                        <p className="text-xs text-slate-500">{item.timestamp}</p>
                                    </div>
                                </div>
                                <button onClick={(e) => handleDeleteHistory(item.id, e)} className="p-1 text-slate-500 hover:text-red-400 rounded-full flex-shrink-0 ml-2">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
      </div>

      {/* Analysis Output Section (span 7) */}
      <div className="lg:col-span-7 bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 min-h-[400px] flex flex-col justify-center">
        {(isLoading || isParsingFile) && (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-slate-400">
              {isParsingFile ? "Reading file..." : "Analyzing text... this may take a moment."}
            </p>
          </div>
        )}
        {error && (
          <div className="text-center text-red-400 animate-fade-in">
            <h3 className="text-xl font-semibold">An Error Occurred</h3>
            <p>{error}</p>
          </div>
        )}
        {!isLoading && !isParsingFile && !error && !analysisResult && (
          <div className="text-center text-slate-500 animate-fade-in">
            <h3 className="text-xl font-semibold">Awaiting Analysis</h3>
            <p>Your sentiment results will appear here.</p>
          </div>
        )}
        {analysisResult && (
          <div className="w-full animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-teal-400">Analysis Results</h2>
                <ExportControls data={analysisResult} />
             </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-56">
                    <SentimentCube sentiment={analysisResult.overallSentiment} />
                </div>
                <div className="h-56">
                    <ScoreRings score={analysisResult.sentimentScore} />
                </div>
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xl font-semibold text-slate-300">Emotion Galaxy</h3>
                    <div className="h-64 w-full bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <EmotionGalaxy data={analysisResult.emotions} />
                    </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xl font-semibold text-slate-300">Summary</h3>
                    <div className="h-48 text-slate-400 bg-slate-900/50 p-4 rounded-lg border border-slate-700 overflow-y-auto">
                        {analysisResult.summary}
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
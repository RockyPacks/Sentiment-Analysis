import React, { useState, useCallback, useMemo } from 'react';
import { analyzeSentiment, extractReviewsFromText } from '../services/geminiService';
import { readFileContent } from '../services/fileReaderService';
import type { AnalyzedReview, ProcessingFile, Sentiment } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { SentimentNebula } from './SentimentNebula';
import { BatchResultsList } from './BatchResultsList';
import { BatchExportControls } from './BatchExportControls';
import { UploadIcon, BatchIcon, TrashIcon } from './IconComponents';

type Status = 'idle' | 'processing' | 'completed' | 'error';

export const BatchAnalyzer: React.FC = () => {
    const [files, setFiles] = useState<ProcessingFile[]>([]);
    const [results, setResults] = useState<AnalyzedReview[]>([]);
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState({ stage: '', detail: '', percent: 0 });

    const handleFileChange = (newFiles: FileList | null) => {
        if (!newFiles) return;
        const newProcessingFiles = Array.from(newFiles).map(file => Object.assign(file, { id: `${file.name}-${file.lastModified}` }));
        setFiles(prev => {
            const existingIds = new Set(prev.map(f => f.id));
            const uniqueNewFiles = newProcessingFiles.filter(f => !existingIds.has(f.id));
            return [...prev, ...uniqueNewFiles];
        });
        setStatus('idle');
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const clearAll = () => {
        setFiles([]);
        setResults([]);
        setError(null);
        setStatus('idle');
    };
    
    const handleAnalyze = useCallback(async () => {
        setStatus('processing');
        setError(null);
        setResults([]);
        let allAnalyzedReviews: AnalyzedReview[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                setProgress({ stage: `[${i + 1}/${files.length}] Reading file`, detail: file.name, percent: (i / files.length) * 100 });
                const content = await readFileContent(file);
                
                setProgress({ stage: `[${i + 1}/${files.length}] Extracting reviews`, detail: file.name, percent: ((i + 0.25) / files.length) * 100 });
                const reviewTexts = await extractReviewsFromText(content);

                if (reviewTexts.length === 0) continue;

                const fileReviews: AnalyzedReview[] = [];

                for (let j = 0; j < reviewTexts.length; j++) {
                    const text = reviewTexts[j];
                    setProgress({
                        stage: `[${i + 1}/${files.length}] Analyzing review ${j+1}/${reviewTexts.length}`,
                        detail: file.name,
                        percent: ((i + 0.5 + (j / reviewTexts.length) * 0.5) / files.length) * 100
                    });

                    try {
                        const analysis = await analyzeSentiment(text);
                        fileReviews.push({
                            id: `${file.id}-${j}`,
                            sourceFileName: file.name,
                            sourceText: text,
                            analysis,
                        });
                    } catch (e) {
                         const message = e instanceof Error ? e.message : 'Unknown analysis error';
                         fileReviews.push({
                            id: `${file.id}-${j}`,
                            sourceFileName: file.name,
                            sourceText: text,
                            analysis: { overallSentiment: 'Neutral', sentimentScore: 0, summary: `Analysis failed: ${message}`, emotions: []},
                            error: message,
                        });
                    }
                    allAnalyzedReviews = [...allAnalyzedReviews, ...fileReviews.slice(-1)];
                    setResults([...allAnalyzedReviews]);
                }

            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(`Failed to process file ${file.name}: ${message}`);
                // Add a placeholder result indicating the error for this file
                allAnalyzedReviews.push({
                    id: `${file.id}-error`,
                    sourceFileName: file.name,
                    sourceText: `Could not read or process this file. Error: ${message}`,
                    analysis: { overallSentiment: 'Neutral', sentimentScore: 0, summary: 'File processing failed.', emotions: [] },
                    error: message,
                });
                setResults([...allAnalyzedReviews]);
            }
        }
        setProgress({ stage: 'Completed', detail: '', percent: 100 });
        setStatus('completed');
    }, [files]);

    const sentimentCounts = useMemo(() => {
        return results.reduce((acc, curr) => {
            const sentiment = curr.analysis.overallSentiment;
            acc[sentiment] = (acc[sentiment] || 0) + 1;
            return acc;
        }, {} as Record<Sentiment, number>);
    }, [results]);

    const averageScore = useMemo(() => {
        if (results.length === 0) return 0;
        const totalScore = results.reduce((acc, curr) => acc + curr.analysis.sentimentScore, 0);
        return totalScore / results.length;
    }, [results]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <BatchIcon className="w-8 h-8 text-teal-400" />
                    <h2 className="text-2xl font-semibold text-teal-400">Batch Sentiment Analyzer</h2>
                </div>

                <div 
                    className="flex flex-col items-center justify-center w-full p-6 border-2 border-slate-600 border-dashed rounded-lg bg-slate-900/50 hover:bg-slate-800/60 transition-colors"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleFileChange(e.dataTransfer.files); }}
                >
                    <UploadIcon className="w-8 h-8 mb-4 text-slate-400" />
                    <label htmlFor="batch-file-upload" className="relative cursor-pointer">
                        <span className="text-teal-400 font-semibold">Click to upload files</span>
                        <input id="batch-file-upload" type="file" multiple className="sr-only" onChange={e => handleFileChange(e.target.files)} accept=".pdf,.docx,.json,.txt" />
                    </label>
                    <p className="mt-1 text-sm text-slate-500">or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-2">Supports PDF, DOCX, JSON, TXT</p>
                </div>

                {files.length > 0 && (
                    <div className="mt-6 space-y-2">
                        <h3 className="text-lg font-medium text-slate-300">File Queue ({files.length})</h3>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                            {files.map(file => (
                                <div key={file.id} className="flex items-center justify-between p-2 pl-3 bg-slate-700/50 rounded-md">
                                    <p className="text-sm text-slate-300 truncate">{file.name}</p>
                                    <button onClick={() => removeFile(file.id)} className="p-1 text-slate-400 hover:text-red-400 rounded-full">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleAnalyze}
                        disabled={status === 'processing' || files.length === 0}
                        className="w-full flex justify-center items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                        {status === 'processing' ? <><LoadingSpinner /><span>Processing...</span></> : `Analyze ${files.length} File(s)`}
                    </button>
                    <button
                        onClick={clearAll}
                        disabled={status === 'processing'}
                        className="w-full sm:w-auto px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {status === 'processing' && (
                <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 text-center">
                    <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4">
                        <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${progress.percent}%` }}></div>
                    </div>
                    <p className="font-semibold text-teal-400">{progress.stage}</p>
                    <p className="text-sm text-slate-400 truncate">{progress.detail}</p>
                </div>
            )}
            
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
                    <h3 className="font-bold">An Error Occurred</h3>
                    <p>{error}</p>
                </div>
            )}
            
            {(status === 'completed' || (status === 'processing' && results.length > 0)) && (
                <div className="space-y-8">
                    <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                             <h2 className="text-2xl font-semibold text-teal-400">Batch Analysis Results</h2>
                             <BatchExportControls results={results} summary={{ sentimentCounts, averageScore, totalReviews: results.length }} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 h-96 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-300 mb-2 text-center">Sentiment Nebula</h3>
                                <SentimentNebula data={results} />
                            </div>
                            <div className="h-96 bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex flex-col justify-center text-center">
                                <h3 className="text-lg font-semibold text-slate-300 mb-4">Summary</h3>
                                <p className="text-4xl font-bold text-white">{results.length}</p>
                                <p className="text-slate-400 mb-6">Total Reviews Analyzed</p>

                                <div className="space-y-2 text-left">
                                    {Object.entries(sentimentCounts).map(([sentiment, count]) => (
                                        <div key={sentiment} className="flex justify-between items-center text-sm">
                                            <span className="text-slate-300">{sentiment}</span>
                                            <span className="font-mono text-slate-400">{count} ({(count / results.length * 100).toFixed(1)}%)</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between">
                                     <span className="text-slate-300 font-semibold">Avg. Score</span>
                                     <span className="font-mono text-teal-400 font-bold">{averageScore.toFixed(3)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <BatchResultsList results={results} />
                </div>
            )}
        </div>
    );
};

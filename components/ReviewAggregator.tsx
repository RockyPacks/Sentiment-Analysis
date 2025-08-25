import React, { useState, useCallback } from 'react';
import { generateReviews, analyzeSentiment } from '../services/geminiService';
import type { Review, SentimentAnalysisResult } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ReviewList } from './ReviewList';
import { AnalysisModal } from './AnalysisModal';
import { SearchIcon, MovieIcon, RestaurantIcon, BookIcon, OnlineStoreIcon, DrinkIcon } from './IconComponents';

const categories = [
    { name: 'Movies', icon: MovieIcon, prompt: 'a recent popular movie' },
    { name: 'Restaurants', icon: RestaurantIcon, prompt: 'a well-known restaurant chain' },
    { name: 'Books', icon: BookIcon, prompt: 'a bestselling novel' },
    { name: 'Online Stores', icon: OnlineStoreIcon, prompt: 'a popular online store' },
    { name: 'Drinks', icon: DrinkIcon, prompt: 'a popular soft drink brand' },
];

export const ReviewAggregator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [analysisResult, setAnalysisResult] = useState<SentimentAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleSearch = useCallback(async (searchTopic: string) => {
        if (!searchTopic.trim()) {
            setError('Please enter a topic to search for reviews.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setReviews([]);
        try {
            const generatedReviews = await generateReviews(searchTopic);
            setReviews(generatedReviews);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate reviews: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleCategoryClick = (prompt: string) => {
        setTopic(prompt);
        handleSearch(prompt);
    };

    const handleAnalyzeReview = useCallback(async (review: Review) => {
        setSelectedReview(review);
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const result = await analyzeSentiment(review.reviewText);
            setAnalysisResult(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Analysis failed: ${errorMessage}`);
            // Close the modal if analysis fails
            setSelectedReview(null);
        } finally {
            setIsAnalyzing(false);
        }
    }, []);
    
    const closeModal = () => {
        setSelectedReview(null);
        setAnalysisResult(null);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">Find Reviews by Topic</h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearch(topic);
                    }}
                    className="flex flex-col sm:flex-row items-center gap-4"
                >
                    <div className="relative w-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., 'The Matrix', 'Joe's Pizza', 'Kindle Paperwhite'..."
                            className="w-full p-3 pl-10 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-300 text-slate-300"
                            disabled={isLoading}
                            aria-label="Search for a review topic"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !topic.trim()}
                        className="w-full sm:w-auto flex-shrink-0 flex justify-center items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Generate Reviews'}
                    </button>
                </form>
                <div className="mt-6">
                    <h3 className="text-sm font-medium text-slate-400 mb-3 text-center sm:text-left">Or explore categories</h3>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.name}
                                    onClick={() => handleCategoryClick(cat.prompt)}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 bg-slate-700/50 border border-slate-600 rounded-full hover:bg-slate-700 hover:border-teal-500 disabled:opacity-50 transition-all"
                                >
                                    <Icon className="w-4 h-4" />
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="min-h-[300px] flex items-center justify-center">
                {isLoading && (
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-slate-400">Generating realistic reviews with AI...</p>
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-400">
                        <h3 className="text-xl font-semibold">An Error Occurred</h3>
                        <p>{error}</p>
                    </div>
                )}
                {!isLoading && !error && reviews.length === 0 && (
                    <div className="text-center text-slate-500">
                        <h3 className="text-xl font-semibold">Ready to Dive In?</h3>
                        <p>Enter a topic above to generate and analyze reviews.</p>
                    </div>
                )}
                {reviews.length > 0 && <ReviewList reviews={reviews} onAnalyze={handleAnalyzeReview} />}
            </div>

            {selectedReview && analysisResult && (
                <AnalysisModal 
                    result={analysisResult}
                    onClose={closeModal}
                />
            )}
             {isAnalyzing && !analysisResult && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-slate-300 text-lg">Performing detailed analysis...</p>
                    </div>
                 </div>
            )}
        </div>
    );
};
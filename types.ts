export type Sentiment = 'Positive' | 'Negative' | 'Neutral' | 'Mixed';

export interface Emotion {
  name: string;
  score: number; // A score from 0 to 1
}

export interface SentimentAnalysisResult {
  overallSentiment: Sentiment;
  sentimentScore: number; // A score from -1.0 (very negative) to 1.0 (very positive)
  summary: string;
  emotions: Emotion[];
}

export interface Review {
  reviewerName: string;
  rating: number; // a score from 1 to 5
  reviewText: string;
}

// New type for history
export interface AnalysisHistoryItem {
  id: string;
  timestamp: string;
  sourceText: string;
  analysis: SentimentAnalysisResult;
}

// New types for Batch Analyzer
export interface AnalyzedReview {
  id: string; // Unique ID for key prop
  sourceFileName: string;
  sourceText: string;
  analysis: SentimentAnalysisResult;
  error?: string;
}

export interface ProcessingFile extends File {
  id: string;
}

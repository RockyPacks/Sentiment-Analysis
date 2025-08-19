
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

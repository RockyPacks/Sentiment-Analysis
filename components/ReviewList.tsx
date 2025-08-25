import React from 'react';
import type { Review } from '../types';
import { ReviewItem } from './ReviewItem';

interface ReviewListProps {
  reviews: Review[];
  onAnalyze: (review: Review) => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews, onAnalyze }) => {
  return (
    <div className="w-full space-y-4">
      {reviews.map((review, index) => (
        <div key={index} className="animate-slide-in-up" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}>
            <ReviewItem review={review} onAnalyze={onAnalyze} />
        </div>
      ))}
    </div>
  );
};
import React from 'react';
import type { Review } from '../types';
import { StarIcon } from './IconComponents';

interface ReviewItemProps {
  review: Review;
  onAnalyze: (review: Review) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <StarIcon key={i} className="w-5 h-5 text-amber-400" filled={i < rating} />
    ))}
  </div>
);

export const ReviewItem: React.FC<ReviewItemProps> = ({ review, onAnalyze }) => {
  return (
    <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 space-y-3 transition-all duration-300 hover:border-teal-500/50 hover:shadow-2xl">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-slate-200">{review.reviewerName}</h4>
          <StarRating rating={review.rating} />
        </div>
        <button
          onClick={() => onAnalyze(review)}
          className="px-4 py-2 text-sm font-medium bg-slate-700 text-teal-300 rounded-md hover:bg-slate-600 transition-colors"
        >
          Analyze
        </button>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed">
        {review.reviewText}
      </p>
    </div>
  );
};
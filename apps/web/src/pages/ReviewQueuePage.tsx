import React from 'react';
import { ReviewQueue } from '@/components/review-queue/ReviewQueue';

export const ReviewQueuePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Review Queue</h1>
        <p className="text-gray-600">
          Approve, edit, or reject AI-generated outreach before it reaches your prospects.
        </p>
      </header>
      <ReviewQueue />
    </div>
  );
};


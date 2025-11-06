import React from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { ReviewQueue } from '@/components/review-queue/ReviewQueue';

export const ReviewQueuePage: React.FC = () => {
  return (
    <DashboardLayout>
      <ReviewQueue />
    </DashboardLayout>
  );
};


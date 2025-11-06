import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

export const useReviewActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const approveMessage = async (reviewId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.approveReviewMessage(reviewId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to approve message');
      }
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to approve message');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const editMessage = async (
    reviewId: string,
    editedMessage: string,
    editedSubject?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.editReviewMessage(reviewId, {
        edited_message: editedMessage,
        edited_subject: editedSubject,
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to edit message');
      }
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to edit message');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectMessage = async (reviewId: string, reason?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.rejectReviewMessage(reviewId, reason);
      if (!response.success) {
        throw new Error(response.error || 'Failed to reject message');
      }
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reject message');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkApprove = async (reviewIds: string[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.bulkApproveReviewMessages(reviewIds);
      if (!response.success) {
        throw new Error(response.error || 'Failed to bulk approve messages');
      }
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to bulk approve messages');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkReject = async (reviewIds: string[], reason?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.bulkRejectReviewMessages(reviewIds, reason);
      if (!response.success) {
        throw new Error(response.error || 'Failed to bulk reject messages');
      }
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to bulk reject messages');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    approveMessage,
    editMessage,
    rejectMessage,
    bulkApprove,
    bulkReject,
    isLoading,
    error,
  };
};


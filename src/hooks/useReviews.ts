import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  type Review,
  type ReviewStats,
  type ReviewFilters,
  type ReviewSubmission,
  submitReview,
  getReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getUserReviews,
  hasUserReviewed,
  getUserReview
} from '../services/reviews.service';

interface UseReviewsOptions {
  recommendationId?: string;
  autoLoad?: boolean;
  filters?: ReviewFilters;
  limit?: number;
}

interface UseReviewsReturn {
  reviews: Review[];
  stats: ReviewStats;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  
  // User review status
  userReview: Review | null;
  hasUserReviewed: boolean;
  
  // Review operations
  submitReview: (reviewData: ReviewSubmission) => Promise<boolean>;
  updateReview: (reviewId: string, updateData: Partial<ReviewSubmission>) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  markHelpful: (reviewId: string) => Promise<boolean>;
  
  // Data loading
  loadReviews: (filters?: ReviewFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // User reviews
  loadUserReviews: (userId?: string) => Promise<Review[]>;
  
  // Utility
  clearError: () => void;
}

export const useReviews = (options: UseReviewsOptions = {}): UseReviewsReturn => {
  const { user } = useAuth();
  const { 
    recommendationId, 
    autoLoad = true, 
    filters = {}, 
    limit = 10 
  } = options;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    totalPhotos: 0,
    verifiedReviews: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<ReviewFilters>(filters);
  
  // User review state
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [hasUserReviewedState, setHasUserReviewedState] = useState(false);

  // Auto-load reviews when component mounts or recommendationId changes
  useEffect(() => {
    if (autoLoad && recommendationId) {
      loadReviews();
      checkUserReview();
    }
  }, [autoLoad, recommendationId]);

  const loadReviews = useCallback(async (newFilters?: ReviewFilters) => {
    if (!recommendationId) return;

    setLoading(true);
    setError(null);

    try {
      const filtersToUse = newFilters || currentFilters;
      setCurrentFilters(filtersToUse);
      setCurrentPage(1);

      const response = await getReviews(recommendationId, filtersToUse, 1, limit);
      
      setReviews(response.reviews);
      setStats(response.stats);
      setHasMore(response.hasMore);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('加载评价失败');
    } finally {
      setLoading(false);
    }
  }, [recommendationId, currentFilters, limit]);

  const loadMore = useCallback(async () => {
    if (!recommendationId || !hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const response = await getReviews(recommendationId, currentFilters, nextPage, limit);
      
      setReviews(prev => [...prev, ...response.reviews]);
      setHasMore(response.hasMore);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error('Error loading more reviews:', err);
      setError('加载更多评价失败');
    } finally {
      setLoading(false);
    }
  }, [recommendationId, hasMore, loading, currentPage, currentFilters, limit]);

  const refresh = useCallback(async () => {
    await loadReviews();
    await checkUserReview();
  }, [loadReviews]);

  const checkUserReview = useCallback(async () => {
    if (!recommendationId || !user) return;

    try {
      const hasReviewed = await hasUserReviewed(recommendationId);
      setHasUserReviewedState(hasReviewed);

      if (hasReviewed) {
        const userReviewData = await getUserReview(recommendationId);
        setUserReview(userReviewData);
      } else {
        setUserReview(null);
      }
    } catch (err) {
      console.error('Error checking user review:', err);
    }
  }, [recommendationId, user]);

  const handleSubmitReview = useCallback(async (reviewData: ReviewSubmission): Promise<boolean> => {
    try {
      setError(null);
      const review = await submitReview(reviewData);
      
      if (review) {
        setUserReview(review);
        setHasUserReviewedState(true);
        // Refresh reviews to show the new review
        await loadReviews();
        return true;
      }
      
      setError('提交评价失败');
      return false;
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('提交评价失败');
      return false;
    }
  }, [loadReviews]);

  const handleUpdateReview = useCallback(async (reviewId: string, updateData: Partial<ReviewSubmission>): Promise<boolean> => {
    try {
      setError(null);
      const updatedReview = await updateReview(reviewId, updateData);
      
      if (updatedReview) {
        setUserReview(updatedReview);
        // Refresh reviews to show the updated review
        await loadReviews();
        return true;
      }
      
      setError('更新评价失败');
      return false;
    } catch (err) {
      console.error('Error updating review:', err);
      setError('更新评价失败');
      return false;
    }
  }, [loadReviews]);

  const handleDeleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await deleteReview(reviewId);
      
      if (success) {
        setUserReview(null);
        setHasUserReviewedState(false);
        // Refresh reviews to remove the deleted review
        await loadReviews();
        return true;
      }
      
      setError('删除评价失败');
      return false;
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('删除评价失败');
      return false;
    }
  }, [loadReviews]);

  const handleMarkHelpful = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await markReviewHelpful(reviewId);
      
      if (success) {
        // Update the helpful count in the local state
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpful: review.helpful + 1 }
            : review
        ));
        return true;
      }
      
      setError('标记有用失败');
      return false;
    } catch (err) {
      console.error('Error marking review helpful:', err);
      setError('标记有用失败');
      return false;
    }
  }, []);

  const loadUserReviews = useCallback(async (userId?: string): Promise<Review[]> => {
    try {
      setError(null);
      const userReviews = await getUserReviews(userId);
      return userReviews;
    } catch (err) {
      console.error('Error loading user reviews:', err);
      setError('加载用户评价失败');
      return [];
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    reviews,
    stats,
    loading,
    error,
    hasMore,
    currentPage,
    
    // User review status
    userReview,
    hasUserReviewed: hasUserReviewedState,
    
    // Review operations
    submitReview: handleSubmitReview,
    updateReview: handleUpdateReview,
    deleteReview: handleDeleteReview,
    markHelpful: handleMarkHelpful,
    
    // Data loading
    loadReviews,
    loadMore,
    refresh,
    
    // User reviews
    loadUserReviews,
    
    // Utility
    clearError
  };
};

export default useReviews;
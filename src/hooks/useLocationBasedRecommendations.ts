import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import recommendationsService, { 
  type Recommendation, 
  type RecommendationFilters
} from '../services/recommendations.service';
import { getUserLocation } from '../services/profile.service';
import type { UserLocation } from '../types/profile';

interface UseLocationBasedRecommendationsOptions {
  autoLoad?: boolean;
  filters?: RecommendationFilters;
  limit?: number;
}

interface UseLocationBasedRecommendationsReturn {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  userLocation: UserLocation | null;
  hasMore: boolean;
  loadRecommendations: (filters?: RecommendationFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useLocationBasedRecommendations = (
  options: UseLocationBasedRecommendationsOptions = {}
): UseLocationBasedRecommendationsReturn => {
  const { user } = useAuth();
  const { autoLoad = true, filters = {}, limit = 20 } = options;

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<RecommendationFilters>(filters);

  // Load user location on mount
  useEffect(() => {
    if (user?.id) {
      loadUserLocation();
    }
  }, [user?.id]);

  // Auto-load recommendations when user location is available
  useEffect(() => {
    if (autoLoad && userLocation && user?.id) {
      loadRecommendations();
    }
  }, [autoLoad, userLocation, user?.id]);

  const loadUserLocation = async () => {
    if (!user?.id) return;

    try {
      const location = await getUserLocation(user.id);
      setUserLocation(location);
    } catch (err) {
      console.error('Error loading user location:', err);
    }
  };

  const loadRecommendations = useCallback(async (newFilters?: RecommendationFilters) => {
    if (!user?.id) {
      setError('Please log in to get personalized recommendations');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filtersToUse = newFilters || currentFilters;
      setCurrentFilters(filtersToUse);
      setCurrentPage(1);

      const response = await recommendationsService.getRecommendationsForUser(
        user.id,
        filtersToUse,
        1,
        limit
      );

      setRecommendations(response.recommendations);
      setHasMore(response.hasMore);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentFilters, limit]);

  const loadMore = useCallback(async () => {
    if (!user?.id || !hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const response = await recommendationsService.getRecommendationsForUser(
        user.id,
        currentFilters,
        nextPage,
        limit
      );

      setRecommendations(prev => [...prev, ...response.recommendations]);
      setHasMore(response.hasMore);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error('Error loading more recommendations:', err);
      setError('Failed to load more recommendations.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, hasMore, loading, currentPage, currentFilters, limit]);

  const refresh = useCallback(async () => {
    // Clear cache and reload
    recommendationsService.clearCache();
    await loadUserLocation();
    await loadRecommendations();
  }, [loadRecommendations]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    recommendations,
    loading,
    error,
    userLocation,
    hasMore,
    loadRecommendations,
    loadMore,
    refresh,
    clearError
  };
};

export default useLocationBasedRecommendations;
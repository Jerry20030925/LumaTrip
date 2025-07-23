import { supabase } from '../utils/supabaseClient';

export interface Review {
  id: string;
  recommendationId: string;
  userId: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  photos: string[];
  visitDate: Date;
  createdAt: Date;
  updatedAt: Date;
  helpful: number; // number of helpful votes
  verified: boolean; // whether the review is verified
  user: {
    id: string;
    displayName: string;
    avatar: string;
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  totalPhotos: number;
  verifiedReviews: number;
}

export interface ReviewFilters {
  rating?: number;
  verified?: boolean;
  withPhotos?: boolean;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  userId?: string;
}

export interface ReviewResponse {
  reviews: Review[];
  totalCount: number;
  hasMore: boolean;
  nextPage?: number;
  stats: ReviewStats;
}

export interface ReviewSubmission {
  recommendationId: string;
  rating: number;
  title: string;
  comment: string;
  photos?: string[];
  visitDate: Date;
}

class ReviewsService {
  private static instance: ReviewsService;

  private constructor() {}

  static getInstance(): ReviewsService {
    if (!ReviewsService.instance) {
      ReviewsService.instance = new ReviewsService();
    }
    return ReviewsService.instance;
  }

  /**
   * Submit a new review
   */
  async submitReview(reviewData: ReviewSubmission): Promise<Review | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user has already reviewed this recommendation
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('recommendation_id', reviewData.recommendationId)
        .eq('user_id', user.id)
        .single();

      if (existingReview) {
        throw new Error('You have already reviewed this place');
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          recommendation_id: reviewData.recommendationId,
          user_id: user.id,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          photos: reviewData.photos || [],
          visit_date: reviewData.visitDate.toISOString(),
          helpful: 0,
          verified: false // Would be set by admin/verification system
        })
        .select(`
          *,
          user:profiles(id, display_name, avatar)
        `)
        .single();

      if (error) {
        console.error('Error submitting review:', error);
        return null;
      }

      // Update recommendation rating
      await this.updateRecommendationRating(reviewData.recommendationId);

      return this.mapDatabaseToReview(data);
    } catch (error) {
      console.error('Error submitting review:', error);
      return null;
    }
  }

  /**
   * Get reviews for a recommendation
   */
  async getReviews(
    recommendationId: string,
    filters: ReviewFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewResponse> {
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          user:profiles(id, display_name, avatar)
        `)
        .eq('recommendation_id', recommendationId);

      // Apply filters
      if (filters.rating) {
        query = query.eq('rating', filters.rating);
      }

      if (filters.verified !== undefined) {
        query = query.eq('verified', filters.verified);
      }

      if (filters.withPhotos) {
        query = query.not('photos', 'is', null);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest':
          query = query.order('rating', { ascending: true });
          break;
        case 'helpful':
          query = query.order('helpful', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Get total count
      const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('recommendation_id', recommendationId);

      // Get paginated results
      const { data, error } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error('Error fetching reviews:', error);
        return {
          reviews: [],
          totalCount: 0,
          hasMore: false,
          stats: this.getEmptyStats()
        };
      }

      // Get review stats
      const stats = await this.getReviewStats(recommendationId);

      return {
        reviews: (data || []).map(this.mapDatabaseToReview),
        totalCount: count || 0,
        hasMore: ((page * limit) < (count || 0)),
        nextPage: ((page * limit) < (count || 0)) ? page + 1 : undefined,
        stats
      };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return {
        reviews: [],
        totalCount: 0,
        hasMore: false,
        stats: this.getEmptyStats()
      };
    }
  }

  /**
   * Get review statistics for a recommendation
   */
  async getReviewStats(recommendationId: string): Promise<ReviewStats> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating, photos, verified')
        .eq('recommendation_id', recommendationId);

      if (error) {
        console.error('Error fetching review stats:', error);
        return this.getEmptyStats();
      }

      const reviews = data || [];
      const totalReviews = reviews.length;

      if (totalReviews === 0) {
        return this.getEmptyStats();
      }

      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

      const ratingDistribution = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
      };

      const totalPhotos = reviews.reduce((sum, review) => sum + (review.photos?.length || 0), 0);
      const verifiedReviews = reviews.filter(r => r.verified).length;

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        totalPhotos,
        verifiedReviews
      };
    } catch (error) {
      console.error('Error calculating review stats:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * Update a review
   */
  async updateReview(reviewId: string, updateData: Partial<ReviewSubmission>): Promise<Review | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating: updateData.rating,
          title: updateData.title,
          comment: updateData.comment,
          photos: updateData.photos,
          visit_date: updateData.visitDate?.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .select(`
          *,
          user:profiles(id, display_name, avatar)
        `)
        .single();

      if (error) {
        console.error('Error updating review:', error);
        return null;
      }

      // Update recommendation rating
      await this.updateRecommendationRating(data.recommendation_id);

      return this.mapDatabaseToReview(data);
    } catch (error) {
      console.error('Error updating review:', error);
      return null;
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get review to update recommendation rating later
      const { data: review } = await supabase
        .from('reviews')
        .select('recommendation_id')
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting review:', error);
        return false;
      }

      // Update recommendation rating
      if (review) {
        await this.updateRecommendationRating(review.recommendation_id);
      }

      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(reviewId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user has already marked this review as helpful
      const { data: existing } = await supabase
        .from('review_helpful')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        return true; // Already marked as helpful
      }

      // Add helpful vote
      const { error: insertError } = await supabase
        .from('review_helpful')
        .insert({
          review_id: reviewId,
          user_id: user.id
        });

      if (insertError) {
        console.error('Error marking review as helpful:', insertError);
        return false;
      }

      // Update helpful count by calling a stored procedure
      const { error: updateError } = await supabase.rpc('increment_helpful', {
        review_id: reviewId
      });

      if (updateError) {
        console.error('Error updating helpful count:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      return false;
    }
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(userId?: string, page: number = 1, limit: number = 10): Promise<Review[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles(id, display_name, avatar)
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error('Error fetching user reviews:', error);
        return [];
      }

      return (data || []).map(this.mapDatabaseToReview);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }
  }

  /**
   * Check if user has reviewed a recommendation
   */
  async hasUserReviewed(recommendationId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('reviews')
        .select('id')
        .eq('recommendation_id', recommendationId)
        .eq('user_id', user.id)
        .single();

      return !!data;
    } catch {
      return false;
    }
  }

  /**
   * Get user's review for a recommendation
   */
  async getUserReview(recommendationId: string): Promise<Review | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles(id, display_name, avatar)
        `)
        .eq('recommendation_id', recommendationId)
        .eq('user_id', user.id)
        .single();

      if (error) return null;

      return this.mapDatabaseToReview(data);
    } catch {
      return null;
    }
  }

  /**
   * Update recommendation rating based on reviews
   */
  private async updateRecommendationRating(recommendationId: string): Promise<void> {
    try {
      const stats = await this.getReviewStats(recommendationId);
      
      await supabase
        .from('recommendations')
        .update({
          rating: stats.averageRating,
          review_count: stats.totalReviews
        })
        .eq('id', recommendationId);
    } catch (error) {
      console.error('Error updating recommendation rating:', error);
    }
  }

  /**
   * Map database record to Review interface
   */
  private mapDatabaseToReview(data: any): Review {
    return {
      id: data.id,
      recommendationId: data.recommendation_id,
      userId: data.user_id,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      photos: data.photos || [],
      visitDate: new Date(data.visit_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      helpful: data.helpful || 0,
      verified: data.verified || false,
      user: {
        id: data.user.id,
        displayName: data.user.display_name,
        avatar: data.user.avatar
      }
    };
  }

  /**
   * Get empty stats object
   */
  private getEmptyStats(): ReviewStats {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      totalPhotos: 0,
      verifiedReviews: 0
    };
  }
}

const reviewsService = ReviewsService.getInstance();

// Export individual functions for convenience
export const submitReview = reviewsService.submitReview.bind(reviewsService);
export const getReviews = reviewsService.getReviews.bind(reviewsService);
export const getReviewStats = reviewsService.getReviewStats.bind(reviewsService);
export const updateReview = reviewsService.updateReview.bind(reviewsService);
export const deleteReview = reviewsService.deleteReview.bind(reviewsService);
export const markReviewHelpful = reviewsService.markReviewHelpful.bind(reviewsService);
export const getUserReviews = reviewsService.getUserReviews.bind(reviewsService);
export const hasUserReviewed = reviewsService.hasUserReviewed.bind(reviewsService);
export const getUserReview = reviewsService.getUserReview.bind(reviewsService);

export default reviewsService;
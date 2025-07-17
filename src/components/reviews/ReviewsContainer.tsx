import React, { useState } from 'react';
import { Plus, Filter, SortDesc, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useReviews } from '../../hooks/useReviews';
import ReviewCard from './ReviewCard';
import ReviewStats from './ReviewStats';
import ReviewForm from './ReviewForm';
import type { Review, ReviewFilters } from '../../services/reviews.service';

interface ReviewsContainerProps {
  recommendationId: string;
  className?: string;
}

const ReviewsContainer: React.FC<ReviewsContainerProps> = ({
  recommendationId,
  className = ''
}) => {
  const { user } = useAuth();
  const {
    reviews,
    stats,
    loading,
    error,
    hasMore,
    userReview,
    hasUserReviewed,
    submitReview,
    updateReview,
    deleteReview,
    markHelpful,
    loadReviews,
    loadMore,
    clearError
  } = useReviews({ recommendationId, autoLoad: true });

  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ReviewFilters>({
    sortBy: 'newest'
  });

  const handleSubmitReview = async (reviewData: any) => {
    const success = await submitReview(reviewData);
    if (success) {
      setShowForm(false);
      setEditingReview(null);
    }
    return success;
  };

  const handleUpdateReview = async (reviewData: any) => {
    if (!editingReview) return false;
    
    const success = await updateReview(editingReview.id, reviewData);
    if (success) {
      setEditingReview(null);
    }
    return success;
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    return await deleteReview(reviewId);
  };

  const handleFilterChange = (newFilters: ReviewFilters) => {
    setFilters(newFilters);
    loadReviews(newFilters);
    setShowFilters(false);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  const sortOptions = [
    { value: 'newest', label: '最新' },
    { value: 'oldest', label: '最早' },
    { value: 'highest', label: '评分最高' },
    { value: 'lowest', label: '评分最低' },
    { value: 'helpful', label: '最有用' }
  ];

  const ratingOptions = [
    { value: undefined, label: '全部评分' },
    { value: 5, label: '5星' },
    { value: 4, label: '4星' },
    { value: 3, label: '3星' },
    { value: 2, label: '2星' },
    { value: 1, label: '1星' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Review Stats */}
      <ReviewStats stats={stats} />

      {/* Actions Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          评价 ({stats.totalReviews})
        </h2>
        
        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            筛选
          </button>

          {/* Write Review Button */}
          {user && !hasUserReviewed && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              写评价
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                排序方式
              </label>
              <select
                value={filters.sortBy || 'newest'}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                评分筛选
              </label>
              <select
                value={filters.rating || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  rating: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {ratingOptions.map(option => (
                  <option key={option.value || 'all'} value={option.value || ''}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                其他筛选
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.withPhotos || false}
                    onChange={(e) => setFilters(prev => ({ ...prev, withPhotos: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">有照片</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.verified || false}
                    onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">已验证</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleFilterChange(filters)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              应用筛选
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-red-700">{error}</span>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* User's Review */}
      {userReview && (
        <div className="border-2 border-blue-200 rounded-lg p-1">
          <div className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-t-lg">
            您的评价
          </div>
          <div className="p-3">
            <ReviewCard
              review={userReview}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
            />
          </div>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          recommendationId={recommendationId}
          existingReview={editingReview || undefined}
          onSubmit={editingReview ? handleUpdateReview : handleSubmitReview}
          onCancel={handleCancelForm}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading && reviews.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">加载评价中...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              还没有评价
            </h3>
            <p className="text-gray-600 mb-4">
              成为第一个分享体验的人
            </p>
            {user && !hasUserReviewed && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                写评价
              </button>
            )}
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onMarkHelpful={markHelpful}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    <>
                      <SortDesc className="w-4 h-4" />
                      加载更多
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewsContainer;
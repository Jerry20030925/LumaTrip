import React from 'react';
import { Star, Camera, Shield, BarChart } from 'lucide-react';
import type { ReviewStats } from '../../services/reviews.service';

interface ReviewStatsProps {
  stats: ReviewStats;
  className?: string;
}

const ReviewStatsComponent: React.FC<ReviewStatsProps> = ({ stats, className = '' }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : index < rating 
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingPercentage = (count: number): number => {
    return stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
  };

  if (stats.totalReviews === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <BarChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评价</h3>
          <p className="text-gray-600">成为第一个评价的人吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">用户评价</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Camera className="w-4 h-4" />
            <span>{stats.totalPhotos} 张照片</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span>{stats.verifiedReviews} 已验证</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {renderStars(stats.averageRating)}
          </div>
          <p className="text-sm text-gray-600">
            基于 {stats.totalReviews} 条评价
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
            const percentage = getRatingPercentage(count);
            
            return (
              <div key={rating} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-8">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-semibold text-gray-900">
              {stats.totalReviews}
            </div>
            <div className="text-sm text-gray-600">总评价</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-900">
              {stats.totalPhotos}
            </div>
            <div className="text-sm text-gray-600">照片</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-900">
              {stats.verifiedReviews}
            </div>
            <div className="text-sm text-gray-600">已验证</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-green-600">
              {Math.round((stats.ratingDistribution[5] + stats.ratingDistribution[4]) / stats.totalReviews * 100)}%
            </div>
            <div className="text-sm text-gray-600">推荐</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStatsComponent;
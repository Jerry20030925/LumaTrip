import React, { useState } from 'react';
import { Star, ThumbsUp, Camera, Shield, MoreHorizontal, Edit, Trash2, Flag } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { Review } from '../../services/reviews.service';

interface ReviewCardProps {
  review: Review;
  onMarkHelpful?: (reviewId: string) => Promise<boolean>;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => Promise<boolean>;
  onReport?: (reviewId: string) => void;
  className?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onMarkHelpful,
  onEdit,
  onDelete,
  onReport,
  className = ''
}) => {
  const { user } = useAuth();
  const [showMore, setShowMore] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [helpful, setHelpful] = useState(review.helpful);
  const [isMarkingHelpful, setIsMarkingHelpful] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnReview = user?.id === review.userId;
  const truncatedComment = review.comment.length > 300 ? review.comment.substring(0, 300) + '...' : review.comment;

  const handleMarkHelpful = async () => {
    if (!onMarkHelpful || isMarkingHelpful) return;

    setIsMarkingHelpful(true);
    try {
      const success = await onMarkHelpful(review.id);
      if (success) {
        setHelpful(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error marking review helpful:', error);
    } finally {
      setIsMarkingHelpful(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;

    if (confirm('确定要删除这条评价吗？')) {
      setIsDeleting(true);
      try {
        await onDelete(review.id);
      } catch (error) {
        console.error('Error deleting review:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={review.user.avatar || 'https://via.placeholder.com/40'}
            alt={review.user.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">{review.user.displayName}</h4>
              {review.verified && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Shield className="w-3 h-3" />
                  <span className="text-xs">已验证</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              <span>·</span>
              <span>{formatDate(review.visitDate)}</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              {isOwnReview ? (
                <>
                  <button
                    onClick={() => {
                      onEdit?.(review);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    编辑评价
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? '删除中...' : '删除评价'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onReport?.(review.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Flag className="w-4 h-4" />
                  举报评价
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h3 className="font-medium text-gray-900 mb-2">{review.title}</h3>
      )}

      {/* Comment */}
      <div className="mb-3">
        <p className="text-gray-700 leading-relaxed">
          {showMore ? review.comment : truncatedComment}
        </p>
        {review.comment.length > 300 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-blue-600 text-sm mt-1 hover:text-blue-800"
          >
            {showMore ? '收起' : '展开'}
          </button>
        )}
      </div>

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="mb-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {review.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Review photo ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <span>访问时间: {formatDate(review.visitDate)}</span>
          {review.photos && review.photos.length > 0 && (
            <div className="flex items-center gap-1">
              <Camera className="w-4 h-4" />
              <span>{review.photos.length} 张照片</span>
            </div>
          )}
        </div>

        {!isOwnReview && (
          <button
            onClick={handleMarkHelpful}
            disabled={isMarkingHelpful}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>有用 {helpful > 0 && `(${helpful})`}</span>
          </button>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default ReviewCard;
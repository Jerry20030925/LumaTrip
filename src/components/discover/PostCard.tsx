import React, { useState } from 'react';
import { MapPin, Heart, MessageCircle, Bookmark, Share2, Play, Image as ImageIcon } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  content: string;
  images: string[];
  location: string;
  tags: string[];
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  likes: number;
  comments: number;
  bookmarks: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '刚刚';
    if (diffInHours < 24) return `${diffInHours}小时前`;
    return `${Math.floor(diffInHours / 24)}天前`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 实现分享功能
    console.log('分享帖子:', post.id);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 实现评论功能
    console.log('评论帖子:', post.id);
  };

  return (
    <div className="bg-white overflow-hidden group cursor-pointer card-hover" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}>
      {/* 图片区域 */}
      <div className="relative overflow-hidden">
        <div className="relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <ImageIcon className="h-8 w-8" style={{ color: 'var(--text-secondary)' }} />
            </div>
          )}
          <img
            src={post.images[0]}
            alt={post.title}
            className={`w-full object-cover transition-all duration-300 group-hover:scale-102 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ aspectRatio: 'auto' }}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* 多图标识 */}
          {post.images.length > 1 && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
              <ImageIcon className="h-3 w-3" />
              <span>{post.images.length}</span>
            </div>
          )}
          
          {/* 视频标识 (如果是视频) */}
          {post.title.includes('视频') && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black bg-opacity-60 rounded-full p-3">
                <Play className="h-6 w-6 text-white fill-current" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-3">
        {/* 标题和描述 */}
        <div className="mb-3">
          <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
            {post.title}
          </h3>
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {post.content}
          </p>
        </div>

        {/* 位置和标签 */}
        <div className="mb-3 space-y-2">
          {/* 位置 */}
          {post.location && (
            <div className="flex items-center text-xs" style={{ color: 'var(--text-secondary)' }}>
              <MapPin className="h-3 w-3 mr-1" />
              <span>{post.location}</span>
            </div>
          )}
          
          {/* 话题标签 */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block text-xs px-2 py-1 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                  style={{ 
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--primary-blue)'
                  }}
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>+{post.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>

        {/* 用户信息栏 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-6 w-6 rounded-full object-cover border"
              style={{ borderColor: 'var(--border-gray)' }}
            />
            <div>
              <p className="text-xs font-medium cursor-pointer transition-colors" style={{ color: 'var(--text-primary)' }}>
                {post.author.name}
              </p>
            </div>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {formatTimeAgo(post.createdAt)}
          </span>
        </div>

        {/* 互动栏 */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-gray)' }}>
          <div className="flex items-center space-x-4">
            {/* 点赞 */}
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-xs transition-all duration-200 hover:scale-110 btn-ripple ${
                isLiked ? 'text-red-500' : 'hover:text-red-500'
              }`}
              style={{ color: isLiked ? '#EF4444' : 'var(--text-secondary)' }}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current heart-animate' : ''}`} />
              <span>{formatNumber(likesCount)}</span>
            </button>

            {/* 评论 */}
            <button
              onClick={handleComment}
              className="flex items-center space-x-1 text-xs transition-colors btn-ripple"
              style={{ color: 'var(--text-secondary)' }}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{formatNumber(post.comments)}</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* 收藏 */}
            <button
              onClick={handleBookmark}
              className={`text-xs transition-all duration-200 hover:scale-110 btn-ripple ${
                isBookmarked ? 'text-yellow-500' : 'hover:text-yellow-500'
              }`}
              style={{ color: isBookmarked ? '#EAB308' : 'var(--text-secondary)' }}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* 分享 */}
            <button
              onClick={handleShare}
              className="text-xs transition-colors hover:scale-110 transform duration-200 btn-ripple"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
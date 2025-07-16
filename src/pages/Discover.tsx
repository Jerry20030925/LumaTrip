import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Bell, Heart, MessageCircle, Bookmark, Share2, MapPin, MoreHorizontal, Play, Images } from 'lucide-react';
import PostFilters from '../components/discover/PostFilters';
import CreatePostModal from '../components/discover/CreatePostModal';
import EmptyState from '../components/discover/EmptyState';
import { useAuth } from '../hooks/useAuth';

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

const Discover: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('推荐');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const filterTabs = ['推荐', '关注', '热门', '最新', '附近'];
  const topicTags = ['#美食', '#旅行', '#风景', '#摄影', '#城市', '#自然'];
  const { user } = useAuth();


  // Mock data for demonstration
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        title: '美丽的日落风景',
        content: '今天在海边看到了最美的日落，分享给大家！',
        images: ['https://picsum.photos/400/300?random=1'],
        location: '三亚海滩',
        tags: ['#风景', '#日落'],
        author: {
          id: 1,
          name: '旅行者小王',
          avatar: 'https://picsum.photos/40/40?random=1'
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 128,
        comments: 23,
        bookmarks: 45,
        isLiked: false,
        isBookmarked: false
      },
      {
        id: 2,
        title: '城市夜景探索',
        content: '夜晚的城市有着不同的魅力，霓虹灯下的街道充满了故事。',
        images: ['https://picsum.photos/400/500?random=2', 'https://picsum.photos/400/400?random=3'],
        location: '上海外滩',
        tags: ['#夜景', '#城市'],
        author: {
          id: 2,
          name: '摄影师李明',
          avatar: 'https://picsum.photos/40/40?random=2'
        },
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        likes: 256,
        comments: 67,
        bookmarks: 89,
        isLiked: true,
        isBookmarked: false
      },
      {
        id: 3,
        title: '山间小径',
        content: '徒步在山间小径上，呼吸着新鲜的空气，感受大自然的美好。',
        images: ['https://picsum.photos/400/600?random=4'],
        location: '黄山',
        tags: ['#徒步', '#自然'],
        author: {
          id: 3,
          name: '户外达人张三',
          avatar: 'https://picsum.photos/40/40?random=3'
        },
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        likes: 89,
        comments: 12,
        bookmarks: 34,
        isLiked: false,
        isBookmarked: true
      }
    ];
    
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

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

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleBookmark = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked, bookmarks: post.isBookmarked ? post.bookmarks - 1 : post.bookmarks + 1 }
        : post
    ));
  };

  const handleCreatePost = async (postData: any) => {
    try {
      // 这里应该调用API来创建帖子
      console.log('创建帖子:', postData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 创建新帖子对象
      const newPost = {
        id: Date.now(),
        title: postData.content.slice(0, 50) + (postData.content.length > 50 ? '...' : ''),
        content: postData.content,
        author: {
          id: 1,
          name: '当前用户',
          avatar: 'https://picsum.photos/40/40?random=user'
        },
        images: postData.files?.length > 0 ? [
          'https://picsum.photos/400/300?random=' + Date.now()
        ] : [],
        location: postData.location || '',
        tags: postData.tags || [],
        likes: 0,
        comments: 0,
        bookmarks: 0,
        createdAt: new Date(),
        isLiked: false,
        isBookmarked: false
      };
      
      // 将新帖子添加到列表顶部
      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      // 关闭模态框
      setShowCreateModal(false);
    } catch (error) {
      console.error('创建帖子失败:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-gray)' }}>
      {/* 固定顶部导航栏 */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50" style={{ borderColor: 'var(--border-gray)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* 左侧 Logo */}
            <div className="flex items-center">
              <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <img 
                  src="/luma-logo.svg" 
                  alt="LumaTrip" 
                  className="h-8 w-8"
                />
                <span className="text-xl font-bold" style={{ color: 'var(--primary-blue)' }}>
                  LumaTrip
                </span>
              </button>
            </div>

            {/* 中间搜索栏 */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                </div>
                <input
                  type="text"
                  placeholder="搜索精彩内容..."
                  className="block w-full pl-9 pr-3 py-2 border rounded-full text-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
                  style={{ 
                    borderColor: 'var(--border-gray)'
                  } as React.CSSProperties}
                />
              </div>
            </div>

            {/* 右侧功能区 */}
            <div className="flex items-center space-x-3">
              {/* 创建帖子按钮 */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center w-9 h-9 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg btn-ripple"
                style={{ 
                  backgroundColor: 'var(--primary-blue)'
                } as React.CSSProperties}
              >
                <Plus className="h-4 w-4" />
              </button>

              {/* 通知铃铛 */}
              <div className="relative">
                <button className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-gray-100">
                  <Bell className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                </button>
                {/* 红点未读提示 */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              </div>

              {/* 用户头像 */}
              <div className="relative">
                <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2">
                  <img
                    className="h-8 w-8 rounded-full object-cover border-2 hover:border-blue-300 transition-colors"
                    style={{ borderColor: 'var(--border-gray)' }}
                    src={user?.user_metadata?.avatar_url || 'https://picsum.photos/32/32?random=user'}
                    alt="用户头像"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 次级导航/筛选栏 */}
        <div className="bg-white border-b" style={{ borderColor: 'var(--border-gray)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 filter-tabs">
                {filterTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 relative ${
                      activeFilter === tab
                        ? 'text-white shadow-md transform scale-105'
                        : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    style={{
                      backgroundColor: activeFilter === tab ? 'var(--primary-blue)' : 'var(--background-gray)'
                    }}
                  >
                    {tab}
                    {activeFilter === tab && (
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                ))}
                
                {/* 话题标签 */}
                <div className="flex items-center gap-2 ml-4 pl-4 border-l" style={{ borderColor: 'var(--border-gray)' }}>
                  {topicTags.map((tag) => (
                    <button
                      key={tag}
                      className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors whitespace-nowrap flex-shrink-0"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 筛选按钮 */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ml-4 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  showFilters 
                    ? 'text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: showFilters ? 'var(--primary-blue)' : 'var(--background-gray)'
                } as React.CSSProperties}
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 筛选面板 */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white shadow-sm border animate-in slide-in-from-top duration-200" style={{ borderRadius: 'var(--radius-card)', borderColor: 'var(--border-gray)', boxShadow: 'var(--shadow-card)' }}>
            <PostFilters />
          </div>
        )}

        {/* 瀑布流内容 */}
        <div className="transition-all duration-200">
          {loading ? (
            <div className="masonry-grid">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse stagger-animation" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="bg-white shadow-sm overflow-hidden" style={{ borderRadius: 'var(--radius-card)' }}>
                    <div className="bg-gray-200 aspect-[3/4] mb-3"></div>
                    <div className="p-3">
                      <div className="bg-gray-200 h-3 rounded mb-2"></div>
                      <div className="bg-gray-200 h-3 rounded w-3/4 mb-3"></div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="bg-gray-200 h-6 w-6 rounded-full"></div>
                          <div className="bg-gray-200 h-3 w-16 rounded"></div>
                        </div>
                        <div className="bg-gray-200 h-3 w-12 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState 
              type="discover" 
              onAction={() => setShowCreateModal(true)}
            />
          ) : (
            <div className="masonry-grid">
              {posts.map((post, index) => (
                <div key={post.id} className="card-hover stagger-animation" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg" style={{ borderRadius: 'var(--radius-card)' }}>
                    {/* 图片区域 */}
                    <div className="relative overflow-hidden">
                      <img
                        src={post.images[0]}
                        alt={post.title}
                        className="w-full h-auto object-cover transition-transform duration-300 hover:scale-102"
                        style={{ aspectRatio: 'auto' }}
                      />
                      
                      {/* 多图标识 */}
                      {post.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Images className="w-3 h-3" />
                          <span>{post.images.length}</span>
                        </div>
                      )}
                      
                      {/* 视频标识 */}
                      {post.content.includes('视频') && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 内容区域 */}
                    <div className="p-3">
                      {/* 标题/描述 */}
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{post.title}</h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{post.content}</p>
                      
                      {/* 位置标签 */}
                      {post.location && (
                        <div className="flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{post.location}</span>
                        </div>
                      )}
                      
                      {/* 话题标签 */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.map((tag) => (
                            <button
                              key={tag}
                              className="px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* 用户信息栏 */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <button className="text-xs font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              {post.author.name}
                            </button>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                      </div>
                      
                      {/* 互动栏 */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-1 transition-all duration-200 ${
                              post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current heart-animate' : ''}`} />
                            <span className="text-xs">{formatNumber(post.likes)}</span>
                          </button>
                          
                          <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-xs">{formatNumber(post.comments)}</span>
                          </button>
                          
                          <button
                            onClick={() => handleBookmark(post.id)}
                            className={`flex items-center gap-1 transition-colors ${
                              post.isBookmarked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                            <span className="text-xs">{formatNumber(post.bookmarks)}</span>
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button className="text-gray-500 hover:text-gray-700 transition-colors">
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button className="text-gray-500 hover:text-gray-700 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 创建帖子模态框 */}
      {showCreateModal && (
        <CreatePostModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </div>
  );
};

export default Discover;
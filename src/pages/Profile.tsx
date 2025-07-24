import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Heart, 
  MessageCircle, 
  Share, 
  Settings, 
  Camera, 
  Globe, 
  Grid,
  Bookmark,
  Tag,
  UserPlus,
  UserCheck,
  Edit,
  Lock,
  MoreHorizontal,
  ShieldCheck as Verified,
  Check,
  Copy,
  Play,
  Users
} from 'lucide-react';

import ProfileEditModal from '../components/profile/ProfileEditModal';

interface UserProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinDate: Date;
  isVerified: boolean;
  isPrivate: boolean;
  tags: string[];
  remainingIdChanges: number;
}

interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesCount: number;
}

interface ProfilePost {
  id: string;
  imageUrl: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  type: 'image' | 'video' | 'carousel';
}

type ProfileTabType = 'posts' | 'saved' | 'liked' | 'tagged' | 'friends';

const Profile: React.FC = () => {
  // const { user } = useAuth(); // Commented out as not currently used
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTabType>('posts');
  const [isOwnProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock data
  useEffect(() => {
    const mockProfile: UserProfile = {
      id: 'user1',
      userId: 'traveler_zhang_2024',
      username: 'traveler_zhang',
      displayName: '张小明',
      email: 'zhang@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=200&fit=crop',
      bio: '热爱旅行的摄影师 📸 | 探索世界的每一个角落 🌍 | 分享美好的旅行时光 ✨',
      location: '北京, 中国',
      website: 'https://traveler-zhang.com',
      joinDate: new Date('2022-01-15'),
      isVerified: true,
      isPrivate: false,
      tags: ['旅行', '摄影', '美食', '户外'],
      remainingIdChanges: 3
    };

    const mockStats: UserStats = {
      postsCount: 128,
      followersCount: 2543,
      followingCount: 456,
      likesCount: 12890
    };

    const mockPosts: ProfilePost[] = Array.from({ length: 12 }, (_, i) => ({
      id: `post-${i + 1}`,
      imageUrl: `https://images.unsplash.com/photo-${1506905925346 + i}?w=300&h=300&fit=crop`,
      caption: `旅行照片 ${i + 1}`,
      likesCount: Math.floor(Math.random() * 500) + 50,
      commentsCount: Math.floor(Math.random() * 50) + 5,
      createdAt: new Date(Date.now() - i * 86400000),
      type: i % 3 === 0 ? 'carousel' : i % 2 === 0 ? 'video' : 'image'
    }));

    setProfile(mockProfile);
    setStats(mockStats);
    setPosts(mockPosts);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const handleCopyUserId = async () => {
    if (profile) {
      try {
        await navigator.clipboard.writeText(profile.userId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy user ID:', err);
      }
    }
  };

  const handleProfileSave = async (updatedProfile: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  };

  const tabs = [
    { id: 'posts', label: '帖子', icon: Grid, count: stats?.postsCount },
    { id: 'saved', label: '收藏', icon: Bookmark, count: undefined },
    { id: 'liked', label: '喜欢', icon: Heart, count: undefined },
    { id: 'tagged', label: '标记', icon: Tag, count: undefined },
    { id: 'friends', label: '好友', icon: UserPlus, count: undefined }
  ];

  if (!profile || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto">
        {/* 封面和头像区域 */}
        <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg overflow-hidden mb-6">
          {/* 封面图片 */}
          <div className="relative h-64 md:h-80">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: profile.coverImage 
                  ? `url(${profile.coverImage})` 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            
            {isOwnProfile && (
              <button className="absolute top-4 right-4 p-3 bg-black/30 backdrop-blur-sm rounded-xl text-white hover:bg-black/50 transition-all duration-200">
                <Camera size={20} />
              </button>
            )}
          </div>
          
          {/* 头像和基本信息 */}
          <div className="relative px-6 pb-6 -mt-16">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
              {/* 头像 */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white">
                  <img
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {profile.isVerified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <Verified size={16} className="text-white" />
                  </div>
                )}
                {isOwnProfile && (
                  <button className="absolute bottom-2 right-2 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors shadow-lg">
                    <Camera size={14} />
                  </button>
                )}
              </div>
              
              {/* 用户信息 */}
              <div className="flex-1 mt-4 md:mt-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {profile.displayName}
                      </h1>
                      {profile.isPrivate && (
                        <Lock className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <p className="text-gray-600 text-lg">@{profile.username}</p>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    {isOwnProfile ? (
                      <>
                        <button
                          onClick={() => setShowEditModal(true)}
                          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                        >
                          <Edit size={16} className="inline mr-2" />
                          编辑资料
                        </button>
                        <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                          <Share size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                          <Settings size={16} className="text-gray-600" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleFollowToggle}
                          className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                            isFollowing 
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <UserCheck size={16} className="inline mr-2" />
                              已关注
                            </>
                          ) : (
                            <>
                              <UserPlus size={16} className="inline mr-2" />
                              关注
                            </>
                          )}
                        </button>
                        <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                          <MessageCircle size={16} className="inline mr-2" />
                          发消息
                        </button>
                        <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                          <MoreHorizontal size={16} className="text-gray-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 详细信息卡片 */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-6 mb-6">
          {/* 用户ID */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-sm text-gray-500">ID: @{profile.userId}</span>
            <button
              onClick={handleCopyUserId}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {copied ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <Copy size={16} className="text-gray-500" />
              )}
            </button>
          </div>
          
          {/* 简介 */}
          {profile.bio && (
            <p className="text-gray-700 text-center mb-6 text-lg leading-relaxed max-w-2xl mx-auto">
              {profile.bio}
            </p>
          )}
          
          {/* 标签 */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {profile.tags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
              >
                #{tag}
              </span>
            ))}
          </div>
          
          {/* 位置和网站信息 */}
          <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm text-gray-600">
            {profile.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{profile.website}</span>
              </a>
            )}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>加入于 {profile.joinDate.toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
          
          {/* 统计数据 */}
          <div className="grid grid-cols-3 gap-6 py-6 border-t border-gray-200">
            <div className="text-center cursor-pointer hover:bg-gray-50 rounded-lg py-3 transition-colors">
              <div className="text-2xl font-bold text-gray-900 mb-1">{formatNumber(stats.postsCount)}</div>
              <div className="text-sm text-gray-600">帖子</div>
            </div>
            <div className="text-center cursor-pointer hover:bg-gray-50 rounded-lg py-3 transition-colors">
              <div className="text-2xl font-bold text-gray-900 mb-1">{formatNumber(stats.followersCount)}</div>
              <div className="text-sm text-gray-600">粉丝</div>
            </div>
            <div className="text-center cursor-pointer hover:bg-gray-50 rounded-lg py-3 transition-colors">
              <div className="text-2xl font-bold text-gray-900 mb-1">{formatNumber(stats.followingCount)}</div>
              <div className="text-sm text-gray-600">关注</div>
            </div>
          </div>
        </div>

        {/* 内容标签页 */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          {/* 标签页导航 */}
          <div className="border-b border-gray-200 bg-white/50">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab(tab.id as ProfileTabType)}
                  >
                    <Icon size={16} />
                    <span className="font-medium">{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="px-2 py-1 bg-gray-100 text-xs rounded-full font-medium">
                        {formatNumber(tab.count)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* 标签页内容 */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <div key={post.id} className="relative aspect-square group cursor-pointer">
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover rounded-xl transition-transform duration-200 group-hover:scale-105"
                    />
                    
                    {/* 帖子类型指示器 */}
                    <div className="absolute top-2 right-2">
                      {post.type === 'carousel' && (
                        <div className="p-1 bg-black/50 backdrop-blur-sm rounded-lg">
                          <Grid size={12} className="text-white" />
                        </div>
                      )}
                      {post.type === 'video' && (
                        <div className="p-1 bg-black/50 backdrop-blur-sm rounded-lg">
                          <Play size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* 悬停遮罩 */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                      <div className="flex items-center space-x-4 text-white">
                        <div className="flex items-center space-x-1">
                          <Heart size={20} fill="currentColor" />
                          <span className="font-medium">{formatNumber(post.likesCount)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle size={20} fill="currentColor" />
                          <span className="font-medium">{formatNumber(post.commentsCount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* 其他标签页的空状态 */}
            {(['saved', 'liked', 'tagged', 'friends'] as ProfileTabType[]).map((tabId) => (
              activeTab === tabId && (
                <div key={tabId} className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    {tabId === 'saved' && <Bookmark size={32} className="text-gray-500" />}
                    {tabId === 'liked' && <Heart size={32} className="text-gray-500" />}
                    {tabId === 'tagged' && <Tag size={32} className="text-gray-500" />}
                    {tabId === 'friends' && <Users size={32} className="text-gray-500" />}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {tabId === 'saved' && '暂无收藏内容'}
                    {tabId === 'liked' && '暂无喜欢内容'}
                    {tabId === 'tagged' && '暂无标记内容'}
                    {tabId === 'friends' && '暂无好友'}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {tabId === 'saved' && '您收藏的帖子和内容将显示在这里，让您轻松找到喜爱的内容。'}
                    {tabId === 'liked' && '您点赞的帖子将显示在这里，记录您的喜好和兴趣。'}
                    {tabId === 'tagged' && '其他用户标记您的帖子将显示在这里。'}
                    {tabId === 'friends' && '您的好友列表将显示在这里，与朋友们保持联系。'}
                  </p>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
      
      {/* 编辑资料模态框 */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSave={handleProfileSave}
      />
      
      {/* 复制成功提示 */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <Check size={16} />
            <span>用户ID已复制</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
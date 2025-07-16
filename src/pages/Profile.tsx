import React, { useState, useEffect } from 'react';
import {
  Camera,
  Edit,
  Share,
  Settings,
  UserCheck,
  UserPlus,
  MessageCircle,
  MoreHorizontal,
  MapPin,
  Link,
  Calendar,
  Copy,
  Check,
  Heart,
  Grid,
  Bookmark,
  Tag,
  Lock,
  Verified
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
      <div className="max-w-4xl mx-auto py-8">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <div className="text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Cover and Avatar Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {/* Cover Image */}
          <div
            className="profile-cover"
            style={{
              backgroundImage: profile.coverImage 
                ? `url(${profile.coverImage})` 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {profile.coverImage && (
              <div className="absolute inset-0 bg-black bg-opacity-20" />
            )}
            
            {isOwnProfile && (
              <button
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
              >
                <Camera size={20} />
              </button>
            )}
          </div>
          
          {/* Avatar */}
          <div className="relative px-6 pb-6">
            <div className="relative inline-block">
              <img
                src={profile.avatar}
                alt={profile.displayName}
                className="profile-avatar"
              />
              {profile.isVerified && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Verified size={16} className="text-white" />
                </div>
              )}
              {isOwnProfile && (
                <button className="profile-avatar-edit">
                  <Camera size={16} className="text-white" />
                </button>
              )}
            </div>
          </div>
        </div>
        {/* User Information Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="text-center px-6 py-8">
            {/* Basic Info */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {profile.displayName}
                {profile.isPrivate && <Lock className="inline ml-2" size={20} />}
              </h1>
              <p className="text-gray-500 mb-2">@{profile.username}</p>
              
              {/* User ID Display */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-sm text-gray-500">ID: @{profile.userId}</span>
                <button
                  onClick={handleCopyUserId}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-500" />}
                </button>
              </div>
              
              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-700 mb-4 max-w-md mx-auto leading-relaxed">
                  {profile.bio}
                </p>
              )}
              
              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {profile.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              {/* Location and Website */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1">
                    <Link size={16} />
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.website.replace('https://', '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>
                    加入于 {profile.joinDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="profile-stats border-t border-b py-6 mb-6" style={{ borderColor: 'var(--profile-divider)' }}>
              <div className="profile-stat">
                <div className="profile-stat-number profile-counter">{formatNumber(stats.postsCount)}</div>
                <div className="profile-stat-label">帖子</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-number profile-counter">{formatNumber(stats.followersCount)}</div>
                <div className="profile-stat-label">粉丝</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-number profile-counter">{formatNumber(stats.followingCount)}</div>
                <div className="profile-stat-label">关注</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="profile-actions">
              {isOwnProfile ? (
                <>
                  <button
                    className="profile-action-btn secondary"
                    onClick={() => setShowEditModal(true)}
                  >
                    <Edit size={16} className="inline mr-2" />
                    编辑资料
                  </button>
                  <button className="profile-action-btn secondary">
                    <Share size={16} />
                  </button>
                  <button className="profile-action-btn secondary">
                    <Settings size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`profile-action-btn ${isFollowing ? 'secondary' : 'primary'}`}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? <UserCheck size={16} className="inline mr-2" /> : <UserPlus size={16} className="inline mr-2" />}
                    {isFollowing ? '已关注' : '关注'}
                  </button>
                  <button className="profile-action-btn secondary">
                    <MessageCircle size={16} className="inline mr-2" />
                    发消息
                  </button>
                  <button className="profile-action-btn secondary">
                    <MoreHorizontal size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Content Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="profile-tabs">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`profile-tab flex-1 ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id as ProfileTabType)}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="ml-2 px-2 py-1 bg-gray-100 text-xs rounded-full">
                        {formatNumber(tab.count)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="profile-tab-content">
            {activeTab === 'posts' && (
              <div className="profile-content-grid">
                {posts.map((post) => (
                  <div key={post.id} className="profile-post-item">
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                    />
                    
                    {/* Post Type Indicator */}
                    {post.type === 'carousel' && (
                      <div className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full">
                        <Grid size={12} className="text-white" />
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="profile-post-overlay">
                      <div className="flex items-center gap-1">
                        <Heart size={20} fill="currentColor" />
                        <span>{formatNumber(post.likesCount)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={20} fill="currentColor" />
                        <span>{formatNumber(post.commentsCount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {(['saved', 'liked', 'tagged', 'friends'] as ProfileTabType[]).map((tabId) => (
              activeTab === tabId && (
                <div key={tabId} className="profile-empty-state">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {tabId === 'saved' && <Bookmark size={32} className="text-gray-500" />}
                    {tabId === 'liked' && <Heart size={32} className="text-gray-500" />}
                    {tabId === 'tagged' && <Tag size={32} className="text-gray-500" />}
                    {tabId === 'friends' && <UserPlus size={32} className="text-gray-500" />}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {tabId === 'saved' && '暂无收藏'}
                    {tabId === 'liked' && '暂无喜欢'}
                    {tabId === 'tagged' && '暂无标记'}
                    {tabId === 'friends' && '暂无好友'}
                  </h3>
                  <p className="text-gray-500">
                    {tabId === 'saved' && '您收藏的帖子将显示在这里'}
                    {tabId === 'liked' && '您喜欢的帖子将显示在这里'}
                    {tabId === 'tagged' && '您被标记的帖子将显示在这里'}
                    {tabId === 'friends' && '您的好友列表将显示在这里'}
                  </p>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSave={handleProfileSave}
      />
      
      {/* Copy Success Alert */}
       {copied && (
         <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
           <Check size={16} />
           <span>用户ID已复制到剪贴板</span>
         </div>
       )}
    </div>
  );
};

export default Profile;
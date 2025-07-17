import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical,
  MessageCircle,
  Star,
  MapPin,
  Check,
  X,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: Date;
  location?: string;
  bio?: string;
  mutualFriends: number;
  postsCount: number;
  followersCount: number;
  relationshipStatus: 'friend' | 'pending_sent' | 'pending_received' | 'blocked' | 'none';
  tags: string[];
  joinDate: Date;
}

interface FriendsSystemProps {
  currentUserId: string;
}

type TabType = 'friends' | 'requests' | 'suggestions' | 'find';

const FriendsSystem: React.FC<FriendsSystemProps> = ({}) => {
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [suggestions, setSuggestions] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'mutual' | 'location'>('name');
  const [filterOnline, setFilterOnline] = useState(false);

  // Mock data
  useEffect(() => {
    const mockFriends: Friend[] = [
      {
        id: '1',
        name: '张小明',
        username: 'zhangxiaoming',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
        isOnline: true,
        location: '北京, 中国',
        bio: '热爱旅行和摄影的程序员',
        mutualFriends: 5,
        postsCount: 128,
        followersCount: 234,
        relationshipStatus: 'friend',
        tags: ['旅行', '摄影', '技术'],
        joinDate: new Date('2022-01-15')
      },
      {
        id: '2',
        name: '李小红',
        username: 'lixiaohong',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
        location: '上海, 中国',
        bio: '美食爱好者，喜欢探索新餐厅',
        mutualFriends: 3,
        postsCount: 89,
        followersCount: 156,
        relationshipStatus: 'friend',
        tags: ['美食', '生活', '旅行'],
        joinDate: new Date('2021-11-20')
      },
      {
        id: '3',
        name: '王摄影',
        username: 'wangsheying',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
        isOnline: true,
        location: '深圳, 中国',
        bio: '专业摄影师，风景摄影爱好者',
        mutualFriends: 8,
        postsCount: 456,
        followersCount: 1234,
        relationshipStatus: 'friend',
        tags: ['摄影', '艺术', '风景'],
        joinDate: new Date('2020-06-10')
      }
    ];

    const mockRequests: Friend[] = [
      {
        id: '4',
        name: '陈小美',
        username: 'chenxiaomei',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
        isOnline: false,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000),
        location: '广州, 中国',
        bio: '旅行博主，分享世界各地的美景',
        mutualFriends: 2,
        postsCount: 234,
        followersCount: 567,
        relationshipStatus: 'pending_received',
        tags: ['旅行', '博客', '生活'],
        joinDate: new Date('2021-03-05')
      },
      {
        id: '5',
        name: '刘小刚',
        username: 'liuxiaogang',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face',
        isOnline: true,
        location: '成都, 中国',
        bio: '户外运动爱好者',
        mutualFriends: 1,
        postsCount: 123,
        followersCount: 89,
        relationshipStatus: 'pending_received',
        tags: ['运动', '户外', '健身'],
        joinDate: new Date('2022-07-12')
      }
    ];

    const mockSuggestions: Friend[] = [
      {
        id: '6',
        name: '赵小雨',
        username: 'zhaoxiaoyu',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face',
        isOnline: false,
        lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000),
        location: '杭州, 中国',
        bio: '设计师，热爱艺术和文化',
        mutualFriends: 4,
        postsCount: 167,
        followersCount: 345,
        relationshipStatus: 'none',
        tags: ['设计', '艺术', '文化'],
        joinDate: new Date('2021-09-18')
      },
      {
        id: '7',
        name: '孙小阳',
        username: 'sunxiaoyang',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
        isOnline: true,
        location: '西安, 中国',
        bio: '历史文化爱好者',
        mutualFriends: 6,
        postsCount: 289,
        followersCount: 456,
        relationshipStatus: 'none',
        tags: ['历史', '文化', '旅行'],
        joinDate: new Date('2020-12-03')
      }
    ];

    setFriends(mockFriends);
    setFriendRequests(mockRequests);
    setSuggestions(mockSuggestions);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const results = [...friends, ...suggestions].filter(friend =>
          friend.name.toLowerCase().includes(query.toLowerCase()) ||
          friend.username.toLowerCase().includes(query.toLowerCase()) ||
          friend.bio?.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);
        setIsLoading(false);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleFriendRequest = (friendId: string, action: 'accept' | 'reject' | 'send' | 'cancel') => {
    switch (action) {
      case 'accept':
        const acceptedFriend = friendRequests.find(f => f.id === friendId);
        if (acceptedFriend) {
          setFriends(prev => [...prev, { ...acceptedFriend, relationshipStatus: 'friend' }]);
          setFriendRequests(prev => prev.filter(f => f.id !== friendId));
        }
        break;
      
      case 'reject':
        setFriendRequests(prev => prev.filter(f => f.id !== friendId));
        break;
      
      case 'send':
        setSuggestions(prev => 
          prev.map(f => 
            f.id === friendId 
              ? { ...f, relationshipStatus: 'pending_sent' }
              : f
          )
        );
        break;
      
      case 'cancel':
        setSuggestions(prev => 
          prev.map(f => 
            f.id === friendId 
              ? { ...f, relationshipStatus: 'none' }
              : f
          )
        );
        break;
    }
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '刚刚在线';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return `${Math.floor(diffInMinutes / 1440)}天前`;
  };

  const sortFriends = (friendsList: Friend[]) => {
    const filtered = filterOnline ? friendsList.filter(f => f.isOnline) : friendsList;
    
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return (b.lastSeen?.getTime() || 0) - (a.lastSeen?.getTime() || 0);
        case 'mutual':
          return b.mutualFriends - a.mutualFriends;
        case 'location':
          return (a.location || '').localeCompare(b.location || '');
        default:
          return 0;
      }
    });
  };

  const FriendCard: React.FC<{ friend: Friend; showActions?: boolean }> = ({ friend, showActions = true }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700"
    >
      <div className="flex items-start space-x-3">
        <div className="relative">
          <img
            src={friend.avatar}
            alt={friend.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {friend.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {friend.name}
            </h3>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">@{friend.username}</p>
          
          {friend.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
              {friend.bio}
            </p>
          )}
          
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            {friend.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{friend.location}</span>
              </div>
            )}
            
            {friend.mutualFriends > 0 && (
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{friend.mutualFriends} 共同好友</span>
              </div>
            )}
            
            {!friend.isOnline && friend.lastSeen && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatLastSeen(friend.lastSeen)}</span>
              </div>
            )}
          </div>
          
          {friend.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {friend.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showActions && (
        <div className="flex items-center space-x-2 mt-3">
          {friend.relationshipStatus === 'friend' && (
            <>
              <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>发消息</span>
              </button>
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Star className="w-4 h-4 text-gray-500" />
              </button>
            </>
          )}
          
          {friend.relationshipStatus === 'pending_received' && (
            <>
              <button
                onClick={() => handleFriendRequest(friend.id, 'accept')}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>接受</span>
              </button>
              <button
                onClick={() => handleFriendRequest(friend.id, 'reject')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </>
          )}
          
          {friend.relationshipStatus === 'pending_sent' && (
            <button
              onClick={() => handleFriendRequest(friend.id, 'cancel')}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>已发送</span>
            </button>
          )}
          
          {friend.relationshipStatus === 'none' && (
            <button
              onClick={() => handleFriendRequest(friend.id, 'send')}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>添加好友</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );

  const tabs = [
    { id: 'friends', label: '好友', count: friends.length },
    { id: 'requests', label: '请求', count: friendRequests.length },
    { id: 'suggestions', label: '推荐', count: suggestions.length },
    { id: 'find', label: '查找', count: 0 }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">朋友</h1>
        <p className="text-gray-600 dark:text-gray-400">管理你的朋友和社交连接</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'friends' && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                >
                  <option value="name">按姓名排序</option>
                  <option value="recent">最近活跃</option>
                  <option value="mutual">共同好友</option>
                  <option value="location">按位置</option>
                </select>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filterOnline}
                    onChange={(e) => setFilterOnline(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">仅显示在线</span>
                </label>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {friends.length} 位好友
              </div>
            </div>

            {/* Friends Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortFriends(friends).map(friend => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friendRequests.map(request => (
                <FriendCard key={request.id} friend={request} />
              ))}
            </div>
            
            {friendRequests.length === 0 && (
              <div className="text-center py-12">
                <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无好友请求
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  当有人向你发送好友请求时，会在这里显示
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'suggestions' && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                推荐好友
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                基于共同好友和兴趣为你推荐的人
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map(suggestion => (
                <FriendCard key={suggestion.id} friend={suggestion} />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'find' && (
          <motion.div
            key="find"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索用户名、姓名或邮箱..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {!isLoading && searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map(result => (
                  <FriendCard key={result.id} friend={result} />
                ))}
              </div>
            )}

            {!isLoading && searchQuery && searchResults.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  未找到用户
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  尝试使用不同的关键词搜索
                </p>
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  查找朋友
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  输入用户名、姓名或邮箱来搜索朋友
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FriendsSystem;
import React, { useState } from 'react';
import { TrendingUp, Hash, Eye, MessageCircle, Heart, Clock } from 'lucide-react';

interface TrendingTag {
  id: string;
  name: string;
  count: number;
  growth: number;
  category: 'hot' | 'rising' | 'new';
  posts: number;
  engagement: number;
}

const TrendingTags: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hot' | 'rising' | 'new'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const trendingTags: TrendingTag[] = [
    {
      id: '1',
      name: '春日樱花',
      count: 12580,
      growth: 25.6,
      category: 'hot',
      posts: 1250,
      engagement: 89.5
    },
    {
      id: '2',
      name: '美食探店',
      count: 9876,
      growth: 18.3,
      category: 'hot',
      posts: 987,
      engagement: 76.2
    },
    {
      id: '3',
      name: '城市漫步',
      count: 7654,
      growth: 45.2,
      category: 'rising',
      posts: 765,
      engagement: 82.1
    },
    {
      id: '4',
      name: '摄影技巧',
      count: 6543,
      growth: 12.8,
      category: 'hot',
      posts: 654,
      engagement: 91.3
    },
    {
      id: '5',
      name: '周末出游',
      count: 5432,
      growth: 67.9,
      category: 'rising',
      posts: 543,
      engagement: 78.6
    },
    {
      id: '6',
      name: '咖啡文化',
      count: 4321,
      growth: 156.7,
      category: 'new',
      posts: 432,
      engagement: 85.4
    },
    {
      id: '7',
      name: '夜景摄影',
      count: 3210,
      growth: 34.5,
      category: 'rising',
      posts: 321,
      engagement: 88.9
    },
    {
      id: '8',
      name: '健身日常',
      count: 2109,
      growth: 89.2,
      category: 'new',
      posts: 210,
      engagement: 72.3
    }
  ];

  const filteredTags = selectedCategory === 'all' 
    ? trendingTags 
    : trendingTags.filter(tag => tag.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hot':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'rising':
        return <TrendingUp className="h-3 w-3 text-orange-500" />;
      case 'new':
        return <Clock className="h-3 w-3 text-green-500" />;
      default:
        return <Hash className="h-3 w-3 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hot':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'rising':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'new':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-4">
      {/* 标题和分类筛选 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">热门话题</h3>
        </div>
        <div className="flex space-x-1">
          {[
            { key: 'all', label: '全部' },
            { key: 'hot', label: '热门' },
            { key: 'rising', label: '上升' },
            { key: 'new', label: '新兴' }
          ].map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key as any)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category.key
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* 热门话题列表 */}
      <div className="space-y-2">
        {filteredTags.map((tag, index) => (
          <div
            key={tag.id}
            className={`group p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
              selectedTag === tag.id
                ? 'bg-blue-50 border-blue-200 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* 排名 */}
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                
                {/* 话题信息 */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {tag.name}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
                      getCategoryColor(tag.category)
                    }`}>
                      {getCategoryIcon(tag.category)}
                      <span className="ml-1">
                        {tag.category === 'hot' ? '热门' : tag.category === 'rising' ? '上升' : '新兴'}
                      </span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{formatNumber(tag.count)} 浏览</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{formatNumber(tag.posts)} 帖子</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{tag.engagement}% 互动率</span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 增长率 */}
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  tag.growth > 50 ? 'bg-green-100 text-green-700' :
                  tag.growth > 20 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  <span>+{tag.growth}%</span>
                </div>
                <span className={`transform transition-transform ${
                  selectedTag === tag.id ? 'rotate-180' : ''
                }`}>
                  ▼
                </span>
              </div>
            </div>
            
            {/* 展开的详细信息 */}
            {selectedTag === tag.id && (
              <div className="mt-3 pt-3 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">今日新增:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {Math.floor(tag.count * tag.growth / 100)} 次浏览
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">活跃用户:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {Math.floor(tag.posts * 0.8)} 人
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">平均点赞:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {Math.floor(tag.engagement * 2.3)} 个/帖
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">趋势预测:</span>
                    <span className={`ml-2 font-medium ${
                      tag.growth > 50 ? 'text-green-600' :
                      tag.growth > 20 ? 'text-orange-600' :
                      'text-gray-600'
                    }`}>
                      {tag.growth > 50 ? '持续上升' : tag.growth > 20 ? '稳定增长' : '平稳发展'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors">
                    查看相关帖子
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors">
                    关注话题
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 查看更多 */}
      <div className="text-center">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          查看更多热门话题 →
        </button>
      </div>
    </div>
  );
};

export default TrendingTags;
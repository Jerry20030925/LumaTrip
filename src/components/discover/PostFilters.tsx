import React, { useState } from 'react';
import { Calendar, MapPin, Tag, Users, TrendingUp, Filter } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  options: string[];
}

const PostFilters: React.FC = () => {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filterCategories: FilterOption[] = [
    {
      id: 'time',
      label: '时间范围',
      icon: <Calendar className="h-4 w-4" />,
      options: ['今天', '本周', '本月', '全部时间']
    },
    {
      id: 'location',
      label: '地理位置',
      icon: <MapPin className="h-4 w-4" />,
      options: ['附近', '同城', '国内', '海外', '全球']
    },
    {
      id: 'category',
      label: '内容分类',
      icon: <Tag className="h-4 w-4" />,
      options: ['美食', '旅行', '风景', '摄影', '生活', '艺术', '运动', '音乐']
    },
    {
      id: 'popularity',
      label: '热度排序',
      icon: <TrendingUp className="h-4 w-4" />,
      options: ['最热门', '最新发布', '最多点赞', '最多评论', '最多收藏']
    },
    {
      id: 'author',
      label: '作者类型',
      icon: <Users className="h-4 w-4" />,
      options: ['全部用户', '已关注', '认证用户', '新用户']
    }
  ];

  const handleFilterChange = (categoryId: string, option: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [categoryId]: option
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setActiveCategory(null);
  };

  const hasActiveFilters = Object.keys(selectedFilters).length > 0;

  return (
    <div className="space-y-4">
      {/* 筛选标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">筛选条件</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            清除全部
          </button>
        )}
      </div>

      {/* 已选择的筛选条件 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-gray-600 mr-2">已选择:</span>
          {Object.entries(selectedFilters).map(([categoryId, option]) => {
            const category = filterCategories.find(c => c.id === categoryId);
            return (
              <span
                key={categoryId}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {category?.icon}
                <span className="ml-1">{option}</span>
                <button
                  onClick={() => {
                    const newFilters = { ...selectedFilters };
                    delete newFilters[categoryId];
                    setSelectedFilters(newFilters);
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* 筛选选项 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filterCategories.map((category) => (
          <div key={category.id} className="space-y-2">
            <button
              onClick={() => setActiveCategory(
                activeCategory === category.id ? null : category.id
              )}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors w-full text-left"
            >
              {category.icon}
              <span>{category.label}</span>
              <span className={`ml-auto transform transition-transform ${
                activeCategory === category.id ? 'rotate-180' : ''
              }`}>
                ▼
              </span>
            </button>
            
            {activeCategory === category.id && (
              <div className="space-y-1 pl-6 animate-in slide-in-from-top-2 duration-200">
                {category.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name={category.id}
                      value={option}
                      checked={selectedFilters[category.id] === option}
                      onChange={() => handleFilterChange(category.id, option)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 快速筛选标签 */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">快速筛选</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '今日热门', filters: { time: '今天', popularity: '最热门' } as Record<string, string> },
            { label: '附近美食', filters: { location: '附近', category: '美食' } as Record<string, string> },
            { label: '旅行攻略', filters: { category: '旅行', popularity: '最多收藏' } as Record<string, string> },
            { label: '摄影作品', filters: { category: '摄影', popularity: '最多点赞' } as Record<string, string> },
            { label: '关注动态', filters: { author: '已关注', time: '本周' } as Record<string, string> }
          ].map((quickFilter, index) => (
            <button
              key={index}
              onClick={() => setSelectedFilters(quickFilter.filters)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              {quickFilter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostFilters;
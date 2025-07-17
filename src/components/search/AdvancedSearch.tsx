import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X, Star, Users, Camera, Hash, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFilters {
  query: string;
  location: string;
  dateRange: {
    start: string;
    end: string;
  };
  category: string;
  rating: number;
  radius: number;
  sortBy: 'newest' | 'popular' | 'rating' | 'distance';
  contentType: 'all' | 'posts' | 'users' | 'places';
  tags: string[];
}

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  isOpen,
  onClose,
  onSearch,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    dateRange: {
      start: '',
      end: ''
    },
    category: '',
    rating: 0,
    radius: 10,
    sortBy: 'newest',
    contentType: 'all',
    tags: [],
    ...initialFilters
  });

  const [tagInput, setTagInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const categories = [
    { id: '', label: '所有类型' },
    { id: 'restaurant', label: '餐厅' },
    { id: 'attraction', label: '景点' },
    { id: 'hotel', label: '酒店' },
    { id: 'activity', label: '活动' },
    { id: 'shopping', label: '购物' },
    { id: 'nightlife', label: '夜生活' }
  ];

  const popularTags = [
    '美食', '风景', '文化', '历史', '自然', '冒险', '放松', '家庭', '情侣', '独旅',
    '摄影', '艺术', '音乐', '节日', '海滩', '山脉', '城市', '乡村', '奢华', '预算'
  ];

  const sortOptions = [
    { value: 'newest', label: '最新', icon: Clock },
    { value: 'popular', label: '最受欢迎', icon: Star },
    { value: 'rating', label: '评分最高', icon: Star },
    { value: 'distance', label: '距离最近', icon: MapPin }
  ];

  const contentTypes = [
    { value: 'all', label: '全部', icon: Filter },
    { value: 'posts', label: '帖子', icon: Camera },
    { value: 'users', label: '用户', icon: Users },
    { value: 'places', label: '地点', icon: MapPin }
  ];

  useEffect(() => {
    if (tagInput) {
      const filtered = popularTags.filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !filters.tags.includes(tag)
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [tagInput, filters.tags]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      query: '',
      location: '',
      dateRange: { start: '', end: '' },
      category: '',
      rating: 0,
      radius: 10,
      sortBy: 'newest',
      contentType: 'all',
      tags: []
    });
    setTagInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">高级搜索</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Search Query */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  搜索关键词
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    placeholder="输入搜索关键词..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Location and Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    地点
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      placeholder="城市或地区..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    开始日期
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    结束日期
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Category and Rating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    类别
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    最低评分
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{filters.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  内容类型
                </label>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => handleFilterChange('contentType', type.value)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-full border transition-colors ${
                          filters.contentType === type.value
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  标签
                </label>
                <div className="space-y-2">
                  {/* Tag Input */}
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      placeholder="添加标签..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Tag Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleAddTag(tag)}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected Tags */}
                  {filters.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {filters.tags.map(tag => (
                        <div
                          key={tag}
                          className="flex items-center space-x-1 px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  排序方式
                </label>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange('sortBy', option.value)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-full border transition-colors ${
                          filters.sortBy === option.value
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t dark:border-gray-700">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                重置
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  搜索
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdvancedSearch;
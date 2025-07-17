import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, History, X, Filter, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUserLocation } from '../../services/profile.service';
import recommendationsService, { type Recommendation, type RecommendationFilters } from '../../services/recommendations.service';
import LocationBasedRecommendations from './LocationBasedRecommendations';
import type { LocationResult } from '../../services/location.service';

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
}

interface LocationBasedSearchProps {
  className?: string;
  onResultClick?: (recommendation: Recommendation) => void;
}

const LocationBasedSearch: React.FC<LocationBasedSearchProps> = ({
  className = '',
  onResultClick: _onResultClick
}) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [filters, setFilters] = useState<RecommendationFilters>({
    category: 'all',
    maxDistance: 25,
    minRating: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (user?.id) {
      loadUserLocation();
      loadSearchHistory();
    }
  }, [user?.id]);

  useEffect(() => {
    // Debounced search
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (query.length >= 2) {
      debounceTimeoutRef.current = setTimeout(() => {
        handleSearch(query);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, filters]);

  const loadUserLocation = async () => {
    if (!user?.id) return;

    try {
      const location = await getUserLocation(user.id);
      if (location) {
        const locationResult: LocationResult = {
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy
          },
          address: {
            street: location.address,
            city: location.city,
            state: location.state,
            country: location.country,
            countryCode: location.countryCode,
            postalCode: location.postalCode
          },
          timestamp: location.lastUpdated.getTime()
        };
        setUserLocation(locationResult);
      }
    } catch (err) {
      console.error('Error loading user location:', err);
    }
  };

  const loadSearchHistory = () => {
    // Load from localStorage
    const savedHistory = localStorage.getItem('locationSearchHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setSearchHistory(history.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (err) {
        console.error('Error parsing search history:', err);
      }
    }
  };

  const saveSearchHistory = (searchQuery: string, resultCount: number) => {
    const newHistoryItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query: searchQuery,
      timestamp: new Date(),
      resultCount
    };

    const updatedHistory = [newHistoryItem, ...searchHistory.slice(0, 9)]; // Keep last 10 searches
    setSearchHistory(updatedHistory);
    localStorage.setItem('locationSearchHistory', JSON.stringify(updatedHistory));
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim() || !userLocation) return;

    setLoading(true);
    setError(null);

    try {
      // Create search-specific filters
      const searchFilters: RecommendationFilters = {
        ...filters
        // Note: Text search would need to be implemented in the service
        // For now, we'll do client-side filtering
      };

      const response = await recommendationsService.getRecommendations(
        userLocation,
        searchFilters,
        1,
        50
      );

      // Filter results based on search query (client-side filtering as fallback)
      const filteredResults = response.recommendations.filter(rec =>
        rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      setSearchResults(filteredResults);
      
      // Save to history
      saveSearchHistory(searchQuery, filteredResults.length);
    } catch (err) {
      console.error('Error searching:', err);
      setError('搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (historyItem: SearchHistoryItem) => {
    setQuery(historyItem.query);
    setShowHistory(false);
    searchInputRef.current?.focus();
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('locationSearchHistory');
  };

  const handleClearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setError(null);
  };

  if (!userLocation) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            需要位置信息
          </h3>
          <p className="text-gray-600">
            请先开启位置服务以使用附近搜索功能
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">附近搜索</h2>
            <p className="text-sm text-gray-600">
              在 {userLocation.address.city} 附近搜索
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            placeholder="搜索餐厅、景点、酒店..."
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {query && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Search History */}
        {showHistory && searchHistory.length > 0 && (
          <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">搜索历史</span>
              <button
                onClick={clearSearchHistory}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                清除
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {searchHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <History className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{item.query}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {item.resultCount} 个结果
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Toggle */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>搜索范围: {filters.maxDistance}km</span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
              showFilters
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  类别
                </label>
                <select
                  value={filters.category || 'all'}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    category: e.target.value as any
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部</option>
                  <option value="restaurant">餐厅</option>
                  <option value="attraction">景点</option>
                  <option value="hotel">酒店</option>
                  <option value="activity">活动</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  距离 (km)
                </label>
                <select
                  value={filters.maxDistance || 25}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    maxDistance: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={5}>5km 以内</option>
                  <option value={10}>10km 以内</option>
                  <option value={25}>25km 以内</option>
                  <option value={50}>50km 以内</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  评分
                </label>
                <select
                  value={filters.minRating || 0}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    minRating: parseFloat(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>任意评分</option>
                  <option value={3.5}>3.5分以上</option>
                  <option value={4.0}>4.0分以上</option>
                  <option value={4.5}>4.5分以上</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="p-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">搜索中...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-700">
              <X className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && query && searchResults.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              没有找到结果
            </h3>
            <p className="text-gray-600">
              尝试使用不同的关键词或调整搜索范围
            </p>
          </div>
        )}

        {!loading && !error && searchResults.length > 0 && (
          <div>
            <div className="mb-4 text-sm text-gray-600">
              找到 {searchResults.length} 个关于 "{query}" 的结果
            </div>
            <LocationBasedRecommendations
              location={userLocation}
              className="shadow-none border-none p-0"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationBasedSearch;
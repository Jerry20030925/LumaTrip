import React, { useState, useEffect } from 'react';
import { MapPin, Star, Clock, Coffee, Camera, Building, Navigation, RefreshCw, AlertCircle, Bookmark, MessageCircle } from 'lucide-react';
import type { LocationResult } from '../../services/location.service';
import recommendationsService, { type Recommendation, type RecommendationFilters } from '../../services/recommendations.service';
import { useBookmarks } from '../../hooks/useBookmarks';
import ReviewsContainer from '../reviews/ReviewsContainer';

interface LocationBasedRecommendationsProps {
  location: LocationResult;
  onRefresh?: () => void;
  className?: string;
}

const LocationBasedRecommendations: React.FC<LocationBasedRecommendationsProps> = ({
  location,
  onRefresh,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'attraction' | 'restaurant' | 'hotel' | 'activity'>('all');
  const [error, setError] = useState<string | null>(null);
  
  // Bookmarks functionality
  const { addBookmark, removeBookmark, getBookmarkStatus } = useBookmarks();
  
  // Reviews functionality
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [showReviews, setShowReviews] = useState(false);

  const categories = [
    { key: 'all' as const, label: 'All', icon: MapPin },
    { key: 'attraction' as const, label: 'Attractions', icon: Camera },
    { key: 'restaurant' as const, label: 'Dining', icon: Coffee },
    { key: 'hotel' as const, label: 'Hotels', icon: Building },
    { key: 'activity' as const, label: 'Activities', icon: Navigation }
  ];

  useEffect(() => {
    loadRecommendations();
  }, [location, activeCategory]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters: RecommendationFilters = {
        category: activeCategory,
        maxDistance: 50,
        minRating: 4.0
      };

      const response = await recommendationsService.getRecommendations(location, filters, 1, 20);
      setRecommendations(response.recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Since filtering is now handled by the service, we can use recommendations directly
  const filteredRecommendations = recommendations;
  
  const handleBookmarkToggle = async (recommendationId: string) => {
    try {
      const isCurrentlyBookmarked = getBookmarkStatus(recommendationId);
      
      if (isCurrentlyBookmarked) {
        await removeBookmark(recommendationId);
      } else {
        await addBookmark(recommendationId);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleShowReviews = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowReviews(true);
  };

  const getPriceLevelText = (level: number): string => {
    return '$'.repeat(level);
  };

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'attraction': return Camera;
      case 'restaurant': return Coffee;
      case 'hotel': return Building;
      case 'activity': return Navigation;
      default: return MapPin;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Recommendations Near You
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{location.address.city}, {location.address.country}</span>
          </div>
        </div>
        
        <button
          onClick={onRefresh || loadRecommendations}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh recommendations"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(category => {
          const Icon = category.icon;
          const isActive = activeCategory === category.key;
          
          return (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error Loading Recommendations</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={loadRecommendations}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="space-y-4">
        {filteredRecommendations.map(recommendation => {
          const TypeIcon = getTypeIcon(recommendation.type);
          
          return (
            <div
              key={recommendation.id}
              className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={recommendation.image}
                  alt={recommendation.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1">
                  <TypeIcon className="w-3 h-3 text-gray-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {recommendation.name}
                  </h3>
                  <div className="flex items-center gap-1 ml-2">
                    {recommendation.openNow !== undefined && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        recommendation.openNow 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {recommendation.openNow ? 'Open' : 'Closed'}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {recommendation.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{recommendation.rating}</span>
                    <span>({recommendation.reviewCount})</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{recommendation.distance}</span>
                  </div>
                  
                  <span className="text-blue-600 font-medium">
                    {getPriceLevelText(recommendation.priceLevel)}
                  </span>
                  
                  {recommendation.estimatedTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recommendation.estimatedTime}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {recommendation.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={() => handleShowReviews(recommendation)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>评价</span>
                  </button>
                  
                  <button
                    onClick={() => handleBookmarkToggle(recommendation.id)}
                    className={`p-2 rounded-full transition-colors ${
                      getBookmarkStatus(recommendation.id)
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                    title={getBookmarkStatus(recommendation.id) ? '取消收藏' : '收藏'}
                  >
                    <Bookmark 
                      className={`w-4 h-4 ${
                        getBookmarkStatus(recommendation.id) ? 'fill-current' : ''
                      }`} 
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recommendations found for this category.</p>
        </div>
      )}

      {/* Reviews Modal */}
      {showReviews && selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedRecommendation.name}
                  </h2>
                  <p className="text-sm text-gray-600">{selectedRecommendation.address}</p>
                </div>
                <button
                  onClick={() => setShowReviews(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <ReviewsContainer recommendationId={selectedRecommendation.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationBasedRecommendations;
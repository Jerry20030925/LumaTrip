import React, { useState } from 'react';
import { MapPin, SlidersHorizontal, X } from 'lucide-react';
import { useLocationBasedRecommendations } from '../../hooks/useLocationBasedRecommendations';
import type { RecommendationFilters } from '../../services/recommendations.service';
import LocationBasedRecommendations from './LocationBasedRecommendations';
import type { LocationResult } from '../../services/location.service';

interface LocationBasedContentProps {
  className?: string;
  showFilters?: boolean;
  defaultFilters?: RecommendationFilters;
  title?: string;
  subtitle?: string;
}

const LocationBasedContent: React.FC<LocationBasedContentProps> = ({
  className = '',
  showFilters = true,
  defaultFilters = {},
  title = 'Recommendations Near You',
  subtitle = 'Discover amazing places in your area'
}) => {
  const {
    loading,
    error,
    userLocation,
    hasMore,
    loadRecommendations,
    loadMore,
    refresh
  } = useLocationBasedRecommendations({ 
    autoLoad: true, 
    filters: defaultFilters 
  });

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState<RecommendationFilters>(defaultFilters);

  // Convert UserLocation to LocationResult for the recommendations component
  const locationResult: LocationResult | null = userLocation ? {
    location: {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      accuracy: userLocation.accuracy
    },
    address: {
      street: userLocation.address,
      city: userLocation.city,
      state: userLocation.state,
      country: userLocation.country,
      countryCode: userLocation.countryCode,
      postalCode: userLocation.postalCode
    },
    timestamp: userLocation.lastUpdated.getTime()
  } : null;

  const handleFilterChange = (newFilters: RecommendationFilters) => {
    setActiveFilters(newFilters);
    loadRecommendations(newFilters);
    setShowFilterPanel(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = { ...defaultFilters };
    setActiveFilters(clearedFilters);
    loadRecommendations(clearedFilters);
  };

  if (!userLocation) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Location Required
          </h3>
          <p className="text-gray-600 mb-4">
            Please enable location access to get personalized recommendations
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Recommendations
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-1">{subtitle}</p>
            {userLocation && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <MapPin className="w-4 h-4" />
                <span>{userLocation.city}, {userLocation.country}</span>
              </div>
            )}
          </div>
          
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={activeFilters.category || 'all'}
                  onChange={(e) => handleFilterChange({
                    ...activeFilters,
                    category: e.target.value as any
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="attraction">Attractions</option>
                  <option value="restaurant">Restaurants</option>
                  <option value="hotel">Hotels</option>
                  <option value="activity">Activities</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance (km)
                </label>
                <select
                  value={activeFilters.maxDistance || 50}
                  onChange={(e) => handleFilterChange({
                    ...activeFilters,
                    maxDistance: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>Within 10 km</option>
                  <option value={25}>Within 25 km</option>
                  <option value={50}>Within 50 km</option>
                  <option value={100}>Within 100 km</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={activeFilters.minRating || 0}
                  onChange={(e) => handleFilterChange({
                    ...activeFilters,
                    minRating: parseFloat(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Any Rating</option>
                  <option value={3.5}>3.5+ Stars</option>
                  <option value={4.0}>4.0+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Content */}
      <div className="p-6">
        {locationResult && (
          <LocationBasedRecommendations
            location={locationResult}
            onRefresh={refresh}
            className="shadow-none border-none p-0"
          />
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center mt-6">
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load More Recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationBasedContent;
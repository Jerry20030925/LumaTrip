import type { LocationResult, Location } from './location.service';
import { getUserLocation } from './profile.service';
import { supabase } from '../utils/supabaseClient';

export interface Recommendation {
  id: string;
  name: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'activity';
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  distance: string;
  priceLevel: number;
  tags: string[];
  estimatedTime?: string;
  openNow?: boolean;
  location: Location;
  address?: string;
  website?: string;
  phone?: string;
}

export interface RecommendationFilters {
  category?: 'all' | 'attraction' | 'restaurant' | 'hotel' | 'activity';
  maxDistance?: number; // in kilometers
  minRating?: number;
  priceLevel?: number[];
  openNow?: boolean;
  tags?: string[];
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  totalCount: number;
  hasMore: boolean;
  nextPage?: number;
}

class RecommendationsService {
  private static instance: RecommendationsService;
  private cache: Map<string, { data: RecommendationResponse; timestamp: number }> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): RecommendationsService {
    if (!RecommendationsService.instance) {
      RecommendationsService.instance = new RecommendationsService();
    }
    return RecommendationsService.instance;
  }

  /**
   * Get recommendations for a specific location
   */
  async getRecommendations(
    location: LocationResult,
    filters: RecommendationFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<RecommendationResponse> {
    const cacheKey = this.getCacheKey(location, filters, page, limit);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      // In production, this would call external APIs like Google Places, Yelp, etc.
      // For now, we'll use enhanced mock data with database storage
      const recommendations = await this.fetchRecommendations(location, filters, page, limit);
      
      const response: RecommendationResponse = {
        recommendations,
        totalCount: recommendations.length,
        hasMore: recommendations.length === limit,
        nextPage: recommendations.length === limit ? page + 1 : undefined
      };

      // Cache the response
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      return response;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  /**
   * Get recommendations for a user based on their saved location
   */
  async getRecommendationsForUser(
    userId: string,
    filters: RecommendationFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<RecommendationResponse> {
    try {
      const userLocation = await getUserLocation(userId);
      
      if (!userLocation) {
        throw new Error('User location not found');
      }

      // Convert UserLocation to LocationResult format
      const locationResult: LocationResult = {
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
      };

      return this.getRecommendations(locationResult, filters, page, limit);
    } catch (error) {
      console.error('Error fetching user recommendations:', error);
      throw error;
    }
  }

  /**
   * Save a recommendation to database for future use
   */
  async saveRecommendation(recommendation: Recommendation): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('recommendations')
        .upsert({
          id: recommendation.id,
          name: recommendation.name,
          type: recommendation.type,
          description: recommendation.description,
          image: recommendation.image,
          rating: recommendation.rating,
          review_count: recommendation.reviewCount,
          price_level: recommendation.priceLevel,
          tags: recommendation.tags,
          estimated_time: recommendation.estimatedTime,
          open_now: recommendation.openNow,
          latitude: recommendation.location.latitude,
          longitude: recommendation.location.longitude,
          address: recommendation.address,
          website: recommendation.website,
          phone: recommendation.phone,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving recommendation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving recommendation:', error);
      return false;
    }
  }

  /**
   * Get nearby recommendations from database
   */
  async getNearbyRecommendations(
    location: Location,
    radiusKm: number = 50,
    filters: RecommendationFilters = {}
  ): Promise<Recommendation[]> {
    try {
      let query = supabase
        .from('recommendations')
        .select('*')
        .gte('latitude', location.latitude - radiusKm / 111) // Rough lat/lng to km conversion
        .lte('latitude', location.latitude + radiusKm / 111)
        .gte('longitude', location.longitude - radiusKm / 111)
        .lte('longitude', location.longitude + radiusKm / 111);

      if (filters.category && filters.category !== 'all') {
        query = query.eq('type', filters.category);
      }

      if (filters.minRating !== undefined) {
        query = query.gte('rating', filters.minRating);
      }

      if (filters.priceLevel && filters.priceLevel.length > 0) {
        query = query.in('price_level', filters.priceLevel);
      }

      if (filters.openNow !== undefined) {
        query = query.eq('open_now', filters.openNow);
      }

      const { data, error } = await query.limit(20);

      if (error) {
        console.error('Error fetching nearby recommendations:', error);
        return [];
      }

      return (data || []).map(this.mapDatabaseToRecommendation);
    } catch (error) {
      console.error('Error fetching nearby recommendations:', error);
      return [];
    }
  }

  /**
   * Generate enhanced mock recommendations with better variety and realism
   */
  private async fetchRecommendations(
    location: LocationResult,
    filters: RecommendationFilters,
    page: number,
    limit: number
  ): Promise<Recommendation[]> {
    const { city } = location.address;
    const { latitude, longitude } = location.location;

    // Try to get some real data from database first
    const nearbyRecommendations = await this.getNearbyRecommendations(
      location.location,
      filters.maxDistance || 50,
      filters
    );

    // If we have enough real data, use it
    if (nearbyRecommendations.length >= limit) {
      return nearbyRecommendations.slice((page - 1) * limit, page * limit);
    }

    // Otherwise, supplement with enhanced mock data
    const mockRecommendations = this.generateEnhancedMockRecommendations(
      city,
      location.address.country,
      latitude,
      longitude,
      filters
    );

    // Combine real and mock data
    const allRecommendations = [...nearbyRecommendations, ...mockRecommendations];

    // Filter based on criteria
    let filteredRecommendations = allRecommendations;

    if (filters.category && filters.category !== 'all') {
      filteredRecommendations = filteredRecommendations.filter(r => r.type === filters.category);
    }

    if (filters.minRating !== undefined) {
      filteredRecommendations = filteredRecommendations.filter(r => r.rating >= filters.minRating!);
    }

    if (filters.priceLevel && filters.priceLevel.length > 0) {
      filteredRecommendations = filteredRecommendations.filter(r => 
        filters.priceLevel!.includes(r.priceLevel)
      );
    }

    if (filters.openNow !== undefined) {
      filteredRecommendations = filteredRecommendations.filter(r => r.openNow === filters.openNow);
    }

    // Sort by rating and distance
    filteredRecommendations.sort((a, b) => {
      const ratingDiff = b.rating - a.rating;
      if (Math.abs(ratingDiff) > 0.2) return ratingDiff;
      
      // If ratings are similar, sort by distance
      const distanceA = parseFloat(a.distance.replace(' km', ''));
      const distanceB = parseFloat(b.distance.replace(' km', ''));
      return distanceA - distanceB;
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    return filteredRecommendations.slice(startIndex, startIndex + limit);
  }

  /**
   * Generate enhanced mock recommendations with more variety
   */
  private generateEnhancedMockRecommendations(
    city: string,
    _country: string,
    latitude: number,
    longitude: number,
    filters: RecommendationFilters
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Enhanced attractions
    const attractions = [
      {
        name: `${city} Historical Museum`,
        description: `Discover the rich history and cultural heritage of ${city} through interactive exhibits and artifacts.`,
        image: 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=300&h=200&fit=crop',
        rating: 4.6,
        reviewCount: 1240,
        priceLevel: 2,
        tags: ['History', 'Culture', 'Indoor', 'Educational'],
        estimatedTime: '2-3 hours',
        openNow: true
      },
      {
        name: `${city} Art Gallery`,
        description: `Contemporary and classical art collection showcasing local and international artists.`,
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop',
        rating: 4.4,
        reviewCount: 856,
        priceLevel: 2,
        tags: ['Art', 'Culture', 'Indoor', 'Contemporary'],
        estimatedTime: '1-2 hours',
        openNow: true
      },
      {
        name: `${city} Observation Deck`,
        description: `Panoramic views of the city skyline and surrounding landscape from the highest point.`,
        image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=300&h=200&fit=crop',
        rating: 4.8,
        reviewCount: 2156,
        priceLevel: 3,
        tags: ['Views', 'Photography', 'Outdoor', 'Sunset'],
        estimatedTime: '1 hour',
        openNow: true
      }
    ];

    // Enhanced restaurants
    const restaurants = [
      {
        name: `${city} Bistro`,
        description: `Authentic local cuisine with modern presentation using fresh, seasonal ingredients.`,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop',
        rating: 4.7,
        reviewCount: 892,
        priceLevel: 3,
        tags: ['Local Cuisine', 'Fine Dining', 'Romantic', 'Seasonal'],
        openNow: true,
        estimatedTime: undefined
      },
      {
        name: 'Street Food Paradise',
        description: `Vibrant market atmosphere with diverse food stalls offering authentic street food.`,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop',
        rating: 4.3,
        reviewCount: 1456,
        priceLevel: 1,
        tags: ['Street Food', 'Market', 'Casual', 'Authentic'],
        openNow: true,
        estimatedTime: undefined
      },
      {
        name: 'Rooftop Restaurant',
        description: `Elevated dining experience with city views and innovative fusion cuisine.`,
        image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=300&h=200&fit=crop',
        rating: 4.9,
        reviewCount: 634,
        priceLevel: 4,
        tags: ['Fusion', 'Views', 'Upscale', 'Cocktails'],
        openNow: false,
        estimatedTime: undefined
      }
    ];

    // Enhanced hotels
    const hotels = [
      {
        name: `${city} Grand Hotel`,
        description: `Luxury accommodation in the heart of the city with world-class amenities and service.`,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop',
        rating: 4.5,
        reviewCount: 1234,
        priceLevel: 4,
        tags: ['Luxury', 'City Center', 'Spa', 'Business'],
        openNow: true,
        estimatedTime: undefined
      },
      {
        name: 'Boutique Inn',
        description: `Charming boutique hotel with personalized service and unique local character.`,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop',
        rating: 4.6,
        reviewCount: 567,
        priceLevel: 3,
        tags: ['Boutique', 'Local', 'Charming', 'Personalized'],
        openNow: true,
        estimatedTime: undefined
      }
    ];

    // Enhanced activities
    const activities = [
      {
        name: `${city} Walking Tour`,
        description: `Guided exploration of historic neighborhoods with local stories and hidden gems.`,
        image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=300&h=200&fit=crop',
        rating: 4.8,
        reviewCount: 456,
        priceLevel: 2,
        tags: ['Walking', 'History', 'Local Guide', 'Culture'],
        estimatedTime: '2 hours',
        openNow: true
      },
      {
        name: 'River Cruise',
        description: `Relaxing boat tour along the waterway with commentary and refreshments.`,
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop',
        rating: 4.4,
        reviewCount: 789,
        priceLevel: 3,
        tags: ['Water', 'Relaxing', 'Sightseeing', 'Commentary'],
        estimatedTime: '1.5 hours',
        openNow: true
      }
    ];

    // Generate recommendations based on category
    const allItems = [...attractions, ...restaurants, ...hotels, ...activities];
    const typeMap = {
      attraction: attractions,
      restaurant: restaurants,
      hotel: hotels,
      activity: activities
    };

    const itemsToProcess = filters.category && filters.category !== 'all' 
      ? typeMap[filters.category] 
      : allItems;

    itemsToProcess.forEach((item, index) => {
      const distance = (Math.random() * 5 + 0.1).toFixed(1);
      const type = filters.category && filters.category !== 'all' 
        ? filters.category 
        : (['attraction', 'restaurant', 'hotel', 'activity'] as const)[
            index % 4
          ];

      recommendations.push({
        id: `mock-${type}-${index}`,
        name: item.name,
        type: type,
        description: item.description,
        image: item.image,
        rating: item.rating,
        reviewCount: item.reviewCount,
        distance: `${distance} km`,
        priceLevel: item.priceLevel,
        tags: item.tags,
        estimatedTime: item.estimatedTime || undefined,
        openNow: item.openNow !== undefined ? item.openNow : Math.random() > 0.3,
        location: {
          latitude: latitude + (Math.random() - 0.5) * 0.1,
          longitude: longitude + (Math.random() - 0.5) * 0.1,
          accuracy: Math.random() * 100 + 10
        },
        address: `${Math.floor(Math.random() * 999) + 1} ${['Main St', 'Oak Ave', 'Park Blvd', 'Center St'][Math.floor(Math.random() * 4)]}, ${city}`,
        website: `https://www.${item.name.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
      });
    });

    return recommendations;
  }

  /**
   * Map database record to Recommendation interface
   */
  private mapDatabaseToRecommendation(data: any): Recommendation {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      description: data.description,
      image: data.image,
      rating: data.rating,
      reviewCount: data.review_count,
      distance: '0.0 km', // Would calculate this based on user location
      priceLevel: data.price_level,
      tags: data.tags || [],
      estimatedTime: data.estimated_time,
      openNow: data.open_now,
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: 10
      },
      address: data.address,
      website: data.website,
      phone: data.phone
    };
  }

  /**
   * Generate cache key for recommendations
   */
  private getCacheKey(
    location: LocationResult,
    filters: RecommendationFilters,
    page: number,
    limit: number
  ): string {
    return `recommendations:${location.location.latitude}:${location.location.longitude}:${JSON.stringify(filters)}:${page}:${limit}`;
  }

  /**
   * Clear cache (useful for testing or when data changes)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export default RecommendationsService.getInstance();
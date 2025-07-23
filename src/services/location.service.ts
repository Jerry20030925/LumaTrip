export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Address {
  street?: string;
  city: string;
  state?: string;
  country: string;
  countryCode: string;
  postalCode?: string;
}

export interface LocationResult {
  location: Location;
  address: Address;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';
}

export class LocationServiceError extends Error implements LocationError {
  code: number;
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';

  constructor(error: LocationError) {
    super(error.message);
    this.name = 'LocationServiceError';
    this.code = error.code;
    this.type = error.type;
  }
}

class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private lastKnownLocation: LocationResult | null = null;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Check if geolocation is supported by the browser
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Get current position with high accuracy
   */
  async getCurrentLocation(): Promise<LocationResult> {
    if (!this.isSupported()) {
      throw new LocationServiceError({
        code: 0,
        message: 'Geolocation is not supported by this browser',
        type: 'NOT_SUPPORTED'
      });
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const location: Location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      // Get address from coordinates using reverse geocoding
      const address = await this.reverseGeocode(location);

      const result: LocationResult = {
        location,
        address,
        timestamp: Date.now()
      };

      this.lastKnownLocation = result;
      this.storeLocationInCache(result);

      return result;
    } catch (error: any) {
      throw this.handleGeolocationError(error);
    }
  }

  /**
   * Request location permission without getting location
   */
  async requestPermission(): Promise<PermissionState> {
    if (!this.isSupported()) {
      throw new Error('Geolocation not supported');
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch {
      // Fallback: try to get location to check permission
      try {
        await navigator.geolocation.getCurrentPosition(() => {}, () => {}, { timeout: 1 });
        return 'granted';
      } catch {
        return 'denied';
      }
    }
  }

  /**
   * Start watching user location for real-time updates
   */
  startWatching(callback: (location: LocationResult) => void, errorCallback?: (error: LocationError) => void): void {
    if (!this.isSupported()) {
      errorCallback?.(new LocationServiceError({
        code: 0,
        message: 'Geolocation not supported',
        type: 'NOT_SUPPORTED'
      }));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000 // 1 minute cache for watching
    };

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };

          const address = await this.reverseGeocode(location);
          const result: LocationResult = {
            location,
            address,
            timestamp: Date.now()
          };

          this.lastKnownLocation = result;
          callback(result);
        } catch (error) {
          console.error('Error processing location update:', error);
        }
      },
      (error) => {
        errorCallback?.(this.handleGeolocationError(error));
      },
      options
    );
  }

  /**
   * Stop watching user location
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Get last known location from cache
   */
  getLastKnownLocation(): LocationResult | null {
    if (this.lastKnownLocation) {
      return this.lastKnownLocation;
    }

    // Try to get from localStorage
    try {
      const cached = localStorage.getItem('lumatrip_last_location');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is not too old (24 hours)
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          this.lastKnownLocation = parsed;
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error reading cached location:', error);
    }

    return null;
  }

  /**
   * Calculate distance between two points in kilometers
   */
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get nearby cities based on current location
   */
  async getNearbyCities(location: Location, radius: number = 50): Promise<string[]> {
    try {
      // 首先尝试使用Google Places API
      const { getGoogleMapsApiKey, searchNearbyPlaces } = await import('../utils/googleMaps');
      const apiKey = getGoogleMapsApiKey();
      
      if (apiKey) {
        try {
          const places = await searchNearbyPlaces(
            { lat: location.latitude, lng: location.longitude },
            radius * 1000, // 转换为米
            'locality'
          );
          
          return places
            .map(place => place.name || place.vicinity || '')
            .filter(name => name.length > 0)
            .slice(0, 10); // 限制返回数量
        } catch (error) {
          console.error('Google Places search failed, falling back to mock:', error);
        }
      }
      
      // 如果Google Places API不可用，使用mock数据
      return this.getMockCitiesByRegion(location.latitude, location.longitude);
    } catch (error) {
      console.error('Error getting nearby cities:', error);
      return this.getMockCitiesByRegion(location.latitude, location.longitude);
    }
  }

  /**
   * Search for places by text using Google Places API
   */
  async searchPlaces(query: string, location?: Location, radius?: number): Promise<any[]> {
    try {
      const { getGoogleMapsApiKey, initializeGoogleMaps } = await import('../utils/googleMaps');
      const apiKey = getGoogleMapsApiKey();
      
      if (!apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      await initializeGoogleMaps({ apiKey, libraries: ['places'] });

      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request: google.maps.places.TextSearchRequest = {
        query,
        ...(location && {
          location: new google.maps.LatLng(location.latitude, location.longitude),
          radius: radius || 50000
        })
      };

      return new Promise((resolve, reject) => {
        service.textSearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results.map(place => ({
              id: place.place_id,
              name: place.name,
              address: place.formatted_address,
              location: {
                latitude: place.geometry?.location?.lat() || 0,
                longitude: place.geometry?.location?.lng() || 0
              },
              rating: place.rating,
              priceLevel: place.price_level,
              types: place.types,
              photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 400, maxHeight: 300 })
            })));
          } else {
            reject(new Error(`Places search failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to address using Google Maps API
   */
  private async reverseGeocode(location: Location): Promise<Address> {
    try {
      // 首先尝试使用Google Maps API
      const { getGoogleMapsApiKey, reverseGeocode: googleReverseGeocode } = await import('../utils/googleMaps');
      const apiKey = getGoogleMapsApiKey();
      
      if (apiKey) {
        try {
          const results = await googleReverseGeocode({
            lat: location.latitude,
            lng: location.longitude
          });
          
          if (results.length > 0) {
            return this.parseGoogleAddressComponents(results[0]);
          }
        } catch (error) {
          console.error('Google geocoding failed, falling back to mock:', error);
        }
      }
      
      // 如果Google Maps API不可用，使用mock实现
      return this.getMockAddressFromCoordinates(location);
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Return default address if geocoding fails
      return {
        city: 'Unknown City',
        country: 'Unknown Country',
        countryCode: 'XX'
      };
    }
  }

  /**
   * Parse Google geocoding result to Address format
   */
  private parseGoogleAddressComponents(result: google.maps.GeocoderResult): Address {
    const components = result.address_components || [];
    const address: Partial<Address> = {};

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        address.street = component.long_name;
      } else if (types.includes('route')) {
        address.street = address.street ? `${address.street} ${component.long_name}` : component.long_name;
      } else if (types.includes('locality')) {
        address.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        address.state = component.long_name;
      } else if (types.includes('country')) {
        address.country = component.long_name;
        address.countryCode = component.short_name;
      } else if (types.includes('postal_code')) {
        address.postalCode = component.long_name;
      }
    });

    return {
      street: address.street,
      city: address.city || 'Unknown City',
      state: address.state,
      country: address.country || 'Unknown Country',
      countryCode: address.countryCode || 'XX',
      postalCode: address.postalCode
    };
  }

  /**
   * Handle geolocation errors
   */
  private handleGeolocationError(error: GeolocationPositionError): LocationError {
    let type: LocationError['type'];
    let message: string;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        type = 'PERMISSION_DENIED';
        message = 'Location access denied by user';
        break;
      case error.POSITION_UNAVAILABLE:
        type = 'POSITION_UNAVAILABLE';
        message = 'Location information unavailable';
        break;
      case error.TIMEOUT:
        type = 'TIMEOUT';
        message = 'Location request timed out';
        break;
      default:
        type = 'POSITION_UNAVAILABLE';
        message = 'Unknown location error';
    }

    return {
      code: error.code,
      message,
      type
    };
  }

  /**
   * Store location in local cache
   */
  private storeLocationInCache(location: LocationResult): void {
    try {
      localStorage.setItem('lumatrip_last_location', JSON.stringify(location));
    } catch (error) {
      console.error('Error caching location:', error);
    }
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Mock address generation based on coordinates
   */
  private getMockAddressFromCoordinates(location: Location): Address {
    const { latitude, longitude } = location;

    // Simple mock logic based on coordinate ranges
    if (latitude >= 25 && latitude <= 49 && longitude >= -125 && longitude <= -66) {
      // USA
      return {
        city: this.getNearestUSCity(),
        state: 'California', // Mock
        country: 'United States',
        countryCode: 'US'
      };
    } else if (latitude >= 35 && latitude <= 71 && longitude >= -10 && longitude <= 40) {
      // Europe
      return {
        city: this.getNearestEuropeanCity(),
        country: 'Germany', // Mock
        countryCode: 'DE'
      };
    } else if (latitude >= -10 && latitude <= 55 && longitude >= 60 && longitude <= 180) {
      // Asia
      return {
        city: this.getNearestAsianCity(),
        country: 'Japan', // Mock
        countryCode: 'JP'
      };
    } else {
      return {
        city: 'Unknown City',
        country: 'Unknown Country',
        countryCode: 'XX'
      };
    }
  }

  /**
   * Mock city detection for different regions
   */
  private getNearestUSCity(): string {
    const cities = ['Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  private getNearestEuropeanCity(): string {
    const cities = ['London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam'];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  private getNearestAsianCity(): string {
    const cities = ['Tokyo', 'Seoul', 'Beijing', 'Shanghai', 'Bangkok', 'Singapore'];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  private getMockCitiesByRegion(lat: number, lng: number): string[] {
    if (lat >= 25 && lat <= 49 && lng >= -125 && lng <= -66) {
      return ['Los Angeles', 'San Francisco', 'San Diego', 'Las Vegas', 'Phoenix'];
    } else if (lat >= 35 && lat <= 71 && lng >= -10 && lng <= 40) {
      return ['Paris', 'London', 'Berlin', 'Rome', 'Barcelona'];
    } else if (lat >= -10 && lat <= 55 && lng >= 60 && lng <= 180) {
      return ['Tokyo', 'Kyoto', 'Osaka', 'Seoul', 'Bangkok'];
    }
    return ['Unknown City'];
  }
}

export default LocationService.getInstance();
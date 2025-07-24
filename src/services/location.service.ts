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
    } catch (error) {
      const locationError = this.handleGeolocationError(error as GeolocationPositionError);
      throw new LocationServiceError(locationError);
    }
  }

  /**
   * Request location permission
   */
  async requestPermission(): Promise<PermissionState> {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        return permission.state;
      }
      return 'granted'; // Assume granted if permissions API is not available
    } catch {
      return 'denied';
    }
  }

  /**
   * Start watching location changes
   */
  startWatching(callback: (location: LocationResult) => void, errorCallback?: (error: LocationError) => void): void {
    if (!this.isSupported() || this.watchId !== null) return;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
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

          callback(result);
        } catch (error) {
          if (errorCallback) {
            errorCallback({
              code: 0,
              message: 'Failed to process location update',
              type: 'POSITION_UNAVAILABLE'
            });
          }
        }
      },
      (error) => {
        const locationError = this.handleGeolocationError(error);
        if (errorCallback) {
          errorCallback(locationError);
        }
      },
      options
    );
  }

  /**
   * Stop watching location changes
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
      const cached = localStorage.getItem('lastKnownLocation');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.location && parsed.address) {
          this.lastKnownLocation = parsed;
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    return null;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get nearby cities (mock implementation)
   */
  async getNearbyCities(location: Location, radius: number = 50): Promise<string[]> {
    // Mock implementation - in a real app, this would call a geocoding service
    const mockCities = [
      '北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都', '西安', '重庆'
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return random cities within the radius
    const count = Math.min(Math.floor(Math.random() * 5) + 1, mockCities.length);
    const shuffled = mockCities.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Search places (mock implementation)
   */
  async searchPlaces(query: string, location?: Location, radius?: number): Promise<any[]> {
    // Mock implementation - in a real app, this would call a places API
    const mockPlaces = [
      { name: '星巴克咖啡', type: 'cafe', distance: '0.2km' },
      { name: '麦当劳', type: 'restaurant', distance: '0.5km' },
      { name: '中国银行', type: 'bank', distance: '0.8km' },
      { name: '地铁站', type: 'transport', distance: '1.2km' }
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Filter by query
    return mockPlaces.filter(place => 
      place.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Reverse geocoding (mock implementation)
   */
  private async reverseGeocode(location: Location): Promise<Address> {
    // Mock implementation - in a real app, this would call a geocoding service
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return this.getMockAddressFromCoordinates(location);
  }

  /**
   * Parse address components (mock implementation)
   */
  private parseGoogleAddressComponents(result: any): Address {
    // Mock implementation
    return {
      street: '示例街道',
      city: '北京',
      state: '北京市',
      country: '中国',
      countryCode: 'CN',
      postalCode: '100000'
    };
  }

  /**
   * Handle geolocation errors
   */
  private handleGeolocationError(error: GeolocationPositionError): LocationError {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return {
          code: error.code,
          message: 'Location permission denied',
          type: 'PERMISSION_DENIED'
        };
      case error.POSITION_UNAVAILABLE:
        return {
          code: error.code,
          message: 'Location information unavailable',
          type: 'POSITION_UNAVAILABLE'
        };
      case error.TIMEOUT:
        return {
          code: error.code,
          message: 'Location request timed out',
          type: 'TIMEOUT'
        };
      default:
        return {
          code: 0,
          message: 'Unknown location error',
          type: 'POSITION_UNAVAILABLE'
        };
    }
  }

  /**
   * Store location in cache
   */
  private storeLocationInCache(location: LocationResult): void {
    try {
      localStorage.setItem('lastKnownLocation', JSON.stringify(location));
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get mock address from coordinates
   */
  private getMockAddressFromCoordinates(location: Location): Address {
    // Simple mock implementation based on coordinates
    const lat = location.latitude;
    const lng = location.longitude;
    
    // Determine region based on coordinates
    if (lat > 35 && lat < 45 && lng > 110 && lng < 130) {
      return {
        city: '北京',
        state: '北京市',
        country: '中国',
        countryCode: 'CN',
        postalCode: '100000'
      };
    } else if (lat > 30 && lat < 35 && lng > 120 && lng < 130) {
      return {
        city: '上海',
        state: '上海市',
        country: '中国',
        countryCode: 'CN',
        postalCode: '200000'
      };
    } else if (lat > 22 && lat < 25 && lng > 113 && lng < 115) {
      return {
        city: '深圳',
        state: '广东省',
        country: '中国',
        countryCode: 'CN',
        postalCode: '518000'
      };
    } else {
      return {
        city: this.getNearestUSCity(),
        state: 'Unknown',
        country: '中国',
        countryCode: 'CN',
        postalCode: '000000'
      };
    }
  }

  /**
   * Get nearest US city (mock)
   */
  private getNearestUSCity(): string {
    return '北京';
  }

  /**
   * Get nearest European city (mock)
   */
  private getNearestEuropeanCity(): string {
    return '上海';
  }

  /**
   * Get nearest Asian city (mock)
   */
  private getNearestAsianCity(): string {
    return '广州';
  }

  /**
   * Get mock cities by region
   */
  private getMockCitiesByRegion(lat: number, lng: number): string[] {
    if (lat > 35 && lat < 45 && lng > 110 && lng < 130) {
      return ['北京', '天津', '石家庄', '太原', '呼和浩特'];
    } else if (lat > 30 && lat < 35 && lng > 120 && lng < 130) {
      return ['上海', '南京', '杭州', '苏州', '无锡'];
    } else if (lat > 22 && lat < 25 && lng > 113 && lng < 115) {
      return ['深圳', '广州', '东莞', '佛山', '珠海'];
    } else {
      return ['北京', '上海', '广州', '深圳', '杭州'];
    }
  }
}

export default LocationService.getInstance();
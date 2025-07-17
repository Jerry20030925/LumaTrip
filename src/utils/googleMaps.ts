import { Loader, type LoaderOptions } from '@googlemaps/js-api-loader';

// Google Maps API配置
export interface GoogleMapsConfig {
  apiKey: string;
  version?: string;
  libraries?: LoaderOptions['libraries'];
  language?: string;
  region?: string;
}

// 默认配置
const defaultConfig: Omit<GoogleMapsConfig, 'apiKey'> = {
  version: 'weekly',
  libraries: ['places', 'geometry'],
  language: 'en',
  region: 'US'
};

// Google Maps加载器实例
let loader: Loader | null = null;
let isLoaded = false;

/**
 * 初始化Google Maps API
 */
export const initializeGoogleMaps = (config: GoogleMapsConfig): Promise<typeof google> => {
  if (isLoaded && window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (!loader) {
    loader = new Loader({
      apiKey: config.apiKey,
      version: config.version || defaultConfig.version,
      libraries: config.libraries || defaultConfig.libraries,
      language: config.language || defaultConfig.language,
      region: config.region || defaultConfig.region
    });
  }

  return loader.load().then(() => {
    isLoaded = true;
    return window.google;
  });
};

/**
 * 检查Google Maps API是否已加载
 */
export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && window.google?.maps !== undefined;
};

/**
 * 获取Google Maps API密钥
 */
export const getGoogleMapsApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY environment variable.');
    return '';
  }
  return apiKey;
};

/**
 * 创建地图标记
 */
export const createMarker = (
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  options?: google.maps.MarkerOptions
): google.maps.Marker => {
  return new google.maps.Marker({
    position,
    map,
    ...options
  });
};

/**
 * 创建信息窗口
 */
export const createInfoWindow = (
  content: string | Element,
  options?: google.maps.InfoWindowOptions
): google.maps.InfoWindow => {
  return new google.maps.InfoWindow({
    content,
    ...options
  });
};

/**
 * 地理编码 - 地址转坐标
 */
export const geocode = async (address: string): Promise<google.maps.GeocoderResult[]> => {
  if (!isGoogleMapsLoaded()) {
    throw new Error('Google Maps API is not loaded');
  }

  const geocoder = new google.maps.Geocoder();
  
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results) {
        resolve(results);
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
};

/**
 * 反向地理编码 - 坐标转地址
 */
export const reverseGeocode = async (
  location: google.maps.LatLngLiteral
): Promise<google.maps.GeocoderResult[]> => {
  if (!isGoogleMapsLoaded()) {
    throw new Error('Google Maps API is not loaded');
  }

  const geocoder = new google.maps.Geocoder();
  
  return new Promise((resolve, reject) => {
    geocoder.geocode({ location }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results) {
        resolve(results);
      } else {
        reject(new Error(`Reverse geocoding failed: ${status}`));
      }
    });
  });
};

/**
 * 搜索附近的地点
 */
export const searchNearbyPlaces = async (
  location: google.maps.LatLngLiteral,
  radius: number,
  type?: string
): Promise<google.maps.places.PlaceResult[]> => {
  if (!isGoogleMapsLoaded()) {
    throw new Error('Google Maps API is not loaded');
  }

  const service = new google.maps.places.PlacesService(
    document.createElement('div')
  );

  const request: google.maps.places.PlaceSearchRequest = {
    location,
    radius,
    type: type as any
  };

  return new Promise((resolve, reject) => {
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results);
      } else {
        reject(new Error(`Places search failed: ${status}`));
      }
    });
  });
};

/**
 * 获取地点详情
 */
export const getPlaceDetails = async (
  placeId: string,
  fields?: string[]
): Promise<google.maps.places.PlaceResult> => {
  if (!isGoogleMapsLoaded()) {
    throw new Error('Google Maps API is not loaded');
  }

  const service = new google.maps.places.PlacesService(
    document.createElement('div')
  );

  const request: google.maps.places.PlaceDetailsRequest = {
    placeId,
    fields: fields || ['name', 'formatted_address', 'geometry', 'rating', 'photos']
  };

  return new Promise((resolve, reject) => {
    service.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        resolve(place);
      } else {
        reject(new Error(`Place details failed: ${status}`));
      }
    });
  });
};

/**
 * 计算两点间距离
 */
export const calculateDistance = (
  from: google.maps.LatLngLiteral,
  to: google.maps.LatLngLiteral
): number => {
  if (!isGoogleMapsLoaded()) {
    throw new Error('Google Maps API is not loaded');
  }

  const fromLatLng = new google.maps.LatLng(from.lat, from.lng);
  const toLatLng = new google.maps.LatLng(to.lat, to.lng);
  
  return google.maps.geometry.spherical.computeDistanceBetween(fromLatLng, toLatLng);
};

/**
 * 导出地图样式配置
 */
export const mapStyles = {
  // 标准样式
  standard: [],
  
  // 简洁样式
  minimal: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ],
  
  // 暗色主题
  dark: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
  ]
}; 
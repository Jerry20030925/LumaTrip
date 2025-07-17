import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { 
  initializeGoogleMaps, 
  getGoogleMapsApiKey, 
  createMarker, 
  createInfoWindow,
  mapStyles,
  type GoogleMapsConfig 
} from '../../utils/googleMaps';

export interface MapMarker {
  id: string;
  position: google.maps.LatLngLiteral;
  title?: string;
  content?: string | React.ReactNode;
  icon?: string | google.maps.Icon | google.maps.Symbol;
  draggable?: boolean;
  onClick?: (marker: google.maps.Marker) => void;
}

export interface GoogleMapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  markers?: MapMarker[];
  style?: React.CSSProperties;
  className?: string;
  mapStyle?: 'standard' | 'minimal' | 'dark' | google.maps.MapTypeStyle[];
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  onMapLoad?: (map: google.maps.Map) => void;
  showUserLocation?: boolean;
  gestureHandling?: 'cooperative' | 'greedy' | 'none' | 'auto';
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: 39.8283, lng: -98.5795 }, // 美国中心点
  zoom = 10,
  markers = [],
  style = { width: '100%', height: '400px' },
  className = '',
  mapStyle = 'standard',
  onMapClick,
  onMapLoad,
  showUserLocation = false,
  gestureHandling = 'auto',
  disableDefaultUI = false,
  zoomControl = true,
  streetViewControl = false,
  fullscreenControl = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化地图
  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      const apiKey = getGoogleMapsApiKey();
      if (!apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const config: GoogleMapsConfig = {
        apiKey,
        libraries: ['places', 'geometry']
      };

      await initializeGoogleMaps(config);

      // 获取地图样式
      let styles: google.maps.MapTypeStyle[] = [];
      if (typeof mapStyle === 'string') {
        styles = mapStyles[mapStyle] || [];
      } else {
        styles = mapStyle;
      }

      // 创建地图实例
      const mapInstance = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles,
        gestureHandling,
        disableDefaultUI,
        zoomControl,
        streetViewControl,
        fullscreenControl,
        mapTypeControl: !disableDefaultUI
      });

      mapInstanceRef.current = mapInstance;

      // 添加点击事件监听
      if (onMapClick) {
        mapInstance.addListener('click', onMapClick);
      }

      // 调用加载回调
      if (onMapLoad) {
        onMapLoad(mapInstance);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize Google Maps:', err);
      setError(err instanceof Error ? err.message : 'Failed to load map');
      setIsLoading(false);
    }
  }, [
    center,
    zoom,
    mapStyle,
    onMapClick,
    onMapLoad,
    gestureHandling,
    disableDefaultUI,
    zoomControl,
    streetViewControl,
    fullscreenControl
  ]);

  // 清除现有标记
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];
  }, []);

  // 添加标记
  const addMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return;

    clearMarkers();

    markers.forEach(markerData => {
      const marker = createMarker(
        mapInstanceRef.current!,
        markerData.position,
        {
          title: markerData.title,
          icon: markerData.icon,
          draggable: markerData.draggable || false
        }
      );

      // 添加点击事件
      if (markerData.content || markerData.onClick) {
        marker.addListener('click', () => {
          if (markerData.onClick) {
            markerData.onClick(marker);
          }

          if (markerData.content) {
            // 关闭之前的信息窗口
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
            }

            // 创建新的信息窗口
            const content = typeof markerData.content === 'string' 
              ? markerData.content 
              : document.createElement('div');
            
            infoWindowRef.current = createInfoWindow(content);
            infoWindowRef.current.open(mapInstanceRef.current!, marker);
          }
        });
      }

      markersRef.current.push(marker);
    });
  }, [markers, clearMarkers]);

  // 获取用户位置
  const getUserLocation = useCallback(() => {
    if (!showUserLocation) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // 在地图上添加用户位置标记
          if (mapInstanceRef.current) {
            createMarker(mapInstanceRef.current, userPos, {
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#4285F4"/>
                    <circle cx="12" cy="12" r="4" fill="white"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(24, 24),
                anchor: new google.maps.Point(12, 12)
              },
              title: 'Your Location'
            });
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }
  }, [showUserLocation]);

  // 初始化地图
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // 添加标记
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      addMarkers();
    }
  }, [addMarkers, isLoading]);

  // 获取用户位置
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      getUserLocation();
    }
  }, [getUserLocation, isLoading]);

  // 清理函数
  useEffect(() => {
    return () => {
      clearMarkers();
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [clearMarkers]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
        style={style}
      >
        <div className="text-center text-gray-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-sm font-medium">地图加载失败</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-lg">
          <div className="text-center text-gray-600">
            <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-blue-500" />
            <p className="text-sm">正在加载地图...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '200px' }}
      />
      
      {markers.length > 0 && (
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
          <MapPin className="w-3 h-3 inline mr-1" />
          {markers.length} 个地点
        </div>
      )}
    </div>
  );
};

export default GoogleMap; 
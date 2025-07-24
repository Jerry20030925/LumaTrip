import React, { useEffect, useRef, useState } from 'react';
import { Alert, Text, Paper, Button, Group, LoadingOverlay } from '@mantine/core';
import { AlertCircle, Plus, Minus, Navigation, RotateCw } from 'lucide-react';

// 声明全局MapKit类型
declare global {
  interface Window {
    mapkit: any;
  }
}

interface AppleMapProps {
  center?: { latitude: number; longitude: number };
  zoom?: number;
  style?: React.CSSProperties;
  onMapLoad?: () => void;
  onMapError?: (error: string) => void;
}

const AppleMap: React.FC<AppleMapProps> = ({
  center = { latitude: 39.9042, longitude: 116.4074 }, // 北京
  style = { width: '100%', height: '500px' },
  onMapLoad,
  onMapError
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapKitLoaded, setIsMapKitLoaded] = useState(false);

  // 加载MapKit JS脚本
  useEffect(() => {
    const token = import.meta.env.VITE_APPLE_MAPS_TOKEN;
    
    if (!token) {
      const errorMsg = '苹果地图Token未配置，请检查环境变量 VITE_APPLE_MAPS_TOKEN';
      setError(errorMsg);
      onMapError?.(errorMsg);
      setIsLoading(false);
      return;
    }

    // 检查MapKit是否已经加载
    if (window.mapkit && window.mapkit.init) {
      initializeMapKit(token);
      return;
    }

    // 加载MapKit JS脚本
    const script = document.createElement('script');
    script.src = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      console.log('MapKit JS script loaded');
      initializeMapKit(token);
    };
    script.onerror = () => {
      const errorMsg = '无法加载MapKit JS脚本';
      setError(errorMsg);
      onMapError?.(errorMsg);
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // 清理脚本
      const existingScript = document.querySelector('script[src*="mapkit.js"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  const initializeMapKit = (token: string) => {
    try {
      // 初始化MapKit
      window.mapkit.init({
        authorizationCallback: (done: (token: string) => void) => {
          console.log('MapKit requesting authorization with token');
          done(token);
        },
        language: 'zh-CN'
      });

      setIsMapKitLoaded(true);
      console.log('MapKit initialized successfully');
    } catch (err) {
      console.error('MapKit initialization error:', err);
      const errorMsg = `MapKit初始化失败: ${err}`;
      setError(errorMsg);
      onMapError?.(errorMsg);
      setIsLoading(false);
    }
  };

  // 创建地图实例
  useEffect(() => {
    if (!isMapKitLoaded || !mapRef.current || error) {
      return;
    }

    try {
      // 创建地图
      const map = new window.mapkit.Map(mapRef.current, {
        visibleMapRect: window.mapkit.CoordinateRegion.fromCenterAndSize(
          new window.mapkit.Coordinate(center.latitude, center.longitude),
          new window.mapkit.CoordinateSpan(0.1, 0.1)
        ),
        mapType: window.mapkit.Map.MapTypes.Standard,
        showsMapTypeControl: false,
        showsZoomControl: false,
        showsUserLocationControl: false,
        showsCompass: window.mapkit.FeatureVisibility.Hidden
      });

      // 添加地图事件监听器
      map.addEventListener('map-load', () => {
        console.log('Apple Map loaded successfully');
        setIsLoading(false);
        onMapLoad?.();
      });

      map.addEventListener('error', (event: any) => {
        console.error('Apple Map error:', event);
        const errorMsg = `地图加载错误: ${event.message || '未知错误'}`;
        setError(errorMsg);
        onMapError?.(errorMsg);
        setIsLoading(false);
      });

      // 添加一个标记到中心位置
      const annotation = new window.mapkit.MarkerAnnotation(
        new window.mapkit.Coordinate(center.latitude, center.longitude),
        {
          title: '当前位置',
          subtitle: `${center.latitude.toFixed(4)}, ${center.longitude.toFixed(4)}`,
          color: '#007AFF'
        }
      );

      map.addAnnotation(annotation);
      mapInstanceRef.current = map;

      console.log('Apple Map instance created successfully');

    } catch (err) {
      console.error('Map creation error:', err);
      const errorMsg = `地图创建失败: ${err}`;
      setError(errorMsg);
      onMapError?.(errorMsg);
      setIsLoading(false);
    }
  }, [isMapKitLoaded, center, error]);

  // 地图控制函数
  const zoomIn = () => {
    if (mapInstanceRef.current) {
      const currentRegion = mapInstanceRef.current.visibleMapRect;
      const newSpan = new window.mapkit.CoordinateSpan(
        currentRegion.span.latitudeDelta * 0.5,
        currentRegion.span.longitudeDelta * 0.5
      );
      const newRegion = new window.mapkit.CoordinateRegion(currentRegion.center, newSpan);
      mapInstanceRef.current.setVisibleMapRectAnimated(newRegion, true);
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      const currentRegion = mapInstanceRef.current.visibleMapRect;
      const newSpan = new window.mapkit.CoordinateSpan(
        currentRegion.span.latitudeDelta * 2,
        currentRegion.span.longitudeDelta * 2
      );
      const newRegion = new window.mapkit.CoordinateRegion(currentRegion.center, newSpan);
      mapInstanceRef.current.setVisibleMapRectAnimated(newRegion, true);
    }
  };

  const centerOnLocation = () => {
    if (mapInstanceRef.current) {
      const newRegion = window.mapkit.CoordinateRegion.fromCenterAndSize(
        new window.mapkit.Coordinate(center.latitude, center.longitude),
        new window.mapkit.CoordinateSpan(0.1, 0.1)
      );
      mapInstanceRef.current.setVisibleMapRectAnimated(newRegion, true);
    }
  };

  const refreshMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current._refreshMapView();
    }
  };

  if (error) {
    return (
      <Paper p="lg" style={style}>
        <Alert icon={<AlertCircle size={16} />} color="red" title="苹果地图错误">
          <Text size="sm" mb="md">{error}</Text>
          <Button 
            size="sm"
            onClick={() => {
              setError(null);
              setIsLoading(true);
              window.location.reload(); // 重新加载页面来重试
            }}
          >
            重新加载页面
          </Button>
        </Alert>
      </Paper>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapRef}
        style={{
          ...style,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}
      />
      
      {/* 加载状态 */}
      <LoadingOverlay 
        visible={isLoading} 
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ 
          size: 'lg', 
          type: 'dots',
          children: (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Text size="sm" c="dimmed">正在加载苹果地图...</Text>
            </div>
          )
        }}
      />

      {/* 地图控制按钮 */}
      {!isLoading && !error && (
        <div style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px',
          zIndex: 1000
        }}>
          <Group gap="xs">
            <Button
              size="sm"
              variant="white"
              onClick={zoomIn}
              style={{ minWidth: 'auto', padding: '8px' }}
            >
              <Plus size={16} />
            </Button>
            <Button
              size="sm"
              variant="white"
              onClick={zoomOut}
              style={{ minWidth: 'auto', padding: '8px' }}
            >
              <Minus size={16} />
            </Button>
            <Button
              size="sm"
              variant="white"
              onClick={centerOnLocation}
              style={{ minWidth: 'auto', padding: '8px' }}
            >
              <Navigation size={16} />
            </Button>
            <Button
              size="sm"
              variant="white"
              onClick={refreshMap}
              style={{ minWidth: 'auto', padding: '8px' }}
            >
              <RotateCw size={16} />
            </Button>
          </Group>
        </div>
      )}

      {/* 地图信息显示 */}
      {!isLoading && !error && (
        <Paper 
          p="sm" 
          style={{ 
            position: 'absolute', 
            bottom: '12px', 
            left: '12px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            zIndex: 1000
          }}
        >
          <Text size="xs" c="dimmed">
            🍎 苹果地图 | 位置: {center.latitude.toFixed(4)}, {center.longitude.toFixed(4)}
          </Text>
        </Paper>
      )}
    </div>
  );
};

export default AppleMap;
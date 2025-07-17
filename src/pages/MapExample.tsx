import React, { useState } from 'react';
import { MapPin, Navigation, Search, Plus, Minus } from 'lucide-react';
import GoogleMap, { type MapMarker } from '../components/maps/GoogleMap';
import PlaceSearch, { type PlaceSearchResult } from '../components/maps/PlaceSearch';
import { useLocation } from '../hooks/useLocation';

interface SavedPlace extends PlaceSearchResult {
  id: string;
  note?: string;
  dateAdded: Date;
}

const MapExample: React.FC = () => {
  const { location: userLocation, getCurrentLocation, loading: locationLoading } = useLocation();
  
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({
    lat: 39.8283,
    lng: -98.5795 // 美国中心点
  });
  const [mapZoom, setMapZoom] = useState(10);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [mapStyle, setMapStyle] = useState<'standard' | 'minimal' | 'dark'>('standard');
  const [showUserLocation, setShowUserLocation] = useState(true);

  // 处理地点搜索选择
  const handlePlaceSelect = (place: PlaceSearchResult) => {
    setSelectedPlace(place);
    
    // 更新地图中心和缩放
    setMapCenter(place.location);
    setMapZoom(15);
    
    // 添加标记
    const newMarker: MapMarker = {
      id: place.placeId,
      position: place.location,
      title: place.name,
      content: `
        <div class="p-3">
          <h3 class="font-bold text-lg">${place.name}</h3>
          <p class="text-gray-600 text-sm">${place.address}</p>
          ${place.rating ? `<p class="text-sm mt-1">⭐ ${place.rating.toFixed(1)}</p>` : ''}
        </div>
      `
    };
    
    setMarkers([newMarker]);
  };

  // 保存地点
  const savePlace = () => {
    if (!selectedPlace) return;
    
    const savedPlace: SavedPlace = {
      ...selectedPlace,
      id: Date.now().toString(),
      dateAdded: new Date()
    };
    
    setSavedPlaces(prev => [savedPlace, ...prev]);
  };

  // 删除保存的地点
  const removeSavedPlace = (id: string) => {
    setSavedPlaces(prev => prev.filter(place => place.id !== id));
  };

  // 前往保存的地点
  const goToSavedPlace = (place: SavedPlace) => {
    setMapCenter(place.location);
    setMapZoom(15);
    setSelectedPlace(place);
    
    const marker: MapMarker = {
      id: place.id,
      position: place.location,
      title: place.name,
      content: `
        <div class="p-3">
          <h3 class="font-bold text-lg">${place.name}</h3>
          <p class="text-gray-600 text-sm">${place.address}</p>
          <p class="text-xs text-gray-500 mt-1">保存于: ${place.dateAdded.toLocaleDateString('zh-CN')}</p>
        </div>
      `
    };
    
    setMarkers([marker]);
  };

  // 使用当前位置
  const useCurrentLocation = async () => {
    if (userLocation) {
      setMapCenter({
        lat: userLocation.location.latitude,
        lng: userLocation.location.longitude
      });
      setMapZoom(15);
    } else {
      await getCurrentLocation();
    }
  };

  // 地图点击处理
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const position = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      
      const marker: MapMarker = {
        id: Date.now().toString(),
        position,
        title: '自定义标记',
        content: `
          <div class="p-3">
            <h3 class="font-bold">自定义标记</h3>
            <p class="text-sm text-gray-600">纬度: ${position.lat.toFixed(6)}</p>
            <p class="text-sm text-gray-600">经度: ${position.lng.toFixed(6)}</p>
          </div>
        `,
        draggable: true
      };
      
      setMarkers([marker]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-blue-600" />
              地图功能演示
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* 地图样式选择 */}
              <select
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="standard">标准样式</option>
                <option value="minimal">简洁样式</option>
                <option value="dark">暗色主题</option>
              </select>
              
              {/* 显示用户位置切换 */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showUserLocation}
                  onChange={(e) => setShowUserLocation(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">显示我的位置</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧控制面板 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 地点搜索 */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Search className="w-4 h-4 mr-2" />
                搜索地点
              </h3>
              
              <PlaceSearch
                onPlaceSelect={handlePlaceSelect}
                placeholder="搜索餐厅、景点、地址..."
                className="mb-3"
              />
              
              {selectedPlace && (
                <button
                  onClick={savePlace}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  保存此地点
                </button>
              )}
            </div>

            {/* 位置控制 */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Navigation className="w-4 h-4 mr-2" />
                位置控制
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={useCurrentLocation}
                  disabled={locationLoading}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                >
                  {locationLoading ? '定位中...' : '使用当前位置'}
                </button>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMapZoom(Math.max(1, mapZoom - 1))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4 mx-auto" />
                  </button>
                  <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                    {mapZoom}x
                  </span>
                  <button
                    onClick={() => setMapZoom(Math.min(20, mapZoom + 1))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
              
              {userLocation && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  <p className="text-gray-600">当前位置:</p>
                  <p className="font-medium">{userLocation.address.city}, {userLocation.address.country}</p>
                </div>
              )}
            </div>

            {/* 保存的地点 */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-medium text-gray-900 mb-3">保存的地点</h3>
              
              {savedPlaces.length === 0 ? (
                <p className="text-gray-500 text-sm">暂无保存的地点</p>
              ) : (
                <div className="space-y-2">
                  {savedPlaces.map(place => (
                    <div
                      key={place.id}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => goToSavedPlace(place)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{place.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{place.address}</p>
                          {place.rating && (
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-yellow-600">⭐ {place.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSavedPlace(place.id);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs ml-2"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧地图 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-gray-900">交互式地图</h3>
                <p className="text-sm text-gray-500">点击地图添加标记，搜索地点进行探索</p>
              </div>
              
              <GoogleMap
                center={mapCenter}
                zoom={mapZoom}
                markers={markers}
                style={{ height: '600px' }}
                mapStyle={mapStyle}
                onMapClick={handleMapClick}
                showUserLocation={showUserLocation}
                className="rounded-lg overflow-hidden"
              />
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">使用说明</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• 在搜索框中输入地点名称，系统将自动提供建议</p>
            <p>• 点击地图任意位置可添加自定义标记</p>
            <p>• 使用"保存此地点"功能收藏您感兴趣的地方</p>
            <p>• 切换地图样式以获得不同的视觉效果</p>
            <p>• 点击"使用当前位置"快速定位到您的位置</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapExample; 
import React, { useState } from 'react';
import { MapPin, Navigation, Search, Plus, Minus, Bookmark, Clock, Star, Users, Filter, MoreVertical, Layers } from 'lucide-react';
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
  const [showSidebar, setShowSidebar] = useState(true);

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
        <div class="p-4 max-w-sm">
          <h3 class="font-bold text-lg text-gray-900 mb-2">${place.name}</h3>
          <p class="text-gray-600 text-sm mb-2">${place.address}</p>
          ${place.rating ? `<div class="flex items-center mb-2"><span class="text-yellow-500">⭐</span><span class="ml-1 text-sm font-medium">${place.rating.toFixed(1)}</span></div>` : ''}
          <button class="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors">
            查看详情
          </button>
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
        <div class="p-4 max-w-sm">
          <h3 class="font-bold text-lg text-gray-900 mb-2">${place.name}</h3>
          <p class="text-gray-600 text-sm mb-2">${place.address}</p>
          <p class="text-xs text-gray-500 mb-2">保存于: ${place.dateAdded.toLocaleDateString('zh-CN')}</p>
          <button class="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors">
            已保存的地点
          </button>
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
          <div class="p-4 max-w-sm">
            <h3 class="font-bold text-gray-900 mb-2">自定义标记</h3>
            <p class="text-sm text-gray-600 mb-1">纬度: ${position.lat.toFixed(6)}</p>
            <p class="text-sm text-gray-600 mb-3">经度: ${position.lng.toFixed(6)}</p>
            <button class="w-full bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm transition-colors">
              添加备注
            </button>
          </div>
        `,
        draggable: true
      };
      
      setMarkers([marker]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 现代化顶部导航 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">智能地图</h1>
                  <p className="text-sm text-gray-500">探索世界，发现精彩</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 地图样式选择器 */}
              <div className="relative">
                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value as any)}
                  className="appearance-none bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">🗺️ 标准</option>
                  <option value="minimal">✨ 简洁</option>
                  <option value="dark">🌙 暗色</option>
                </select>
                <Layers className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              {/* 侧边栏切换 */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white/80 transition-all duration-200"
              >
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className={`grid gap-6 transition-all duration-300 ${showSidebar ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {/* 左侧控制面板 */}
          {showSidebar && (
            <div className="lg:col-span-1 space-y-6">
              {/* 搜索卡片 */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Search className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">搜索地点</h3>
                </div>
                
                <PlaceSearch
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="搜索餐厅、景点、地址..."
                  className="mb-4"
                />
                
                {selectedPlace && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{selectedPlace.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{selectedPlace.address}</p>
                        {selectedPlace.rating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="ml-1 text-sm font-medium text-gray-700">{selectedPlace.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={savePlace}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg py-2 px-4 text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                    >
                      <Bookmark className="w-4 h-4 inline mr-2" />
                      保存此地点
                    </button>
                  </div>
                )}
              </div>

              {/* 位置控制卡片 */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">位置控制</h3>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={useCurrentLocation}
                    disabled={locationLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg py-3 px-4 font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {locationLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        定位中...
                      </div>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 inline mr-2" />
                        使用当前位置
                      </>
                    )}
                  </button>
                  
                  {/* 缩放控制 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">地图缩放</span>
                      <span className="text-sm text-gray-500">{mapZoom}x</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setMapZoom(Math.max(1, mapZoom - 1))}
                        className="w-10 h-10 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-200"
                          style={{ width: `${(mapZoom / 20) * 100}%` }}
                        ></div>
                      </div>
                      <button
                        onClick={() => setMapZoom(Math.min(20, mapZoom + 1))}
                        className="w-10 h-10 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  {/* 显示用户位置切换 */}
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">显示我的位置</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showUserLocation}
                        onChange={(e) => setShowUserLocation(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${showUserLocation ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform transform ${showUserLocation ? 'translate-x-6' : 'translate-x-1'} mt-1`}></div>
                      </div>
                    </div>
                  </label>
                </div>
                
                {userLocation && (
                  <div className="mt-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">当前位置</span>
                    </div>
                    <p className="text-sm text-gray-600">{userLocation.address.city}, {userLocation.address.country}</p>
                  </div>
                )}
              </div>

              {/* 保存的地点 */}
              {savedPlaces.length > 0 && (
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bookmark className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">保存的地点</h3>
                    <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full font-medium">
                      {savedPlaces.length}
                    </span>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {savedPlaces.map((place) => (
                      <div key={place.id} className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 cursor-pointer" onClick={() => goToSavedPlace(place)}>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">{place.name}</h4>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-1">{place.address}</p>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {place.dateAdded.toLocaleDateString('zh-CN')}
                              </div>
                              {place.rating && (
                                <div className="flex items-center">
                                  <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                                  {place.rating.toFixed(1)}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeSavedPlace(place.id)}
                            className="p-1 hover:bg-red-100 rounded-lg transition-colors group"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 右侧地图区域 */}
          <div className={`${showSidebar ? 'lg:col-span-3' : 'col-span-1'}`}>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">交互式地图</h3>
                    <p className="text-sm text-gray-500">点击地图添加标记，搜索地点进行探索</p>
                  </div>
                </div>
                
                {markers.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{markers.length} 个地点</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="rounded-xl overflow-hidden">
                <GoogleMap
                  center={mapCenter}
                  zoom={mapZoom}
                  markers={markers}
                  style={{ height: '70vh', minHeight: '500px' }}
                  mapStyle={mapStyle}
                  mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID} // 使用环境变量中的地图ID
                  onMapClick={handleMapClick}
                  showUserLocation={showUserLocation}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 底部使用说明 */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🌟 使用指南</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="space-y-2">
                  <p className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>在搜索框中输入地点名称，系统将自动提供建议</p>
                  <p className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>点击地图任意位置可添加自定义标记</p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>使用"保存此地点"功能收藏您感兴趣的地方</p>
                  <p className="flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>切换地图样式以获得不同的视觉效果</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapExample; 
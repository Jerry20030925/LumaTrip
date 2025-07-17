import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Search, MapPin, Star, Clock, Phone, ExternalLink, Loader2 } from 'lucide-react';
import { 
  initializeGoogleMaps, 
  getGoogleMapsApiKey, 
  getPlaceDetails,
  type GoogleMapsConfig 
} from '../../utils/googleMaps';

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  address: string;
  location: google.maps.LatLngLiteral;
  rating?: number;
  priceLevel?: number;
  photoUrl?: string;
  types: string[];
  isOpen?: boolean;
  phoneNumber?: string;
  website?: string;
}

export interface PlaceSearchProps {
  onPlaceSelect?: (place: PlaceSearchResult) => void;
  onLocationSelect?: (location: google.maps.LatLngLiteral) => void;
  placeholder?: string;
  className?: string;
  showResults?: boolean;
  types?: string[];
  bounds?: google.maps.LatLngBounds;
  fields?: string[];
}

const PlaceSearch: React.FC<PlaceSearchProps> = ({
  onPlaceSelect,
  onLocationSelect,
  placeholder = "搜索地点...",
  className = "",
  showResults = true,
  types,
  bounds,
  fields = ['name', 'formatted_address', 'geometry', 'rating', 'price_level', 'photos', 'types', 'opening_hours', 'formatted_phone_number', 'website']
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化Google Places Autocomplete
  const initializeAutocomplete = useCallback(async () => {
    if (!inputRef.current || isInitialized) return;

    try {
      const apiKey = getGoogleMapsApiKey();
      if (!apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const config: GoogleMapsConfig = {
        apiKey,
        libraries: ['places']
      };

      await initializeGoogleMaps(config);

      // 创建自动完成实例
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: types || ['establishment'],
        fields: fields
      });

      // 设置搜索边界（如果提供）
      if (bounds) {
        autocomplete.setBounds(bounds);
      }

      autocompleteRef.current = autocomplete;

      // 监听地点选择事件
      autocomplete.addListener('place_changed', async () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry?.location) {
          setError('未找到该地点的位置信息');
          return;
        }

        setIsLoading(true);
        setError(null);

        try {
          // 如果有place_id，获取详细信息
          let placeDetails = place;
          if (place.place_id) {
            placeDetails = await getPlaceDetails(place.place_id, fields);
          }

          const location = {
            lat: placeDetails.geometry!.location!.lat(),
            lng: placeDetails.geometry!.location!.lng()
          };

          const result: PlaceSearchResult = {
            placeId: placeDetails.place_id || '',
            name: placeDetails.name || '',
            address: placeDetails.formatted_address || '',
            location,
            rating: placeDetails.rating,
            priceLevel: placeDetails.price_level,
            types: placeDetails.types || [],
            isOpen: placeDetails.opening_hours?.isOpen?.(),
            phoneNumber: placeDetails.formatted_phone_number,
            website: placeDetails.website,
            photoUrl: placeDetails.photos?.[0]?.getUrl({ maxWidth: 400, maxHeight: 300 })
          };

          setSelectedPlace(result);
          
          // 调用回调函数
          if (onPlaceSelect) {
            onPlaceSelect(result);
          }
          if (onLocationSelect) {
            onLocationSelect(location);
          }

        } catch (err) {
          console.error('Error getting place details:', err);
          setError('获取地点详情失败');
        } finally {
          setIsLoading(false);
        }
      });

      setIsInitialized(true);
    } catch (err) {
      console.error('Error initializing Places Autocomplete:', err);
      setError('地点搜索功能初始化失败');
    }
  }, [onPlaceSelect, onLocationSelect, types, bounds, fields, isInitialized]);

  useEffect(() => {
    initializeAutocomplete();
  }, [initializeAutocomplete]);

  // 清除选择
  const clearSelection = () => {
    setSelectedPlace(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // 获取价格级别文本
  const getPriceLevelText = (priceLevel?: number): string => {
    switch (priceLevel) {
      case 1: return '$';
      case 2: return '$$';
      case 3: return '$$$';
      case 4: return '$$$$';
      default: return '';
    }
  };

  // 格式化评分
  const formatRating = (rating?: number): string => {
    return rating ? rating.toFixed(1) : '';
  };

  return (
    <div className={`place-search ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          disabled={isLoading}
        />

        {selectedPlace && (
          <button
            onClick={clearSelection}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* 选中的地点信息 */}
      {selectedPlace && showResults && (
        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-start space-x-3">
            {/* 地点图片 */}
            {selectedPlace.photoUrl && (
              <img
                src={selectedPlace.photoUrl}
                alt={selectedPlace.name}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
            )}

            {/* 地点信息 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {selectedPlace.name}
              </h3>
              
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="truncate">{selectedPlace.address}</span>
              </div>

              {/* 评分和价格 */}
              <div className="flex items-center mt-2 space-x-4">
                {selectedPlace.rating && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                    <span>{formatRating(selectedPlace.rating)}</span>
                  </div>
                )}

                {selectedPlace.priceLevel && (
                  <div className="text-sm text-gray-600">
                    {getPriceLevelText(selectedPlace.priceLevel)}
                  </div>
                )}

                {selectedPlace.isOpen !== undefined && (
                  <div className={`text-sm ${selectedPlace.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {selectedPlace.isOpen ? '营业中' : '已关闭'}
                  </div>
                )}
              </div>

              {/* 联系信息 */}
              <div className="flex items-center mt-2 space-x-4">
                {selectedPlace.phoneNumber && (
                  <a
                    href={`tel:${selectedPlace.phoneNumber}`}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    电话
                  </a>
                )}

                {selectedPlace.website && (
                  <a
                    href={selectedPlace.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    网站
                  </a>
                )}
              </div>

              {/* 地点类型 */}
              {selectedPlace.types.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {selectedPlace.types.slice(0, 3).map((type, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {type.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceSearch; 
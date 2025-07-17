import React, { useState, useEffect } from 'react';
import { MapPin, Shield, Settings, Globe, Eye, EyeOff, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUserLocation, updateProfile } from '../../services/profile.service';
import LocationService from '../../services/location.service';
import type { UserLocation } from '../../types/profile';

interface LocationSettingsProps {
  className?: string;
}

const LocationSettings: React.FC<LocationSettingsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Location preferences state
  const [shareLocation, setShareLocation] = useState(true);
  const [allowLocationBasedRecommendations, setAllowLocationBasedRecommendations] = useState(true);
  const [locationAccuracy, setLocationAccuracy] = useState<'city' | 'precise'>('city');
  
  // Permission state
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');

  useEffect(() => {
    if (user?.id) {
      loadUserLocation();
      checkLocationPermission();
    }
  }, [user?.id]);

  const loadUserLocation = async () => {
    if (!user?.id) return;

    try {
      const location = await getUserLocation(user.id);
      setUserLocation(location);
      
      if (location) {
        // Load existing preferences
        // These would normally come from the user profile
        setShareLocation(true);
        setAllowLocationBasedRecommendations(true);
        setLocationAccuracy('city');
      }
    } catch (err) {
      console.error('Error loading user location:', err);
      setError('无法加载位置信息');
    }
  };

  const checkLocationPermission = async () => {
    try {
      const permission = await LocationService.requestPermission();
      setPermissionState(permission);
    } catch (err) {
      console.error('Error checking location permission:', err);
    }
  };

  const handleUpdateLocationPreferences = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const success = await updateProfile(user.id, {
        locationPreferences: {
          shareLocation,
          allowLocationBasedRecommendations,
          locationAccuracy
        }
      });

      if (success) {
        setSuccess('位置设置已保存');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('保存设置失败');
      }
    } catch (err) {
      console.error('Error updating location preferences:', err);
      setError('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshLocation = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const locationResult = await LocationService.getCurrentLocation();
      
      // Update user profile with new location
      const { updateUserLocation } = await import('../../services/profile.service');
      await updateUserLocation(user.id, locationResult);
      
      // Reload user location
      await loadUserLocation();
      setSuccess('位置已更新');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error refreshing location:', err);
      setError('更新位置失败，请检查位置权限');
    } finally {
      setLoading(false);
    }
  };

  const handleClearLocation = async () => {
    if (!user?.id) return;

    if (!confirm('确定要清除位置数据吗？这将影响个性化推荐功能。')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await updateProfile(user.id, {
        location: undefined,
        detailedLocation: undefined
      });

      if (success) {
        setUserLocation(null);
        setSuccess('位置数据已清除');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('清除位置数据失败');
      }
    } catch (err) {
      console.error('Error clearing location:', err);
      setError('清除位置数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionStatusText = (status: PermissionState) => {
    switch (status) {
      case 'granted':
        return '已授权';
      case 'denied':
        return '已拒绝';
      case 'prompt':
        return '未设置';
      default:
        return '未知';
    }
  };

  const getPermissionStatusColor = (status: PermissionState) => {
    switch (status) {
      case 'granted':
        return 'text-green-600 bg-green-50';
      case 'denied':
        return 'text-red-600 bg-red-50';
      case 'prompt':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MapPin className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">位置设置</h2>
          <p className="text-sm text-gray-600">管理您的位置权限和隐私设置</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Current Location Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">当前位置</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshLocation}
              disabled={loading}
              className="p-1 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              title="刷新位置"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleClearLocation}
              disabled={loading}
              className="p-1 text-red-600 hover:text-red-800 disabled:text-gray-400"
              title="清除位置"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {userLocation ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {userLocation.city}, {userLocation.country}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              最后更新: {new Date(userLocation.lastUpdated).toLocaleString('zh-CN')}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            暂无位置信息
          </div>
        )}
      </div>

      {/* Permission Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">浏览器权限状态</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">位置访问权限</span>
          <span className={`px-2 py-1 text-xs rounded-full ${getPermissionStatusColor(permissionState)}`}>
            {getPermissionStatusText(permissionState)}
          </span>
        </div>
        {permissionState === 'denied' && (
          <div className="mt-2 text-xs text-red-600">
            位置权限被拒绝，请在浏览器设置中允许位置访问
          </div>
        )}
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">隐私设置</h3>
        </div>

        {/* Share Location */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {shareLocation ? (
                <Eye className="w-4 h-4 text-blue-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div>
              <div className="font-medium text-sm text-gray-900">分享位置</div>
              <div className="text-xs text-gray-600">允许其他用户看到您的位置</div>
            </div>
          </div>
          <button
            onClick={() => setShareLocation(!shareLocation)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              shareLocation ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                shareLocation ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Location-based Recommendations */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-sm text-gray-900">个性化推荐</div>
              <div className="text-xs text-gray-600">基于位置提供个性化内容推荐</div>
            </div>
          </div>
          <button
            onClick={() => setAllowLocationBasedRecommendations(!allowLocationBasedRecommendations)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              allowLocationBasedRecommendations ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                allowLocationBasedRecommendations ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Location Accuracy */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-sm text-gray-900">位置精度</div>
              <div className="text-xs text-gray-600">选择位置信息的精确程度</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLocationAccuracy('city')}
              className={`p-2 text-sm rounded-md border transition-colors ${
                locationAccuracy === 'city'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              城市级别
            </button>
            <button
              onClick={() => setLocationAccuracy('precise')}
              className={`p-2 text-sm rounded-md border transition-colors ${
                locationAccuracy === 'precise'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              精确位置
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleUpdateLocationPreferences}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '保存中...' : '保存设置'}
        </button>
      </div>
    </div>
  );
};

export default LocationSettings;
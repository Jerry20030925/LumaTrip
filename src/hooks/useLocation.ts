import { useState, useEffect, useCallback } from 'react';
import LocationService, { type LocationResult, type LocationError } from '../services/location.service';

interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

interface UseLocationReturn {
  location: LocationResult | null;
  loading: boolean;
  error: LocationError | null;
  getCurrentLocation: () => Promise<void>;
  requestPermission: () => Promise<PermissionState>;
  startWatching: () => void;
  stopWatching: () => void;
  clearError: () => void;
  isSupported: boolean;
}

export const useLocation = (options: UseLocationOptions = {}): UseLocationReturn => {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  const {
    watch = false
  } = options;

  // Check if geolocation is supported
  const isSupported = LocationService.isSupported();

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    if (!isSupported) {
      setError({
        code: 0,
        message: 'Geolocation is not supported',
        type: 'NOT_SUPPORTED'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await LocationService.getCurrentLocation();
      setLocation(result);
    } catch (err) {
      setError(err as LocationError);
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  // Request location permission
  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    try {
      return await LocationService.requestPermission();
    } catch {
      setError({
        code: 0,
        message: 'Failed to request permission',
        type: 'PERMISSION_DENIED'
      });
      return 'denied';
    }
  }, []);

  // Start watching location
  const startWatching = useCallback(() => {
    if (!isSupported || isWatching) return;

    setIsWatching(true);
    setError(null);

    LocationService.startWatching(
      (locationResult) => {
        setLocation(locationResult);
        setLoading(false);
      },
      (locationError) => {
        setError(locationError);
        setLoading(false);
      }
    );
  }, [isSupported, isWatching]);

  // Stop watching location
  const stopWatching = useCallback(() => {
    if (!isWatching) return;

    LocationService.stopWatching();
    setIsWatching(false);
  }, [isWatching]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load last known location on mount
  useEffect(() => {
    const lastKnown = LocationService.getLastKnownLocation();
    if (lastKnown) {
      setLocation(lastKnown);
    }
  }, []);

  // Auto-start watching if enabled
  useEffect(() => {
    if (watch && isSupported) {
      startWatching();
    }

    return () => {
      if (isWatching) {
        stopWatching();
      }
    };
  }, [watch, isSupported, startWatching, stopWatching, isWatching]);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    requestPermission,
    startWatching,
    stopWatching,
    clearError,
    isSupported
  };
};

export default useLocation;
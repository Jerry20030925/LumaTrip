import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OfflineIndicatorProps {
  onRetry?: () => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onRetry }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      
      // Hide indicator after 3 seconds
      setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Test connectivity
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        setIsOnline(true);
        onRetry?.();
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={`fixed top-0 left-0 right-0 z-50 p-3 text-white text-center text-sm font-medium ${
            isOnline 
              ? 'bg-green-500' 
              : 'bg-red-500'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>已连接到网络</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>网络连接已断开</span>
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors disabled:opacity-50 flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>重试</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
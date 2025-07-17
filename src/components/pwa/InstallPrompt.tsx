import React, { useState, useEffect } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall, onDismiss }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'desktop' | 'mobile' | 'ios'>('desktop');

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // Check for iOS Safari
      if ((navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    // Detect platform
    const detectPlatform = () => {
      const userAgent = navigator.userAgent;
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        setPlatform('ios');
      } else if (/Android|Mobile/.test(userAgent)) {
        setPlatform('mobile');
      } else {
        setPlatform('desktop');
      }
    };

    checkIfInstalled();
    detectPlatform();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay if not dismissed
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed && !isInstalled) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (platform === 'ios') {
      // Show iOS install instructions
      setShowPrompt(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        onInstall?.();
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    onDismiss?.();
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Install Button (always visible) */}
      {!showPrompt && (deferredPrompt || platform === 'ios') && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleInstallClick}
          className="fixed bottom-20 right-4 z-50 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors md:bottom-4"
          title="安装应用"
        >
          <Download className="w-5 h-5" />
        </motion.button>
      )}

      {/* Install Prompt */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4 z-50 md:items-center"
          >
            <motion.div
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">L</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      LumaTrip
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      探索世界，分享旅程
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {platform === 'ios' ? (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    在 iPhone 上安装 LumaTrip
                  </h4>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">1</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>点击</span>
                        <Share className="w-4 h-4 text-blue-500" />
                        <span>分享按钮</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">2</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>选择</span>
                        <Plus className="w-4 h-4 text-blue-500" />
                        <span>添加到主屏幕</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">3</span>
                      </div>
                      <span>点击"添加"完成安装</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    安装 LumaTrip 应用
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    获得更好的体验，支持离线功能，快速访问和推送通知
                  </p>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>离线访问</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>推送通知</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>快速启动</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-3 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  稍后再说
                </button>
                {platform !== 'ios' && (
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                  >
                    立即安装
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InstallPrompt;
import React, { useState } from 'react';
import { MapPin, Navigation, Shield, X, Check } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
  onSkip: () => void;
  loading?: boolean;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  onAllow,
  onSkip,
  loading = false
}) => {
  const [step, setStep] = useState<'permission' | 'benefits'>('benefits');

  if (!isOpen) return null;

  const handleAllow = () => {
    setStep('permission');
    onAllow();
  };

  const benefits = [
    {
      icon: <MapPin className="w-6 h-6 text-blue-500" />,
      title: 'Local Recommendations',
      description: 'Discover nearby attractions, restaurants, and hidden gems in your area'
    },
    {
      icon: <Navigation className="w-6 h-6 text-green-500" />,
      title: 'Smart Suggestions',
      description: 'Get personalized travel suggestions based on your current location'
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      title: 'Privacy First',
      description: 'Your location data is encrypted and never shared with third parties'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {step === 'benefits' && (
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Title and Description */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Enhance Your Travel Experience
              </h2>
              <p className="text-gray-600">
                Allow location access to get personalized recommendations for your area
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleAllow}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Allow Location Access
                  </>
                )}
              </button>
              
              <button
                onClick={onSkip}
                className="w-full text-gray-600 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Skip for Now
              </button>
            </div>

            {/* Privacy Note */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Privacy Protected:</strong> Your location is only used to enhance your experience and is never shared with other users or third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'permission' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Navigation className="w-8 h-8 text-white animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Requesting Location Access
            </h2>
            <p className="text-gray-600 mb-6">
              Please allow location access in your browser to continue
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                Look for the location permission prompt in your browser and click "Allow" to enable location-based features.
              </p>
            </div>

            <button
              onClick={onSkip}
              className="text-gray-600 hover:text-gray-800 transition-colors font-medium"
            >
              Skip this step
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPermissionModal;
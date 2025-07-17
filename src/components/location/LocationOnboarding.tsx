import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, AlertCircle, Navigation, ArrowRight, X } from 'lucide-react';
import LocationPermissionModal from './LocationPermissionModal';
import LocationBasedRecommendations from './LocationBasedRecommendations';
import LocationService, { type LocationResult, type LocationError } from '../../services/location.service';
import { updateUserLocation } from '../../services/profile.service';
import { useAuth } from '../../hooks/useAuth';

interface LocationOnboardingProps {
  isOpen: boolean;
  onComplete: (location?: LocationResult) => void;
  onSkip: () => void;
}

type OnboardingStep = 'welcome' | 'permission' | 'loading' | 'success' | 'error' | 'recommendations';

const LocationOnboarding: React.FC<LocationOnboardingProps> = ({
  isOpen,
  onComplete,
  onSkip
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep('welcome');
      setLocation(null);
      setError(null);
      setShowPermissionModal(false);
    }
  }, [isOpen]);

  const handleRequestLocation = async () => {
    setShowPermissionModal(true);
    setStep('loading');
    setError(null);

    try {
      const locationResult = await LocationService.getCurrentLocation();
      setLocation(locationResult);
      
      // Save location to user profile if user is authenticated
      if (user?.id) {
        try {
          await updateUserLocation(user.id, locationResult);
          console.log('Location saved to user profile');
        } catch (profileError) {
          console.error('Failed to save location to profile:', profileError);
          // Don't fail the whole flow if profile update fails
        }
      }
      
      setStep('success');
      setShowPermissionModal(false);
      
      // Auto-proceed to recommendations after a short delay
      setTimeout(() => {
        setStep('recommendations');
      }, 2000);
    } catch (err) {
      setError(err as LocationError);
      setStep('error');
      setShowPermissionModal(false);
    }
  };

  const handleComplete = () => {
    onComplete(location || undefined);
  };

  const handleSkipStep = () => {
    if (step === 'recommendations') {
      handleComplete();
    } else {
      onSkip();
    }
  };

  const handleRetry = () => {
    setError(null);
    setStep('welcome');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Onboarding Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {step === 'welcome' && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to LumaTrip! 🎉
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Let's personalize your experience by finding great places near you
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Local Discoveries</h3>
                  <p className="text-sm text-gray-600">Find amazing places in your area</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Navigation className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Smart Suggestions</h3>
                  <p className="text-sm text-gray-600">Get personalized recommendations</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Privacy First</h3>
                  <p className="text-sm text-gray-600">Your data stays secure</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRequestLocation}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  Enable Location Services
                </button>
                
                <button
                  onClick={onSkip}
                  className="w-full text-gray-600 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  I'll set this up later
                </button>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Navigation className="w-10 h-10 text-white animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Finding Your Location
              </h2>
              
              <p className="text-gray-600 mb-8">
                This may take a few moments...
              </p>

              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>

              <button
                onClick={onSkip}
                className="text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          )}

          {step === 'success' && location && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Location Found! 📍
              </h2>
              
              <p className="text-gray-600 mb-4">
                We found you in <strong>{location.address.city}, {location.address.country}</strong>
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Now we can show you personalized recommendations for places near you!
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Setting up your recommendations...</span>
              </div>
            </div>
          )}

          {step === 'error' && error && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Location Access Needed
              </h2>
              
              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <p className="text-red-800 mb-2">
                  {error.type === 'PERMISSION_DENIED' && 'Location access was denied'}
                  {error.type === 'POSITION_UNAVAILABLE' && 'Unable to determine your location'}
                  {error.type === 'TIMEOUT' && 'Location request timed out'}
                  {error.type === 'NOT_SUPPORTED' && 'Location services not supported'}
                </p>
                <p className="text-sm text-red-700">
                  {error.type === 'PERMISSION_DENIED' && 'Please enable location access in your browser settings and try again.'}
                  {error.type === 'POSITION_UNAVAILABLE' && 'Check your internet connection and try again.'}
                  {error.type === 'TIMEOUT' && 'Please try again or check your connection.'}
                  {error.type === 'NOT_SUPPORTED' && 'Your browser doesn\'t support location services.'}
                </p>
              </div>

              <div className="space-y-3">
                {error.type === 'PERMISSION_DENIED' && (
                  <button
                    onClick={handleRetry}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                )}
                
                <button
                  onClick={onSkip}
                  className="w-full text-gray-600 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Continue Without Location
                </button>
              </div>
            </div>
          )}

          {step === 'recommendations' && location && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Personalized Recommendations
                </h2>
                <button
                  onClick={handleComplete}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <LocationBasedRecommendations 
                location={location} 
                className="mb-6 shadow-none border border-gray-200"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleComplete}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location Permission Modal */}
      <LocationPermissionModal
        isOpen={showPermissionModal}
        onClose={() => {
          setShowPermissionModal(false);
          setStep('welcome');
        }}
        onAllow={handleRequestLocation}
        onSkip={handleSkipStep}
        loading={step === 'loading'}
      />
    </>
  );
};

export default LocationOnboarding;
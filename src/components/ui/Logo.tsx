import React from 'react';
import { MapPin, Compass } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'text' | 'full';
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'full', 
  className = '', 
  clickable = false,
  onClick 
}) => {
  const sizeClasses = {
    sm: { icon: 'w-4 h-4', text: 'text-sm', container: 'gap-1' },
    md: { icon: 'w-6 h-6', text: 'text-lg', container: 'gap-2' },
    lg: { icon: 'w-8 h-8', text: 'text-xl', container: 'gap-3' },
    xl: { icon: 'w-12 h-12', text: 'text-3xl', container: 'gap-4' }
  };

  const currentSize = sizeClasses[size];
  
  const iconElement = (
    <div className="relative">
      <div className={`${currentSize.icon} bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg`}>
        <Compass className={`${currentSize.icon === 'w-4 h-4' ? 'w-2 h-2' : currentSize.icon === 'w-6 h-6' ? 'w-3 h-3' : currentSize.icon === 'w-8 h-8' ? 'w-4 h-4' : 'w-6 h-6'} text-white`} />
      </div>
      {size === 'xl' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <MapPin className="w-2 h-2 text-white" />
        </div>
      )}
    </div>
  );

  const textElement = (
    <span className={`${currentSize.text} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
      LumaTrip
    </span>
  );

  const content = (
    <div className={`flex items-center ${currentSize.container} ${className}`}>
      {(variant === 'icon' || variant === 'full') && iconElement}
      {(variant === 'text' || variant === 'full') && textElement}
    </div>
  );

  if (clickable) {
    return (
      <button
        onClick={onClick}
        className="flex items-center hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1"
      >
        {content}
      </button>
    );
  }

  return content;
};

export default Logo;
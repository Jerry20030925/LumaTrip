import React from 'react';

interface OnlineStatusIndicatorProps {
  isOnline: boolean;
}

const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({ isOnline }) => {
  return (
    <div style={{ color: isOnline ? 'green' : 'gray' }}>
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
};

export default OnlineStatusIndicator;
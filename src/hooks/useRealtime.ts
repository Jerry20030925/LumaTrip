import { useEffect } from 'react';

// Mock hook for real-time updates
export const useRealtime = (channel: string, onMessage: (payload: any) => void) => {
  useEffect(() => {
    console.log(`Subscribing to real-time channel: ${channel}`);

    // Simulate receiving a message
    const interval = setInterval(() => {
      onMessage({ id: Date.now(), text: 'A new message!', channel });
    }, 5000);

    return () => {
      console.log(`Unsubscribing from real-time channel: ${channel}`);
      clearInterval(interval);
    };
  }, [channel, onMessage]);
};
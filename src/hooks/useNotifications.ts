import { useState, useEffect } from 'react';

// Mock hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch initial notifications
    console.log('Fetching notifications in hook...');
    setNotifications([
      { id: 1, message: 'First notification', read: false },
      { id: 2, message: 'Second notification', read: true },
    ]);
    setUnreadCount(1);
  }, []);

  return { notifications, unreadCount };
};
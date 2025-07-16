// Mock functions for notification service

export const getNotifications = async () => {
  console.log('Fetching notifications...');
  return [];
};

export const markAsRead = async (notificationId: string) => {
  console.log(`Marking notification ${notificationId} as read...`);
  return { success: true };
};

export const markAllAsRead = async () => {
  console.log('Marking all notifications as read...');
  return { success: true };
};
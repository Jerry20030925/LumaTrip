import { create } from 'zustand';

interface NotificationState {
  notifications: any[];
  fetchNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((_set) => ({
  notifications: [],
  fetchNotifications: async () => {
    // const notifications = await fetchNotifications();
    // set({ notifications });
  },
}));
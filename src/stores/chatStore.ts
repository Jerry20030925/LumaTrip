import { create } from 'zustand';

interface ChatState {
  messages: any[];
  sendMessage: (message: any) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  sendMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));
import { create } from 'zustand';

interface PostState {
  posts: any[];
  fetchPosts: () => void;
}

export const usePostStore = create<PostState>((_set) => ({
  posts: [],
  fetchPosts: async () => {
    // const posts = await fetchPosts();
    // set({ posts });
  },
}));
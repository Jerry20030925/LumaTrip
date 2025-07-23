import { create } from 'zustand';

interface PostState {
  posts: any[];
  fetchPosts: () => void;
}

export const usePostStore = create<PostState>(() => ({
  posts: [],
  fetchPosts: async () => {
    // const posts = await fetchPosts();
    // set({ posts });
  },
}));
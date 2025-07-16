import { create } from 'zustand';

interface SearchState {
  query: string;
  results: any[];
  setQuery: (query: string) => void;
  search: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  setQuery: (query) => set({ query }),
  search: async () => {
    // const results = await search(get().query);
    // set({ results });
  },
}));
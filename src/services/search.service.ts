// Mock functions for search service

export const search = async (query: string, type: 'user' | 'post' | 'tag' = 'post') => {
  console.log(`Searching for ${query} in ${type}...`);
  return [];
};

export const getSearchHistory = async () => {
  console.log('Fetching search history...');
  return [];
};

export const clearSearchHistory = async () => {
  console.log('Clearing search history...');
  return { success: true };
};
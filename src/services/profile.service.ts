// Mock functions for profile service

export const getProfile = async (userId: string) => {
  console.log(`Fetching profile for user ${userId}...`);
  return { id: userId, name: 'Test User', bio: 'This is a test bio.' };
};

export const updateProfile = async (profileData: any) => {
  console.log('Updating profile...', profileData);
  return { success: true };
};

export const getFollowers = async (userId: string) => {
  console.log(`Fetching followers for user ${userId}...`);
  return [];
};

export const getFollowing = async (userId: string) => {
  console.log(`Fetching following for user ${userId}...`);
  return [];
};

export const followUser = async (userId: string) => {
  console.log(`Following user ${userId}...`);
  return { success: true };
};

export const unfollowUser = async (userId: string) => {
  console.log(`Unfollowing user ${userId}...`);
  return { success: true };
};
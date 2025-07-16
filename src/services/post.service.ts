// Mock functions for post service

export const getPosts = async () => {
  console.log('Fetching posts...');
  return [];
};

export const createPost = async (postData: any) => {
  console.log('Creating post...', postData);
  return { id: Date.now(), ...postData };
};

export const likePost = async (postId: string) => {
  console.log(`Liking post ${postId}...`);
  return { success: true };
};

export const addComment = async (postId: string, comment: string) => {
  console.log(`Adding comment to post ${postId}:`, comment);
  return { id: Date.now(), text: comment };
};
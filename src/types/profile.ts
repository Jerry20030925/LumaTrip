export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  birthDate?: Date;
  joinDate: Date;
  isVerified: boolean;
  isPrivate: boolean;
  tags: string[];
}

export interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesCount: number;
}

export interface ProfilePost {
  id: string;
  imageUrl: string;
  caption?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  type: 'image' | 'video' | 'carousel';
}

export interface ProfileTab {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

export interface FollowRelation {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface ProfileEditData {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  isPrivate: boolean;
  tags: string[];
}

export type ProfileTabType = 'posts' | 'saved' | 'liked' | 'tagged';
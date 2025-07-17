import { supabase } from '../utils/supabaseClient';
import type { UserProfile, UserLocation } from '../types/profile';
import type { LocationResult } from './location.service';

export interface ProfileService {
  getProfile: (userId: string) => Promise<UserProfile | null>;
  updateProfile: (userId: string, profileData: Partial<UserProfile>) => Promise<boolean>;
  updateUserLocation: (userId: string, locationData: LocationResult) => Promise<boolean>;
  getUserLocation: (userId: string) => Promise<UserLocation | null>;
  getFollowers: (userId: string) => Promise<any[]>;
  getFollowing: (userId: string) => Promise<any[]>;
  followUser: (userId: string) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;
}

class ProfileServiceImpl implements ProfileService {
  private static instance: ProfileServiceImpl;

  private constructor() {}

  static getInstance(): ProfileServiceImpl {
    if (!ProfileServiceImpl.instance) {
      ProfileServiceImpl.instance = new ProfileServiceImpl();
    }
    return ProfileServiceImpl.instance;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  async updateUserLocation(userId: string, locationData: LocationResult): Promise<boolean> {
    try {
      const userLocation: UserLocation = {
        latitude: locationData.location.latitude,
        longitude: locationData.location.longitude,
        accuracy: locationData.location.accuracy,
        city: locationData.address.city,
        state: locationData.address.state,
        country: locationData.address.country,
        countryCode: locationData.address.countryCode,
        postalCode: locationData.address.postalCode,
        address: locationData.address.street,
        lastUpdated: new Date()
      };

      const displayLocation = `${locationData.address.city}, ${locationData.address.country}`;

      const { error } = await supabase
        .from('profiles')
        .update({
          location: displayLocation,
          detailedLocation: userLocation,
          locationPreferences: {
            shareLocation: true,
            allowLocationBasedRecommendations: true,
            locationAccuracy: 'city'
          }
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user location:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating user location:', error);
      return false;
    }
  }

  async getUserLocation(userId: string): Promise<UserLocation | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('detailedLocation')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user location:', error);
        return null;
      }

      return data?.detailedLocation || null;
    } catch (error) {
      console.error('Error fetching user location:', error);
      return null;
    }
  }

  async getFollowers(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          profiles!follows_follower_id_fkey (
            id,
            username,
            displayName,
            avatar
          )
        `)
        .eq('following_id', userId);

      if (error) {
        console.error('Error fetching followers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching followers:', error);
      return [];
    }
  }

  async getFollowing(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles!follows_following_id_fkey (
            id,
            username,
            displayName,
            avatar
          )
        `)
        .eq('follower_id', userId);

      if (error) {
        console.error('Error fetching following:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching following:', error);
      return [];
    }
  }

  async followUser(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) {
        console.error('Error following user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  }

  async unfollowUser(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) {
        console.error('Error unfollowing user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  }
}

const profileService = ProfileServiceImpl.getInstance();

// Export individual functions for backward compatibility
export const getProfile = profileService.getProfile.bind(profileService);
export const updateProfile = profileService.updateProfile.bind(profileService);
export const updateUserLocation = profileService.updateUserLocation.bind(profileService);
export const getUserLocation = profileService.getUserLocation.bind(profileService);
export const getFollowers = profileService.getFollowers.bind(profileService);
export const getFollowing = profileService.getFollowing.bind(profileService);
export const followUser = profileService.followUser.bind(profileService);
export const unfollowUser = profileService.unfollowUser.bind(profileService);

export default profileService;
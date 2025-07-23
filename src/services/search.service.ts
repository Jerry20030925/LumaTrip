import { supabase } from '../utils/supabaseClient';

export interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'tag' | 'location';
  title: string;
  description?: string;
  image?: string;
  avatar?: string;
  location?: string;
  tags?: string[];
  stats?: {
    likes?: number;
    comments?: number;
    followers?: number;
    posts?: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface SearchFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: string;
  tags?: string[];
  minLikes?: number;
  minComments?: number;
  sortBy?: 'relevance' | 'date' | 'popularity';
  contentType?: 'all' | 'images' | 'videos' | 'text';
}

export const searchUsers = async (query: string, filters?: SearchFilters): Promise<SearchResult[]> => {
  try {
    let supabaseQuery = supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        bio,
        avatar_url,
        location,
        follower_count,
        following_count,
        post_count,
        created_at,
        updated_at
      `)
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%`)
      .limit(20);

    if (filters?.location) {
      supabaseQuery = supabaseQuery.ilike('location', `%${filters.location}%`);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('Search users error:', error);
      return [];
    }

    return data?.map(user => ({
      id: user.id,
      type: 'user' as const,
      title: user.full_name || user.username,
      description: user.bio,
      avatar: user.avatar_url,
      location: user.location,
      stats: {
        followers: user.follower_count,
        posts: user.post_count
      },
      created_at: user.created_at,
      updated_at: user.updated_at
    })) || [];
  } catch (error) {
    console.error('Search users error:', error);
    return [];
  }
};

export const searchPosts = async (query: string, filters?: SearchFilters): Promise<SearchResult[]> => {
  try {
    let supabaseQuery = supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        image_url,
        location,
        tags,
        like_count,
        comment_count,
        created_at,
        updated_at,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,location.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (filters?.location) {
      supabaseQuery = supabaseQuery.ilike('location', `%${filters.location}%`);
    }

    if (filters?.minLikes) {
      supabaseQuery = supabaseQuery.gte('like_count', filters.minLikes);
    }

    if (filters?.minComments) {
      supabaseQuery = supabaseQuery.gte('comment_count', filters.minComments);
    }

    if (filters?.tags && filters.tags.length > 0) {
      supabaseQuery = supabaseQuery.contains('tags', filters.tags);
    }

    if (filters?.dateRange) {
      supabaseQuery = supabaseQuery
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString());
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('Search posts error:', error);
      return [];
    }

    return data?.map(post => ({
      id: post.id,
      type: 'post' as const,
      title: post.title,
      description: post.content,
      image: post.image_url,
      location: post.location,
      tags: post.tags || [],
      stats: {
        likes: post.like_count,
        comments: post.comment_count
      },
      created_at: post.created_at,
      updated_at: post.updated_at
    })) || [];
  } catch (error) {
    console.error('Search posts error:', error);
    return [];
  }
};

export const searchTags = async (query: string): Promise<SearchResult[]> => {
  try {
    const { data, error } = await supabase
      .from('post_tags')
      .select(`
        tag,
        count(*) as post_count
      `)
      .ilike('tag', `%${query}%`)
      // .group('tag')
      .order('post_count', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Search tags error:', error);
      return [];
    }

    return data?.map((tag: any) => ({
      id: tag.tag,
      type: 'tag' as const,
      title: `#${tag.tag}`,
      description: `${tag.post_count} 个帖子使用了这个标签`,
      stats: {
        posts: tag.post_count
      }
    })) || [];
  } catch (error) {
    console.error('Search tags error:', error);
    return [];
  }
};

export const searchLocations = async (query: string): Promise<SearchResult[]> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        location,
        count(*) as post_count
      `)
      .not('location', 'is', null)
      .ilike('location', `%${query}%`)
      // .group('location')
      .order('post_count', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Search locations error:', error);
      return [];
    }

    return data?.map((location: any) => ({
      id: location.location,
      type: 'location' as const,
      title: location.location,
      description: `${location.post_count} 个帖子来自这个地点`,
      stats: {
        posts: location.post_count
      }
    })) || [];
  } catch (error) {
    console.error('Search locations error:', error);
    return [];
  }
};

export const search = async (
  query: string, 
  type: 'all' | 'user' | 'post' | 'tag' | 'location' = 'all',
  filters?: SearchFilters
): Promise<SearchResult[]> => {
  if (!query.trim()) return [];

  try {
    let results: SearchResult[] = [];

    if (type === 'all') {
      // Parallel search for all types
      const [users, posts, tags, locations] = await Promise.all([
        searchUsers(query, filters),
        searchPosts(query, filters),
        searchTags(query),
        searchLocations(query)
      ]);

      // Combine and sort results by relevance
      results = [...users, ...posts, ...tags, ...locations];
      
      // Sort by relevance (exact matches first, then by stats)
      results.sort((a, b) => {
        const aExact = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
        const bExact = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
        
        if (aExact !== bExact) return bExact - aExact;
        
        const aStats = (a.stats?.likes || 0) + (a.stats?.comments || 0) + (a.stats?.followers || 0) + (a.stats?.posts || 0);
        const bStats = (b.stats?.likes || 0) + (b.stats?.comments || 0) + (b.stats?.followers || 0) + (b.stats?.posts || 0);
        
        return bStats - aStats;
      });
    } else {
      // Search specific type
      switch (type) {
        case 'user':
          results = await searchUsers(query, filters);
          break;
        case 'post':
          results = await searchPosts(query, filters);
          break;
        case 'tag':
          results = await searchTags(query);
          break;
        case 'location':
          results = await searchLocations(query);
          break;
      }
    }

    // Save search to history
    await saveSearchToHistory(query, type, results.length);

    return results;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

export const getTrendingTags = async (limit = 10): Promise<string[]> => {
  try {
    // Simplified version - just get unique tags
    const { data, error } = await supabase
      .from('post_tags')
      .select('tag')
      .limit(limit * 2);

    if (error) {
      console.error('Get trending tags error:', error);
      return ['#旅行', '#美食', '#摄影', '#自然', '#城市', '#文化'];
    }

    const uniqueTags = Array.from(new Set(data?.map((item: any) => item.tag) || []));
    return uniqueTags.slice(0, limit).map((tag: string) => `#${tag}`);
  } catch (error) {
    console.error('Get trending tags error:', error);
    return ['#旅行', '#美食', '#摄影', '#自然', '#城市', '#文化'];
  }
};

export const getPopularLocations = async (limit = 10): Promise<string[]> => {
  try {
    // Simplified version - just get unique locations
    const { data, error } = await supabase
      .from('posts')
      .select('location')
      .not('location', 'is', null)
      .limit(limit * 2);

    if (error) {
      console.error('Get popular locations error:', error);
      return ['东京', '巴厘岛', '巴黎', '纽约', '伦敦', '首尔'];
    }

    const uniqueLocations = Array.from(new Set(data?.map((item: any) => item.location).filter(Boolean) || []));
    return uniqueLocations.slice(0, limit);
  } catch (error) {
    console.error('Get popular locations error:', error);
    return ['东京', '巴厘岛', '巴黎', '纽约', '伦敦', '首尔'];
  }
};

export const getSearchHistory = async (): Promise<string[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('search_history')
      .select('query')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Get search history error:', error);
      return [];
    }

    return data?.map(item => item.query) || [];
  } catch (error) {
    console.error('Get search history error:', error);
    return [];
  }
};

export const saveSearchToHistory = async (query: string, type: string, resultCount: number): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if this search already exists
    const { data: existing } = await supabase
      .from('search_history')
      .select('id')
      .eq('user_id', user.id)
      .eq('query', query)
      .single();

    if (existing) {
      // Update existing search
      await supabase
        .from('search_history')
        .update({ 
          search_type: type,
          result_count: resultCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      // Insert new search
      await supabase
        .from('search_history')
        .insert({
          user_id: user.id,
          query,
          search_type: type,
          result_count: resultCount
        });
    }
  } catch (error) {
    console.error('Save search to history error:', error);
  }
};

export const clearSearchHistory = async (): Promise<{ success: boolean }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Clear search history error:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Clear search history error:', error);
    return { success: false };
  }
};
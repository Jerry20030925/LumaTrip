import { supabase } from '../utils/supabaseClient';
import type { Recommendation } from './recommendations.service';

export interface BookmarkFolder {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number;
  isDefault: boolean;
}

export interface BookmarkItem {
  id: string;
  folderId: string;
  recommendationId: string;
  recommendation: Recommendation;
  userId: string;
  createdAt: Date;
  notes?: string;
}

export interface BookmarkService {
  createFolder: (name: string, description?: string) => Promise<BookmarkFolder | null>;
  getFolders: () => Promise<BookmarkFolder[]>;
  updateFolder: (folderId: string, name: string, description?: string) => Promise<boolean>;
  deleteFolder: (folderId: string) => Promise<boolean>;
  addBookmark: (recommendationId: string, folderId?: string, notes?: string) => Promise<boolean>;
  removeBookmark: (recommendationId: string, folderId?: string) => Promise<boolean>;
  getBookmarks: (folderId?: string) => Promise<BookmarkItem[]>;
  isBookmarked: (recommendationId: string, folderId?: string) => Promise<boolean>;
  moveBookmark: (bookmarkId: string, targetFolderId: string) => Promise<boolean>;
}

class BookmarkServiceImpl implements BookmarkService {
  private static instance: BookmarkServiceImpl;

  private constructor() {}

  static getInstance(): BookmarkServiceImpl {
    if (!BookmarkServiceImpl.instance) {
      BookmarkServiceImpl.instance = new BookmarkServiceImpl();
    }
    return BookmarkServiceImpl.instance;
  }

  async createFolder(name: string, description?: string): Promise<BookmarkFolder | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('bookmark_folders')
        .insert({
          name,
          description,
          user_id: user.id,
          is_default: false
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating bookmark folder:', error);
        return null;
      }

      return this.mapDatabaseToFolder(data);
    } catch (error) {
      console.error('Error creating bookmark folder:', error);
      return null;
    }
  }

  async getFolders(): Promise<BookmarkFolder[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First, ensure default folder exists
      await this.ensureDefaultFolder(user.id);

      const { data, error } = await supabase
        .from('bookmark_folders')
        .select(`
          *,
          bookmarks:bookmark_items(count)
        `)
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching bookmark folders:', error);
        return [];
      }

      return (data || []).map(folder => ({
        ...this.mapDatabaseToFolder(folder),
        itemCount: folder.bookmarks?.[0]?.count || 0
      }));
    } catch (error) {
      console.error('Error fetching bookmark folders:', error);
      return [];
    }
  }

  async updateFolder(folderId: string, name: string, description?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('bookmark_folders')
        .update({
          name,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', folderId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating bookmark folder:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating bookmark folder:', error);
      return false;
    }
  }

  async deleteFolder(folderId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if it's the default folder
      const { data: folder } = await supabase
        .from('bookmark_folders')
        .select('is_default')
        .eq('id', folderId)
        .eq('user_id', user.id)
        .single();

      if (folder?.is_default) {
        throw new Error('Cannot delete default folder');
      }

      // Move all bookmarks to default folder
      const { data: defaultFolder } = await supabase
        .from('bookmark_folders')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (defaultFolder) {
        await supabase
          .from('bookmark_items')
          .update({ folder_id: defaultFolder.id })
          .eq('folder_id', folderId);
      }

      // Delete the folder
      const { error } = await supabase
        .from('bookmark_folders')
        .delete()
        .eq('id', folderId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting bookmark folder:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting bookmark folder:', error);
      return false;
    }
  }

  async addBookmark(recommendationId: string, folderId?: string, notes?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get target folder (default if not specified)
      let targetFolderId = folderId;
      if (!targetFolderId) {
        const { data: defaultFolder } = await supabase
          .from('bookmark_folders')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();
        
        if (defaultFolder) {
          targetFolderId = defaultFolder.id;
        } else {
          // Create default folder if it doesn't exist
          const defaultFolderData = await this.ensureDefaultFolder(user.id);
          targetFolderId = defaultFolderData.id;
        }
      }

      // Check if bookmark already exists
      const { data: existingBookmark } = await supabase
        .from('bookmark_items')
        .select('id')
        .eq('recommendation_id', recommendationId)
        .eq('folder_id', targetFolderId)
        .eq('user_id', user.id)
        .single();

      if (existingBookmark) {
        return true; // Already bookmarked
      }

      // Add bookmark
      const { error } = await supabase
        .from('bookmark_items')
        .insert({
          recommendation_id: recommendationId,
          folder_id: targetFolderId,
          user_id: user.id,
          notes
        });

      if (error) {
        console.error('Error adding bookmark:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return false;
    }
  }

  async removeBookmark(recommendationId: string, folderId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      let query = supabase
        .from('bookmark_items')
        .delete()
        .eq('recommendation_id', recommendationId)
        .eq('user_id', user.id);

      if (folderId) {
        query = query.eq('folder_id', folderId);
      }

      const { error } = await query;

      if (error) {
        console.error('Error removing bookmark:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  }

  async getBookmarks(folderId?: string): Promise<BookmarkItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('bookmark_items')
        .select(`
          *,
          folder:bookmark_folders(name, is_default)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (folderId) {
        query = query.eq('folder_id', folderId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookmarks:', error);
        return [];
      }

      return (data || []).map(this.mapDatabaseToBookmark);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  }

  async isBookmarked(recommendationId: string, folderId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      let query = supabase
        .from('bookmark_items')
        .select('id')
        .eq('recommendation_id', recommendationId)
        .eq('user_id', user.id);

      if (folderId) {
        query = query.eq('folder_id', folderId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking bookmark status:', error);
        return false;
      }

      return (data || []).length > 0;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  }

  async moveBookmark(bookmarkId: string, targetFolderId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('bookmark_items')
        .update({ folder_id: targetFolderId })
        .eq('id', bookmarkId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error moving bookmark:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error moving bookmark:', error);
      return false;
    }
  }

  private async ensureDefaultFolder(userId: string): Promise<BookmarkFolder> {
    const { data: existingFolder } = await supabase
      .from('bookmark_folders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (existingFolder) {
      return this.mapDatabaseToFolder(existingFolder);
    }

    // Create default folder
    const { data, error } = await supabase
      .from('bookmark_folders')
      .insert({
        name: '我的收藏',
        description: '默认收藏夹',
        user_id: userId,
        is_default: true
      })
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to create default bookmark folder');
    }

    return this.mapDatabaseToFolder(data);
  }

  private mapDatabaseToFolder(data: any): BookmarkFolder {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      itemCount: data.itemCount || 0,
      isDefault: data.is_default || false
    };
  }

  private mapDatabaseToBookmark(data: any): BookmarkItem {
    return {
      id: data.id,
      folderId: data.folder_id,
      recommendationId: data.recommendation_id,
      recommendation: data.recommendation, // This would need to be joined from recommendations table
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      notes: data.notes
    };
  }
}

const bookmarkService = BookmarkServiceImpl.getInstance();

// Export individual functions for convenience
export const createFolder = bookmarkService.createFolder.bind(bookmarkService);
export const getFolders = bookmarkService.getFolders.bind(bookmarkService);
export const updateFolder = bookmarkService.updateFolder.bind(bookmarkService);
export const deleteFolder = bookmarkService.deleteFolder.bind(bookmarkService);
export const addBookmark = bookmarkService.addBookmark.bind(bookmarkService);
export const removeBookmark = bookmarkService.removeBookmark.bind(bookmarkService);
export const getBookmarks = bookmarkService.getBookmarks.bind(bookmarkService);
export const isBookmarked = bookmarkService.isBookmarked.bind(bookmarkService);
export const moveBookmark = bookmarkService.moveBookmark.bind(bookmarkService);

export default bookmarkService;
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  type BookmarkFolder,
  type BookmarkItem,
  addBookmark,
  removeBookmark,
  isBookmarked,
  getFolders,
  getBookmarks,
  createFolder,
  updateFolder,
  deleteFolder,
  moveBookmark
} from '../services/bookmarks.service';

interface UseBookmarksReturn {
  folders: BookmarkFolder[];
  bookmarks: BookmarkItem[];
  loading: boolean;
  error: string | null;
  
  // Folder operations
  createFolder: (name: string, description?: string) => Promise<boolean>;
  updateFolder: (folderId: string, name: string, description?: string) => Promise<boolean>;
  deleteFolder: (folderId: string) => Promise<boolean>;
  refreshFolders: () => Promise<void>;
  
  // Bookmark operations
  addBookmark: (recommendationId: string, folderId?: string, notes?: string) => Promise<boolean>;
  removeBookmark: (recommendationId: string, folderId?: string) => Promise<boolean>;
  isBookmarked: (recommendationId: string, folderId?: string) => Promise<boolean>;
  moveBookmark: (bookmarkId: string, targetFolderId: string) => Promise<boolean>;
  refreshBookmarks: (folderId?: string) => Promise<void>;
  
  // Utility functions
  clearError: () => void;
  getBookmarkStatus: (recommendationId: string) => boolean;
}

export const useBookmarks = (folderId?: string): UseBookmarksReturn => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkStatuses, setBookmarkStatuses] = useState<Record<string, boolean>>({});

  // Load folders on mount
  useEffect(() => {
    if (user) {
      loadFolders();
    }
  }, [user]);

  // Load bookmarks when folder changes
  useEffect(() => {
    if (user) {
      loadBookmarks(folderId);
    }
  }, [user, folderId]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const foldersData = await getFolders();
      setFolders(foldersData);
    } catch (err) {
      console.error('Error loading folders:', err);
      setError('加载收藏夹失败');
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async (targetFolderId?: string) => {
    try {
      setLoading(true);
      const bookmarksData = await getBookmarks(targetFolderId);
      setBookmarks(bookmarksData);
      
      // Update bookmark statuses
      const statuses: Record<string, boolean> = {};
      bookmarksData.forEach(bookmark => {
        statuses[bookmark.recommendationId] = true;
      });
      setBookmarkStatuses(statuses);
    } catch (err) {
      console.error('Error loading bookmarks:', err);
      setError('加载收藏失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = useCallback(async (name: string, description?: string): Promise<boolean> => {
    try {
      setError(null);
      const folder = await createFolder(name, description);
      if (folder) {
        await loadFolders();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('创建收藏夹失败');
      return false;
    }
  }, []);

  const handleUpdateFolder = useCallback(async (folderId: string, name: string, description?: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await updateFolder(folderId, name, description);
      if (success) {
        await loadFolders();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating folder:', err);
      setError('更新收藏夹失败');
      return false;
    }
  }, []);

  const handleDeleteFolder = useCallback(async (folderId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await deleteFolder(folderId);
      if (success) {
        await loadFolders();
        await loadBookmarks(); // Refresh bookmarks as items may have moved
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError('删除收藏夹失败');
      return false;
    }
  }, []);

  const handleAddBookmark = useCallback(async (recommendationId: string, targetFolderId?: string, notes?: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await addBookmark(recommendationId, targetFolderId, notes);
      if (success) {
        // Update bookmark status
        setBookmarkStatuses(prev => ({
          ...prev,
          [recommendationId]: true
        }));
        
        // Refresh bookmarks and folders (to update counts)
        await loadBookmarks(folderId);
        await loadFolders();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding bookmark:', err);
      setError('添加收藏失败');
      return false;
    }
  }, [folderId]);

  const handleRemoveBookmark = useCallback(async (recommendationId: string, targetFolderId?: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await removeBookmark(recommendationId, targetFolderId);
      if (success) {
        // Update bookmark status
        setBookmarkStatuses(prev => ({
          ...prev,
          [recommendationId]: false
        }));
        
        // Refresh bookmarks and folders (to update counts)
        await loadBookmarks(folderId);
        await loadFolders();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError('移除收藏失败');
      return false;
    }
  }, [folderId]);

  const checkIsBookmarked = useCallback(async (recommendationId: string, targetFolderId?: string): Promise<boolean> => {
    try {
      const bookmarked = await isBookmarked(recommendationId, targetFolderId);
      setBookmarkStatuses(prev => ({
        ...prev,
        [recommendationId]: bookmarked
      }));
      return bookmarked;
    } catch (err) {
      console.error('Error checking bookmark status:', err);
      return false;
    }
  }, []);

  const handleMoveBookmark = useCallback(async (bookmarkId: string, targetFolderId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await moveBookmark(bookmarkId, targetFolderId);
      if (success) {
        // Refresh bookmarks and folders
        await loadBookmarks(folderId);
        await loadFolders();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error moving bookmark:', err);
      setError('移动收藏失败');
      return false;
    }
  }, [folderId]);

  const refreshFolders = useCallback(async () => {
    await loadFolders();
  }, []);

  const refreshBookmarks = useCallback(async (targetFolderId?: string) => {
    await loadBookmarks(targetFolderId);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getBookmarkStatus = useCallback((recommendationId: string): boolean => {
    return bookmarkStatuses[recommendationId] || false;
  }, [bookmarkStatuses]);

  return {
    folders,
    bookmarks,
    loading,
    error,
    
    // Folder operations
    createFolder: handleCreateFolder,
    updateFolder: handleUpdateFolder,
    deleteFolder: handleDeleteFolder,
    refreshFolders,
    
    // Bookmark operations
    addBookmark: handleAddBookmark,
    removeBookmark: handleRemoveBookmark,
    isBookmarked: checkIsBookmarked,
    moveBookmark: handleMoveBookmark,
    refreshBookmarks,
    
    // Utility functions
    clearError,
    getBookmarkStatus
  };
};

export default useBookmarks;
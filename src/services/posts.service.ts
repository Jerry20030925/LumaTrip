import { supabase } from '../utils/supabaseClient';

export interface Post {
  id: string;
  title: string;
  content: string;
  images?: string[];
  location?: string;
  tags?: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  likes: number;
  comments: number;
  bookmarks: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isCommented?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
}

class PostsService {
  private tableName = 'posts';

  // 获取所有帖子
  async getPosts(): Promise<Post[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取帖子失败:', error);
        return [];
      }

      return data?.map(this.mapDatabaseToPost) || [];
    } catch (error) {
      console.error('获取帖子异常:', error);
      return [];
    }
  }

  // 创建新帖子
  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'bookmarks'>): Promise<Post | null> {
    try {
      const postData = {
        title: post.title,
        content: post.content,
        images: post.images,
        location: post.location,
        tags: post.tags,
        author_id: post.author.id,
        author_name: post.author.name,
        author_avatar: post.author.avatar,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([postData])
        .select()
        .single();

      if (error) {
        console.error('创建帖子失败:', error);
        return null;
      }

      return this.mapDatabaseToPost(data);
    } catch (error) {
      console.error('创建帖子异常:', error);
      return null;
    }
  }

  // 点赞帖子
  async likePost(_postId: string, _userId: string): Promise<boolean> {
    try {
      // 这里应该实现点赞逻辑，暂时返回成功
      return true;
    } catch (error) {
      console.error('点赞失败:', error);
      return false;
    }
  }

  // 收藏帖子
  async bookmarkPost(_postId: string, _userId: string): Promise<boolean> {
    try {
      // 这里应该实现收藏逻辑，暂时返回成功
      return true;
    } catch (error) {
      console.error('收藏失败:', error);
      return false;
    }
  }

  // 获取帖子评论
  async getComments(postId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('获取评论失败:', error);
        return [];
      }

      return data?.map(this.mapDatabaseToComment) || [];
    } catch (error) {
      console.error('获取评论异常:', error);
      return [];
    }
  }

  // 添加评论
  async addComment(postId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment | null> {
    try {
      const commentData = {
        post_id: postId,
        content: comment.content,
        author_id: comment.author.id,
        author_name: comment.author.name,
        author_avatar: comment.author.avatar,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('comments')
        .insert([commentData])
        .select()
        .single();

      if (error) {
        console.error('添加评论失败:', error);
        return null;
      }

      return this.mapDatabaseToComment(data);
    } catch (error) {
      console.error('添加评论异常:', error);
      return null;
    }
  }

  // 数据库记录转换为Post对象
  private mapDatabaseToPost(dbRecord: any): Post {
    return {
      id: dbRecord.id,
      title: dbRecord.title,
      content: dbRecord.content,
      images: dbRecord.images,
      location: dbRecord.location,
      tags: dbRecord.tags,
      author: {
        id: dbRecord.author_id,
        name: dbRecord.author_name,
        avatar: dbRecord.author_avatar
      },
      createdAt: new Date(dbRecord.created_at),
      likes: dbRecord.likes || 0,
      comments: dbRecord.comments || 0,
      bookmarks: dbRecord.bookmarks || 0
    };
  }

  // 数据库记录转换为Comment对象
  private mapDatabaseToComment(dbRecord: any): Comment {
    return {
      id: dbRecord.id,
      content: dbRecord.content,
      author: {
        id: dbRecord.author_id,
        name: dbRecord.author_name,
        avatar: dbRecord.author_avatar
      },
      createdAt: new Date(dbRecord.created_at)
    };
  }
}

export const postsService = new PostsService(); 
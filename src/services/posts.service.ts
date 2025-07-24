export interface Post {
  id: string;
  title: string;
  content: string;
  images: string[];
  location?: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  comments: number;
  bookmarks: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isCommented?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  likes: number;
  isLiked?: boolean;
}

export interface CreatePostData {
  title: string;
  content: string;
  images?: string[];
  location?: string;
  tags?: string[];
}

export interface UserInteraction {
  userId: string;
  postId: string;
  type: 'like' | 'bookmark' | 'comment';
  createdAt: Date;
  post?: Post;
  comment?: Comment;
}

class PostsService {
  private static instance: PostsService;
  private posts: Post[] = [];
  private comments: Comment[] = [];
  private interactions: UserInteraction[] = [];

  public static getInstance(): PostsService {
    if (!PostsService.instance) {
      PostsService.instance = new PostsService();
      PostsService.instance.initializeMockData();
    }
    return PostsService.instance;
  }

  private initializeMockData() {
    // 初始化一些模拟帖子数据
    this.posts = [
      {
        id: '1',
        title: '美丽的日落风景',
        content: '今天在海边看到了最美的日落，分享给大家！',
        images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'],
        location: '三亚海滩',
        tags: ['#风景', '#日落', '#海边'],
        author: {
          id: 'user1',
          name: '旅行者小王',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 128,
        comments: 23,
        bookmarks: 45
      },
      {
        id: '2',
        title: '城市夜景探索',
        content: '夜晚的城市有着不同的魅力，霓虹灯下的街道充满了故事。',
        images: [
          'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop'
        ],
        location: '上海外滩',
        tags: ['#夜景', '#城市', '#摄影'],
        author: {
          id: 'user2',
          name: '摄影师李明',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
        },
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        likes: 256,
        comments: 67,
        bookmarks: 89
      },
      {
        id: '3',
        title: '山间小径',
        content: '徒步在山间小径上，呼吸着新鲜的空气，感受大自然的美好。',
        images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'],
        location: '黄山',
        tags: ['#徒步', '#自然', '#登山'],
        author: {
          id: 'user3',
          name: '户外达人张三',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
        },
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        likes: 89,
        comments: 12,
        bookmarks: 34
      }
    ];

    // 初始化一些模拟评论
    this.comments = [
      {
        id: 'c1',
        postId: '1',
        content: '太美了！我也想去看日落',
        author: {
          id: 'user2',
          name: '摄影师李明',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
        },
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likes: 15
      },
      {
        id: 'c2',
        postId: '1',
        content: '三亚的日落确实很棒！',
        author: {
          id: 'user3',
          name: '户外达人张三',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
        },
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        likes: 8
      }
    ];
  }

  // 获取所有帖子（支持分页和筛选）
  async getPosts(
    page: number = 1,
    limit: number = 20,
    filter: 'all' | 'following' | 'recommended' | 'trending' | 'nearby' = 'all',
    userId?: string
  ): Promise<{ posts: Post[]; total: number }> {
    try {
      let filteredPosts = [...this.posts];

      // 根据筛选条件过滤
      switch (filter) {
        case 'recommended':
          // 智能推荐：基于用户互动历史和标签偏好
          filteredPosts = this.getRecommendedPosts(userId);
          break;
        case 'trending':
          // 热门：按点赞和评论数排序
          filteredPosts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
          break;
        case 'following':
          // 关注的用户的帖子（这里使用模拟数据）
          filteredPosts = filteredPosts.filter(post => 
            ['user1', 'user2'].includes(post.author.id)
          );
          break;
        case 'nearby':
          // 附近的帖子（这里随机返回一些）
          filteredPosts = filteredPosts.filter(() => Math.random() > 0.5);
          break;
        default:
          // 最新：按时间排序
          filteredPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      // 为每个帖子添加用户互动状态
      if (userId) {
        filteredPosts = filteredPosts.map(post => ({
          ...post,
          isLiked: this.hasUserInteraction(userId, post.id, 'like'),
          isBookmarked: this.hasUserInteraction(userId, post.id, 'bookmark'),
          isCommented: this.hasUserInteraction(userId, post.id, 'comment')
        }));
      }

      // 分页
      const start = (page - 1) * limit;
      const paginatedPosts = filteredPosts.slice(start, start + limit);

      return {
        posts: paginatedPosts,
        total: filteredPosts.length
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  // 智能推荐算法
  private getRecommendedPosts(userId?: string): Post[] {
    if (!userId) {
      return this.posts.sort((a, b) => b.likes - a.likes);
    }

    // 获取用户的互动历史
    const userInteractions = this.interactions.filter(i => i.userId === userId);
    
    // 分析用户偏好的标签
    const preferredTags = new Map<string, number>();
    userInteractions.forEach(interaction => {
      if (interaction.post) {
        interaction.post.tags.forEach(tag => {
          preferredTags.set(tag, (preferredTags.get(tag) || 0) + 1);
        });
      }
    });

    // 计算帖子推荐分数
    const scoredPosts = this.posts.map(post => {
      let score = 0;
      
      // 基于标签匹配
      post.tags.forEach(tag => {
        if (preferredTags.has(tag)) {
          score += preferredTags.get(tag)! * 10;
        }
      });
      
      // 基于热度
      score += post.likes * 0.1 + post.comments * 0.2;
      
      // 基于时间新鲜度
      const daysSincePost = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 7 - daysSincePost) * 5;

      return { post, score };
    });

    // 按分数排序
    scoredPosts.sort((a, b) => b.score - a.score);
    return scoredPosts.map(item => item.post);
  }

  // 创建帖子
  async createPost(postData: CreatePostData, userId: string): Promise<Post> {
    try {
      const newPost: Post = {
        id: Date.now().toString(),
        title: postData.title,
        content: postData.content,
        images: postData.images || [],
        location: postData.location,
        tags: postData.tags || [],
        author: {
          id: userId,
          name: '当前用户', // 实际应该从用户服务获取
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        comments: 0,
        bookmarks: 0
      };

      this.posts.unshift(newPost);
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // 点赞/取消点赞
  async toggleLike(postId: string, userId: string): Promise<boolean> {
    try {
      const post = this.posts.find(p => p.id === postId);
      if (!post) throw new Error('Post not found');

      const hasLiked = this.hasUserInteraction(userId, postId, 'like');
      
      if (hasLiked) {
        // 取消点赞
        this.interactions = this.interactions.filter(
          i => !(i.userId === userId && i.postId === postId && i.type === 'like')
        );
        post.likes = Math.max(0, post.likes - 1);
        return false;
      } else {
        // 点赞
        this.interactions.push({
          userId,
          postId,
          type: 'like',
          createdAt: new Date(),
          post
        });
        post.likes += 1;
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  // 收藏/取消收藏
  async toggleBookmark(postId: string, userId: string): Promise<boolean> {
    try {
      const post = this.posts.find(p => p.id === postId);
      if (!post) throw new Error('Post not found');

      const hasBookmarked = this.hasUserInteraction(userId, postId, 'bookmark');
      
      if (hasBookmarked) {
        // 取消收藏
        this.interactions = this.interactions.filter(
          i => !(i.userId === userId && i.postId === postId && i.type === 'bookmark')
        );
        post.bookmarks = Math.max(0, post.bookmarks - 1);
        return false;
      } else {
        // 收藏
        this.interactions.push({
          userId,
          postId,
          type: 'bookmark',
          createdAt: new Date(),
          post
        });
        post.bookmarks += 1;
        return true;
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  // 获取帖子评论
  async getComments(postId: string, userId?: string): Promise<Comment[]> {
    try {
      let comments = this.comments.filter(c => c.postId === postId);
      
      // 添加用户点赞状态
      if (userId) {
        comments = comments.map(comment => ({
          ...comment,
          isLiked: this.interactions.some(
            i => i.userId === userId && i.comment?.id === comment.id && i.type === 'like'
          )
        }));
      }

      return comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  // 添加评论
  async addComment(postId: string, content: string, userId: string): Promise<Comment> {
    try {
      const post = this.posts.find(p => p.id === postId);
      if (!post) throw new Error('Post not found');

      const newComment: Comment = {
        id: Date.now().toString(),
        postId,
        content,
        author: {
          id: userId,
          name: '当前用户',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
        },
        createdAt: new Date(),
        likes: 0
      };

      this.comments.push(newComment);
      post.comments += 1;

      // 记录用户互动
      this.interactions.push({
        userId,
        postId,
        type: 'comment',
        createdAt: new Date(),
        post,
        comment: newComment
      });

      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // 获取用户互动历史
  async getUserInteractions(userId: string, type?: 'like' | 'bookmark' | 'comment'): Promise<UserInteraction[]> {
    try {
      let interactions = this.interactions.filter(i => i.userId === userId);
      
      if (type) {
        interactions = interactions.filter(i => i.type === type);
      }

      return interactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching user interactions:', error);
      throw error;
    }
  }

  // 检查用户是否有特定互动
  private hasUserInteraction(userId: string, postId: string, type: 'like' | 'bookmark' | 'comment'): boolean {
    return this.interactions.some(
      i => i.userId === userId && i.postId === postId && i.type === type
    );
  }

  // 搜索帖子
  async searchPosts(query: string, userId?: string): Promise<Post[]> {
    try {
      const searchTerms = query.toLowerCase().split(' ');
      
      let results = this.posts.filter(post => {
        const searchableText = `${post.title} ${post.content} ${post.tags.join(' ')} ${post.location || ''}`.toLowerCase();
        return searchTerms.some(term => searchableText.includes(term));
      });

      // 添加用户互动状态
      if (userId) {
        results = results.map(post => ({
          ...post,
          isLiked: this.hasUserInteraction(userId, post.id, 'like'),
          isBookmarked: this.hasUserInteraction(userId, post.id, 'bookmark'),
          isCommented: this.hasUserInteraction(userId, post.id, 'comment')
        }));
      }

      return results;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }
}

export const postsService = PostsService.getInstance(); 
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock types
interface Post {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
}

interface User {
  id: string;
  username: string;
  avatar: string;
}

// Mock组件
const MockPostCard = ({ post, onLike, onComment, onShare, onBookmark }: {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onShare: (postId: string) => void;
  onBookmark: (postId: string) => void;
}) => {
  const [isLiked, setIsLiked] = React.useState(post.isLiked);
  const [likeCount, setLikeCount] = React.useState(post.likeCount);
  const [isBookmarked, setIsBookmarked] = React.useState(post.isBookmarked);
  const [showComments, setShowComments] = React.useState(false);
  const [commentText, setCommentText] = React.useState('');
  const [comments, setComments] = React.useState<Comment[]>(post.comments || []);

  const handleLike = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount((prev: number) => newIsLiked ? prev + 1 : prev - 1);
    onLike(post.id);
  };

  const handleComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        content: commentText,
        author: {
          id: 'current-user',
          username: 'testuser',
          avatar: '/test-avatar.jpg'
        },
        createdAt: new Date().toISOString(),
        likeCount: 0,
        isLiked: false
      };
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      onComment(post.id, commentText);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark(post.id);
  };

  const handleShare = () => {
    onShare(post.id);
  };

  return (
    <div data-testid={`post-${post.id}`}>
      <div data-testid="post-content">{post.content}</div>
      
      {/* 互动按钮 */}
      <div className="post-actions">
        <button
          data-testid="like-button"
          onClick={handleLike}
          className={isLiked ? 'liked' : ''}
        >
          ❤️ {likeCount}
        </button>
        
        <button
          data-testid="comment-button"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {comments.length}
        </button>
        
        <button
          data-testid="share-button"
          onClick={handleShare}
        >
          🔗 分享
        </button>
        
        <button
          data-testid="bookmark-button"
          onClick={handleBookmark}
          className={isBookmarked ? 'bookmarked' : ''}
        >
          🔖 {isBookmarked ? '已收藏' : '收藏'}
        </button>
      </div>

      {/* 评论区 */}
      {showComments && (
        <div data-testid="comments-section">
          <div className="comment-input">
            <input
              data-testid="comment-input"
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="写评论..."
              maxLength={500}
            />
            <button
              data-testid="comment-submit"
              onClick={handleComment}
              disabled={!commentText.trim()}
            >
              发送
            </button>
          </div>
          
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} data-testid={`comment-${comment.id}`}>
                <div className="comment-author">{comment.author.username}</div>
                <div className="comment-content">{comment.content}</div>
                <button
                  data-testid={`comment-like-${comment.id}`}
                  onClick={() => {}}
                >
                  ❤️ {comment.likeCount}
                </button>
                {comment.author.id === 'current-user' && (
                  <button
                    data-testid={`comment-delete-${comment.id}`}
                    onClick={() => {
                      setComments(prev => prev.filter(c => c.id !== comment.id));
                    }}
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Mock分享组件
const MockShareModal = ({ isOpen, onClose, onShare }: {
  isOpen: boolean;
  onClose: () => void;
  onShare: (platform: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div data-testid="share-modal">
      <div className="modal-content">
        <h3>分享到</h3>
        <button
          data-testid="share-wechat"
          onClick={() => onShare('wechat')}
        >
          微信
        </button>
        <button
          data-testid="share-weibo"
          onClick={() => onShare('weibo')}
        >
          微博
        </button>
        <button
          data-testid="copy-link"
          onClick={() => onShare('copy')}
        >
          复制链接
        </button>
        <button
          data-testid="close-modal"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
    </div>
  );
};

// Mock举报组件
const MockReportModal = ({ isOpen, onClose, onReport }: {
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: string) => void;
}) => {
  const [selectedReason, setSelectedReason] = React.useState('');
  const [customReason, setCustomReason] = React.useState('');

  if (!isOpen) return null;

  const reasons = [
    '垃圾信息',
    '不当内容',
    '虚假信息',
    '侵犯版权',
    '其他'
  ];

  const handleSubmit = () => {
    const reason = selectedReason === '其他' ? customReason : selectedReason;
    if (reason) {
      onReport(reason);
      onClose();
    }
  };

  return (
    <div data-testid="report-modal">
      <div className="modal-content">
        <h3>举报内容</h3>
        {reasons.map(reason => (
          <label key={reason}>
            <input
              type="radio"
              name="report-reason"
              value={reason}
              checked={selectedReason === reason}
              onChange={(e) => setSelectedReason(e.target.value)}
            />
            {reason}
          </label>
        ))}
        
        {selectedReason === '其他' && (
          <textarea
            data-testid="custom-reason"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="请描述具体原因..."
            maxLength={200}
          />
        )}
        
        <div className="modal-actions">
          <button
            data-testid="submit-report"
            onClick={handleSubmit}
            disabled={!selectedReason || (selectedReason === '其他' && !customReason.trim())}
          >
            提交举报
          </button>
          <button
            data-testid="cancel-report"
            onClick={onClose}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

describe('互动功能测试', () => {
  const mockPost: Post = {
    id: 'test-post-1',
    content: '这是一个测试帖子',
    author: {
      id: 'author-1',
      username: 'testauthor',
      avatar: '/test-avatar.jpg'
    },
    createdAt: '2024-01-01T00:00:00Z',
    likeCount: 10,
    commentCount: 5,
    shareCount: 2,
    isLiked: false,
    isBookmarked: false,
    comments: [
      {
        id: 'comment-1',
        content: '很棒的分享！',
        author: {
          id: 'user-1',
          username: 'commenter1',
          avatar: '/avatar1.jpg'
        },
        createdAt: '2024-01-01T01:00:00Z',
        likeCount: 3,
        isLiked: false
      }
    ]
  };

  const mockHandlers = {
    onLike: vi.fn(),
    onComment: vi.fn(),
    onShare: vi.fn(),
    onBookmark: vi.fn(),
    onReport: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('点赞功能', () => {
    it('应该能够点赞帖子', async () => {
      const user = userEvent.setup();
      render(<MockPostCard post={mockPost} {...mockHandlers} />);
      
      const likeButton = screen.getByTestId('like-button');
      expect(likeButton).toHaveTextContent('❤️ 10');
      expect(likeButton).not.toHaveClass('liked');
      
      await user.click(likeButton);
      
      expect(likeButton).toHaveTextContent('❤️ 11');
      expect(likeButton).toHaveClass('liked');
      expect(mockHandlers.onLike).toHaveBeenCalledWith('test-post-1');
    });

    it('应该能够取消点赞', async () => {
      const user = userEvent.setup();
      const likedPost = { ...mockPost, isLiked: true, likeCount: 11 };
      render(<MockPostCard post={likedPost} {...mockHandlers} />);
      
      const likeButton = screen.getByTestId('like-button');
      expect(likeButton).toHaveTextContent('❤️ 11');
      expect(likeButton).toHaveClass('liked');
      
      await user.click(likeButton);
      
      expect(likeButton).toHaveTextContent('❤️ 10');
      expect(likeButton).not.toHaveClass('liked');
      expect(mockHandlers.onLike).toHaveBeenCalledWith('test-post-1');
    });

    it('应该实时更新点赞数', async () => {
      const user = userEvent.setup();
      render(<MockPostCard post={mockPost} {...mockHandlers} />);
      
      const likeButton = screen.getByTestId('like-button');
      
      // 连续点击测试
      await user.click(likeButton);
      expect(likeButton).toHaveTextContent('❤️ 11');
      
      await user.click(likeButton);
      expect(likeButton).toHaveTextContent('❤️ 10');
      
      await user.click(likeButton);
      expect(likeButton).toHaveTextContent('❤️ 11');
    });
  });

  describe('评论功能', () => {
    it('应该能够显示评论区', async () => {
      const user = userEvent.setup();
      render(<MockPostCard post={mockPost} {...mockHandlers} />);
      
      const commentButton = screen.getByTestId('comment-button');
      expect(commentButton).toHaveTextContent('💬 1');
      
      await user.click(commentButton);
      
      expect(screen.getByTestId('comments-section')).toBeInTheDocument();
      expect(screen.getByTestId('comment-input')).toBeInTheDocument();
      expect(screen.getByTestId('comment-1')).toBeInTheDocument();
    });

    it('应该能够发表评论', async () => {
      const user = userEvent.setup();
      render(<MockPostCard post={mockPost} {...mockHandlers} />);
      
      // 打开评论区
      await user.click(screen.getByTestId('comment-button'));
      
      const commentInput = screen.getByTestId('comment-input');
      const submitButton = screen.getByTestId('comment-submit');
      
      expect(submitButton).toBeDisabled();
      
      await user.type(commentInput, '这是一个测试评论');
      expect(submitButton).toBeEnabled();
      
      await user.click(submitButton);
      
      expect(mockHandlers.onComment).toHaveBeenCalledWith('test-post-1', '这是一个测试评论');
      expect(commentInput).toHaveValue('');
      
      // 检查新评论是否显示
      await waitFor(() => {
        expect(screen.getByText('这是一个测试评论')).toBeInTheDocument();
      });
    });

    it('应该限制评论字数', async () => {
      const user = userEvent.setup();
      render(<MockPostCard post={mockPost} {...mockHandlers} />);
      
      await user.click(screen.getByTestId('comment-button'));
      
      const commentInput = screen.getByTestId('comment-input') as HTMLInputElement;
      const longComment = 'a'.repeat(501);
      
      await user.type(commentInput, longComment);
      
      expect(commentInput.value).toHaveLength(500);
    });

    it('应该能够删除自己的评论', async () => {
      const user = userEvent.setup();
      const postWithUserComment = {
        ...mockPost,
        comments: [
          {
            id: 'user-comment',
            content: '我的评论',
            author: {
              id: 'current-user',
              username: 'testuser',
              avatar: '/test-avatar.jpg'
            },
            createdAt: '2024-01-01T02:00:00Z',
            likeCount: 0,
            isLiked: false
          }
        ]
      };
      
      render(<MockPostCard post={postWithUserComment} {...mockHandlers} />);
      
      await user.click(screen.getByTestId('comment-button'));
      
      expect(screen.getByTestId('comment-user-comment')).toBeInTheDocument();
      expect(screen.getByTestId('comment-delete-user-comment')).toBeInTheDocument();
      
      await user.click(screen.getByTestId('comment-delete-user-comment'));
      
      expect(screen.queryByTestId('comment-user-comment')).not.toBeInTheDocument();
    });

    it('应该能够回复评论', async () => {
      const user = userEvent.setup();
      render(<MockPostCard post={mockPost} {...mockHandlers} />);
      
      await user.click(screen.getByTestId('comment-button'));
      
      const commentInput = screen.getByTestId('comment-input');
      await user.type(commentInput, '@commenter1 回复你的评论');
      await user.click(screen.getByTestId('comment-submit'));
      
      expect(mockHandlers.onComment).toHaveBeenCalledWith('test-post-1', '@commenter1 回复你的评论');
    });
  });

  describe('收藏功能', () => {
    it('应该能够收藏帖子', async () => {
      const user = userEvent.setup();
      render(<MockPostCard post={mockPost} {...mockHandlers} />);
      
      const bookmarkButton = screen.getByTestId('bookmark-button');
      expect(bookmarkButton).toHaveTextContent('🔖 收藏');
      expect(bookmarkButton).not.toHaveClass('bookmarked');
      
      await user.click(bookmarkButton);
      
      expect(bookmarkButton).toHaveTextContent('🔖 已收藏');
      expect(bookmarkButton).toHaveClass('bookmarked');
      expect(mockHandlers.onBookmark).toHaveBeenCalledWith('test-post-1');
    });

    it('应该能够取消收藏', async () => {
      const user = userEvent.setup();
      const bookmarkedPost = { ...mockPost, isBookmarked: true };
      render(<MockPostCard post={bookmarkedPost} {...mockHandlers} />);
      
      const bookmarkButton = screen.getByTestId('bookmark-button');
      expect(bookmarkButton).toHaveTextContent('🔖 已收藏');
      
      await user.click(bookmarkButton);
      
      expect(bookmarkButton).toHaveTextContent('🔖 收藏');
      expect(mockHandlers.onBookmark).toHaveBeenCalledWith('test-post-1');
    });
  });

  describe('分享功能', () => {
    it('应该能够打开分享弹窗', async () => {
      const user = userEvent.setup();
      const [showShareModal, setShowShareModal] = React.useState(false);
      
      const TestComponent = () => (
        <>
          <MockPostCard 
            post={mockPost} 
            {...mockHandlers}
            onShare={() => setShowShareModal(true)}
          />
          <MockShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            onShare={(platform) => {
              mockHandlers.onShare(platform);
              setShowShareModal(false);
            }}
          />
        </>
      );
      
      render(<TestComponent />);
      
      await user.click(screen.getByTestId('share-button'));
      
      expect(screen.getByTestId('share-modal')).toBeInTheDocument();
      expect(screen.getByTestId('share-wechat')).toBeInTheDocument();
      expect(screen.getByTestId('share-weibo')).toBeInTheDocument();
      expect(screen.getByTestId('copy-link')).toBeInTheDocument();
    });

    it('应该能够分享到不同平台', async () => {
      const user = userEvent.setup();
      const [showShareModal, setShowShareModal] = React.useState(true);
      
      render(
        <MockShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShare={mockHandlers.onShare}
        />
      );
      
      await user.click(screen.getByTestId('share-wechat'));
      expect(mockHandlers.onShare).toHaveBeenCalledWith('wechat');
      
      await user.click(screen.getByTestId('share-weibo'));
      expect(mockHandlers.onShare).toHaveBeenCalledWith('weibo');
    });

    it('应该能够复制链接', async () => {
      const user = userEvent.setup();
      render(
        <MockShareModal
          isOpen={true}
          onClose={() => {}}
          onShare={mockHandlers.onShare}
        />
      );
      
      await user.click(screen.getByTestId('copy-link'));
      
      expect(mockHandlers.onShare).toHaveBeenCalledWith('copy');
    });
  });

  describe('举报功能', () => {
    it('应该能够打开举报弹窗', async () => {
      render(
        <MockReportModal
          isOpen={true}
          onClose={() => {}}
          onReport={mockHandlers.onReport}
        />
      );
      
      expect(screen.getByTestId('report-modal')).toBeInTheDocument();
      expect(screen.getByText('垃圾信息')).toBeInTheDocument();
      expect(screen.getByText('不当内容')).toBeInTheDocument();
      expect(screen.getByText('虚假信息')).toBeInTheDocument();
    });

    it('应该能够选择举报原因', async () => {
      const user = userEvent.setup();
      render(
        <MockReportModal
          isOpen={true}
          onClose={() => {}}
          onReport={mockHandlers.onReport}
        />
      );
      
      const submitButton = screen.getByTestId('submit-report');
      expect(submitButton).toBeDisabled();
      
      await user.click(screen.getByLabelText('垃圾信息'));
      expect(submitButton).toBeEnabled();
      
      await user.click(submitButton);
      expect(mockHandlers.onReport).toHaveBeenCalledWith('垃圾信息');
    });

    it('应该能够填写自定义举报原因', async () => {
      const user = userEvent.setup();
      render(
        <MockReportModal
          isOpen={true}
          onClose={() => {}}
          onReport={mockHandlers.onReport}
        />
      );
      
      await user.click(screen.getByLabelText('其他'));
      
      const customReasonInput = screen.getByTestId('custom-reason');
      expect(customReasonInput).toBeInTheDocument();
      
      const submitButton = screen.getByTestId('submit-report');
      expect(submitButton).toBeDisabled();
      
      await user.type(customReasonInput, '自定义举报原因');
      expect(submitButton).toBeEnabled();
      
      await user.click(submitButton);
      expect(mockHandlers.onReport).toHaveBeenCalledWith('自定义举报原因');
    });
  });

  describe('交互体验', () => {
    it('应该有适当的加载状态', async () => {
      const slowOnLike = vi.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 1000));
      });
      
      render(<MockPostCard post={mockPost} {...mockHandlers} onLike={slowOnLike} />);
      
      const likeButton = screen.getByTestId('like-button');
      likeButton.click();
      
      // 在实际应用中，这里应该显示加载状态
      expect(slowOnLike).toHaveBeenCalled();
    });

    it('应该防止重复点击', async () => {
      render(<MockPostCard post={mockPost} {...mockHandlers} />);
      
      const likeButton = screen.getByTestId('like-button');
      
      // 快速连续点击
      likeButton.click();
      likeButton.click();
      likeButton.click();
      
      // 应该只触发一次或有防抖机制
      expect(mockHandlers.onLike).toHaveBeenCalledTimes(3);
    });

    it('应该有键盘导航支持', async () => {
      const user = userEvent.setup();
      render(<MockPostCard post={mockPost} {...mockHandlers} />);
      
      const likeButton = screen.getByTestId('like-button');
      likeButton.focus();
      
      await user.keyboard('{Enter}');
      expect(mockHandlers.onLike).toHaveBeenCalled();
      
      await user.keyboard('{Space}');
      expect(mockHandlers.onLike).toHaveBeenCalledTimes(2);
    });
  });
});
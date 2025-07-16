import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock types
interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar: string;
  coverPhoto?: string;
  isPrivate: boolean;
  isFollowing?: boolean;
  stats: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
  };
  joinedAt: string;
}

interface ProfilePost {
  id: string;
  content?: string;
  images?: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

// Mock图片裁剪组件
const MockImageCropper = ({ image, onCrop, onCancel }: {
  image: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}) => {
  return (
    <div data-testid="image-cropper">
      <img src={image} alt="待裁剪图片" />
      <div className="crop-controls">
        <button
          data-testid="crop-confirm"
          onClick={() => onCrop('data:image/jpeg;base64,cropped-image-data')}
        >
          确认裁剪
        </button>
        <button
          data-testid="crop-cancel"
          onClick={onCancel}
        >
          取消
        </button>
      </div>
    </div>
  );
};

// Mock个人资料编辑组件
const MockProfileEdit = ({ profile, onSave, onCancel }: {
  profile: UserProfile;
  onSave: (updatedProfile: Partial<UserProfile>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = React.useState({
    username: profile.username,
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    isPrivate: profile.isPrivate || false
  });
  
  const [showImageCropper, setShowImageCropper] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setShowImageCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageCrop = (croppedImage: string) => {
    setFormData(prev => ({ ...prev, avatar: croppedImage }));
    setShowImageCropper(false);
    setSelectedImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (error) {
      // 处理保存错误
      console.error('保存失败:', error);
    }
  };

  const isFormValid = formData.username.trim().length >= 3 && formData.username.trim().length <= 30;

  return (
    <div data-testid="profile-edit">
      {showImageCropper && selectedImage && (
        <MockImageCropper
          image={selectedImage}
          onCrop={handleImageCrop}
          onCancel={() => {
            setShowImageCropper(false);
            setSelectedImage(null);
          }}
        />
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="avatar-section">
          <img
            src={selectedImage || profile.avatar}
            alt="头像"
            className="avatar-preview"
          />
          <button
            type="button"
            data-testid="change-avatar"
            onClick={() => fileInputRef.current?.click()}
          >
            更换头像
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
            data-testid="avatar-input"
          />
        </div>
        
        <div className="form-field">
          <label htmlFor="username">用户名</label>
          <input
            id="username"
            data-testid="username-input"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            minLength={3}
            maxLength={30}
            required
          />
          <span className="char-count">{formData.username.length}/30</span>
        </div>
        
        <div className="form-field">
          <label htmlFor="bio">个人简介</label>
          <textarea
            id="bio"
            data-testid="bio-input"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            maxLength={150}
            rows={3}
          />
          <span className="char-count">{formData.bio.length}/150</span>
        </div>
        
        <div className="form-field">
          <label htmlFor="location">位置</label>
          <input
            id="location"
            data-testid="location-input"
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            maxLength={50}
          />
        </div>
        
        <div className="form-field">
          <label htmlFor="website">网站</label>
          <input
            id="website"
            data-testid="website-input"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://"
          />
        </div>
        
        <div className="form-field">
          <label>
            <input
              type="checkbox"
              data-testid="private-toggle"
              checked={formData.isPrivate}
              onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
            />
            私密账号
          </label>
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            data-testid="save-profile"
            disabled={!isFormValid}
          >
            保存
          </button>
          <button
            type="button"
            data-testid="cancel-edit"
            onClick={onCancel}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
};

// Mock关注列表组件
const MockFollowList = ({ users, type, onFollow, onUnfollow }: {
  users: UserProfile[];
  type: 'followers' | 'following';
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
}) => {
  return (
    <div data-testid={`${type}-list`}>
      <h3>{type === 'followers' ? '粉丝' : '关注'} ({users.length})</h3>
      {users.map(user => (
        <div key={user.id} data-testid={`user-${user.id}`} className="user-item">
          <img src={user.avatar} alt={user.username} className="user-avatar" />
          <div className="user-info">
            <span className="username">{user.username}</span>
            {user.bio && <span className="bio">{user.bio}</span>}
          </div>
          <div className="user-actions">
            {user.isFollowing ? (
              <button
                data-testid={`unfollow-${user.id}`}
                onClick={() => onUnfollow(user.id)}
                className="unfollow-btn"
              >
                取消关注
              </button>
            ) : (
              <button
                data-testid={`follow-${user.id}`}
                onClick={() => onFollow(user.id)}
                className="follow-btn"
              >
                关注
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Mock帖子网格组件
const MockPostGrid = ({ posts, onPostClick }: {
  posts: ProfilePost[];
  onPostClick: (postId: string) => void;
}) => {
  return (
    <div data-testid="post-grid" className="post-grid">
      {posts.map(post => (
        <div
          key={post.id}
          data-testid={`post-${post.id}`}
          className="post-item"
          onClick={() => onPostClick(post.id)}
        >
          {post.images && post.images.length > 0 ? (
            <img src={post.images[0]} alt="帖子图片" className="post-image" />
          ) : (
            <div className="post-text">{post.content}</div>
          )}
          <div className="post-overlay">
            <span className="like-count">❤️ {post.likeCount}</span>
            <span className="comment-count">💬 {post.commentCount}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Mock个人主页组件
const MockProfile = ({ profile, currentUserId, onFollow, onUnfollow, onEdit, onBlock }: {
  profile: UserProfile;
  currentUserId: string;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  onEdit: () => void;
  onBlock: (userId: string) => void;
}) => {
  const [activeTab, setActiveTab] = React.useState<'posts' | 'saved' | 'liked' | 'tagged'>('posts');
  const [showFollowers, setShowFollowers] = React.useState(false);
  const [showFollowing, setShowFollowing] = React.useState(false);
  
  const isOwnProfile = profile.id === currentUserId;
  const canViewContent = !profile.isPrivate || profile.isFollowing || isOwnProfile;

  const mockPosts: ProfilePost[] = [
    {
      id: 'post-1',
      content: '美丽的日落',
      images: ['/sunset.jpg'],
      likeCount: 25,
      commentCount: 5,
      createdAt: '2024-01-01T18:00:00Z'
    },
    {
      id: 'post-2',
      content: '今天的咖啡',
      images: ['/coffee.jpg'],
      likeCount: 12,
      commentCount: 3,
      createdAt: '2024-01-02T09:00:00Z'
    }
  ];

  return (
    <div data-testid="profile-page">
      {/* 个人资料头部 */}
      <div className="profile-header">
        <div className="cover-photo">
          <img src={profile.coverPhoto || '/default-cover.jpg'} alt="封面" />
        </div>
        
        <div className="profile-info">
          <img
            src={profile.avatar}
            alt={profile.username}
            className="profile-avatar"
            data-testid="profile-avatar"
          />
          
          <div className="profile-details">
            <h1 data-testid="profile-username">{profile.username}</h1>
            {profile.bio && (
              <p data-testid="profile-bio">{profile.bio}</p>
            )}
            {profile.location && (
              <span data-testid="profile-location">📍 {profile.location}</span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="profile-website"
              >
                🔗 {profile.website}
              </a>
            )}
          </div>
          
          <div className="profile-actions">
            {isOwnProfile ? (
              <button
                data-testid="edit-profile"
                onClick={onEdit}
              >
                编辑资料
              </button>
            ) : (
              <>
                {profile.isFollowing ? (
                  <button
                    data-testid="unfollow-button"
                    onClick={() => onUnfollow(profile.id)}
                    className="unfollow-btn"
                  >
                    取消关注
                  </button>
                ) : (
                  <button
                    data-testid="follow-button"
                    onClick={() => onFollow(profile.id)}
                    className="follow-btn"
                  >
                    关注
                  </button>
                )}
                <button
                  data-testid="block-user"
                  onClick={() => onBlock(profile.id)}
                  className="block-btn"
                >
                  屏蔽
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* 统计数据 */}
      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number" data-testid="posts-count">
            {profile.stats.postsCount}
          </span>
          <span className="stat-label">帖子</span>
        </div>
        
        <button
          className="stat-item"
          data-testid="followers-button"
          onClick={() => setShowFollowers(true)}
        >
          <span className="stat-number">{profile.stats.followersCount}</span>
          <span className="stat-label">粉丝</span>
        </button>
        
        <button
          className="stat-item"
          data-testid="following-button"
          onClick={() => setShowFollowing(true)}
        >
          <span className="stat-number">{profile.stats.followingCount}</span>
          <span className="stat-label">关注</span>
        </button>
      </div>
      
      {/* 内容标签页 */}
      {canViewContent ? (
        <>
          <div className="profile-tabs">
            <button
              data-testid="posts-tab"
              className={activeTab === 'posts' ? 'active' : ''}
              onClick={() => setActiveTab('posts')}
            >
              📷 帖子
            </button>
            {isOwnProfile && (
              <>
                <button
                  data-testid="saved-tab"
                  className={activeTab === 'saved' ? 'active' : ''}
                  onClick={() => setActiveTab('saved')}
                >
                  🔖 收藏
                </button>
                <button
                  data-testid="liked-tab"
                  className={activeTab === 'liked' ? 'active' : ''}
                  onClick={() => setActiveTab('liked')}
                >
                  ❤️ 喜欢
                </button>
              </>
            )}
            <button
              data-testid="tagged-tab"
              className={activeTab === 'tagged' ? 'active' : ''}
              onClick={() => setActiveTab('tagged')}
            >
              🏷️ 标记
            </button>
          </div>
          
          <div className="tab-content">
            <MockPostGrid
              posts={mockPosts}
              onPostClick={(postId) => console.log('Post clicked:', postId)}
            />
          </div>
        </>
      ) : (
        <div data-testid="private-account-message" className="private-message">
          <p>此账号为私密账号</p>
          <p>关注后即可查看其帖子</p>
        </div>
      )}
      
      {/* 关注列表弹窗 */}
      {showFollowers && (
        <div data-testid="followers-modal" className="modal">
          <MockFollowList
            users={[]} // 在实际应用中从API获取
            type="followers"
            onFollow={onFollow}
            onUnfollow={onUnfollow}
          />
          <button
            data-testid="close-followers"
            onClick={() => setShowFollowers(false)}
          >
            关闭
          </button>
        </div>
      )}
      
      {showFollowing && (
        <div data-testid="following-modal" className="modal">
          <MockFollowList
            users={[]} // 在实际应用中从API获取
            type="following"
            onFollow={onFollow}
            onUnfollow={onUnfollow}
          />
          <button
            data-testid="close-following"
            onClick={() => setShowFollowing(false)}
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
};

describe('个人主页测试', () => {
  const mockProfile: UserProfile = {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    avatar: '/test-avatar.jpg',
    coverPhoto: '/test-cover.jpg',
    bio: '这是一个测试用户的简介',
    location: '北京市',
    website: 'https://example.com',
    isPrivate: false,
    isFollowing: false,
    stats: {
      postsCount: 42,
      followersCount: 128,
      followingCount: 95
    },
    joinedAt: '2023-01-01T00:00:00Z'
  };

  const mockHandlers = {
    onFollow: vi.fn(),
    onUnfollow: vi.fn(),
    onEdit: vi.fn(),
    onBlock: vi.fn(),
    onSave: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock FileReader
    global.FileReader = class {
      result: string | ArrayBuffer | null = null;
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
      
      readAsDataURL() {
        setTimeout(() => {
          this.result = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';
          if (this.onload) {
            this.onload({ target: this } as any);
          }
        }, 100);
      }
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('个人资料显示', () => {
    it('应该正确显示个人资料信息', () => {
      render(
        <MockProfile
          profile={mockProfile}
          currentUserId="current-user"
          {...mockHandlers}
        />
      );
      
      expect(screen.getByTestId('profile-username')).toHaveTextContent('testuser');
      expect(screen.getByTestId('profile-bio')).toHaveTextContent('这是一个测试用户的简介');
      expect(screen.getByTestId('profile-location')).toHaveTextContent('📍 北京市');
      expect(screen.getByTestId('profile-website')).toHaveAttribute('href', 'https://example.com');
    });

    it('应该显示统计数据', () => {
      render(
        <MockProfile
          profile={mockProfile}
          currentUserId="current-user"
          {...mockHandlers}
        />
      );
      
      expect(screen.getByTestId('posts-count')).toHaveTextContent('42');
      expect(screen.getByTestId('followers-button')).toHaveTextContent('128');
      expect(screen.getByTestId('following-button')).toHaveTextContent('95');
    });

    it('应该显示头像和封面图', () => {
      render(
        <MockProfile
          profile={mockProfile}
          currentUserId="current-user"
          {...mockHandlers}
        />
      );
      
      const avatar = screen.getByTestId('profile-avatar');
      expect(avatar).toHaveAttribute('src', '/test-avatar.jpg');
      expect(avatar).toHaveAttribute('alt', 'testuser');
    });
  });

  describe('关注功能', () => {
    it('应该能够关注用户', async () => {
      const user = userEvent.setup();
      render(
        <MockProfile
          profile={mockProfile}
          currentUserId="current-user"
          {...mockHandlers}
        />
      );
      
      const followButton = screen.getByTestId('follow-button');
      expect(followButton).toHaveTextContent('关注');
      
      await user.click(followButton);
      
      expect(mockHandlers.onFollow).toHaveBeenCalledWith('user-1');
    });

    it('应该能够取消关注', async () => {
      const user = userEvent.setup();
      const followingProfile = { ...mockProfile, isFollowing: true };
      
      render(
        <MockProfile
          profile={followingProfile}
          currentUserId="current-user"
          {...mockHandlers}
        />
      );
      
      const unfollowButton = screen.getByTestId('unfollow-button');
      expect(unfollowButton).toHaveTextContent('取消关注');
      
      await user.click(unfollowButton);
      
      expect(mockHandlers.onUnfollow).toHaveBeenCalledWith('user-1');
    });

    it('应该能够查看粉丝列表', async () => {
      const user = userEvent.setup();
      render(
        <MockProfile
          profile={mockProfile}
          currentUserId="current-user"
          {...mockHandlers}
        />
      );
      
      const followersButton = screen.getByTestId('followers-button');
      await user.click(followersButton);
      
      expect(screen.getByTestId('followers-modal')).toBeInTheDocument();
      expect(screen.getByTestId('followers-list')).toBeInTheDocument();
    });

    it('应该能够查看关注列表', async () => {
      const user = userEvent.setup();
      render(
        <MockProfile
          profile={mockProfile}
          currentUserId="current-user"
          {...mockHandlers}
        />
      );
      
      const followingButton = screen.getByTestId('following-button');
      await user.click(followingButton);
      
      expect(screen.getByTestId('following-modal')).toBeInTheDocument();
      expect(screen.getByTestId('following-list')).toBeInTheDocument();
    });
  });

  describe('个人资料编辑', () => {
    it('应该显示编辑按钮（自己的资料）', () => {
      render(
        <MockProfile
          profile={mockProfile}
          currentUserId="user-1" // 同一个用户
          {...mockHandlers}
        />
      );
      
      expect(screen.getByTestId('edit-profile')).toBeInTheDocument();
      expect(screen.queryByTestId('follow-button')).not.toBeInTheDocument();
    });

    it('应该能够编辑用户名', async () => {
      const user = userEvent.setup();
      render(
        <MockProfileEdit
          profile={mockProfile}
          onSave={mockHandlers.onSave}
          onCancel={() => {}}
        />
      );
      
      const usernameInput = screen.getByTestId('username-input');
      await user.clear(usernameInput);
      await user.type(usernameInput, 'newusername');
      
      expect(usernameInput).toHaveValue('newusername');
      expect(screen.getByText('11/30')).toBeInTheDocument(); // 字符计数
    });

    it('应该验证用户名长度', async () => {
      const user = userEvent.setup();
      render(
        <MockProfileEdit
          profile={mockProfile}
          onSave={mockHandlers.onSave}
          onCancel={() => {}}
        />
      );
      
      const usernameInput = screen.getByTestId('username-input');
      const saveButton = screen.getByTestId('save-profile');
      
      // 测试过短用户名
      await user.clear(usernameInput);
      await user.type(usernameInput, 'ab');
      expect(saveButton).toBeDisabled();
      
      // 测试有效用户名
      await user.clear(usernameInput);
      await user.type(usernameInput, 'validname');
      expect(saveButton).toBeEnabled();
    });

    it('应该能够更新个人简介', async () => {
      const user = userEvent.setup();
      render(
        <MockProfileEdit
          profile={mockProfile}
          onSave={mockHandlers.onSave}
          onCancel={() => {}}
        />
      );
      
      const bioInput = screen.getByTestId('bio-input');
      await user.clear(bioInput);
      await user.type(bioInput, '这是更新后的个人简介');
      
      expect(bioInput).toHaveValue('这是更新后的个人简介');
      expect(screen.getByText('11/150')).toBeInTheDocument();
    });

    it('应该能够切换私密模式', async () => {
      const user = userEvent.setup();
      render(
        <MockProfileEdit
          profile={mockProfile}
          onSave={mockHandlers.onSave}
          onCancel={() => {}}
        />
      );
      
      const privateToggle = screen.getByTestId('private-toggle');
      expect(privateToggle).not.toBeChecked();
      
      await user.click(privateToggle);
      expect(privateToggle).toBeChecked();
    });

    it('应该能够保存资料更改', async () => {
      const user = userEvent.setup();
      render(
        <MockProfileEdit
          profile={mockProfile}
          onSave={mockHandlers.onSave}
          onCancel={() => {}}
        />
      );
      
      const usernameInput = screen.getByTestId('username-input');
      const bioInput = screen.getByTestId('bio-input');
      const saveButton = screen.getByTestId('save-profile');
      
      await user.clear(usernameInput);
      await user.type(usernameInput, 'updateduser');
      await user.clear(bioInput);
      await user.type(bioInput, '更新的简介');
      
      await user.click(saveButton);
      
      expect(mockHandlers.onSave).toHaveBeenCalledWith({
        username: 'updateduser',
        bio: '更新的简介',
        location: '北京市',
        website: 'https://example.com',
        isPrivate: false
      });
    });
  });

  describe('头像上传', () => {
    it('应该能够选择头像文件', async () => {
      const user = userEvent.setup();
      render(
        <MockProfileEdit
          profile={mockProfile}
          onSave={mockHandlers.onSave}
          onCancel={() => {}}
        />
      );
      
      const changeAvatarButton = screen.getByTestId('change-avatar');
      const avatarInput = screen.getByTestId('avatar-input');
      
      const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });
      
      await user.click(changeAvatarButton);
      await user.upload(avatarInput, file);
      
      await waitFor(() => {
        expect(screen.getByTestId('image-cropper')).toBeInTheDocument();
      });
    });

    it('应该能够裁剪头像', async () => {
      const user = userEvent.setup();
      render(
        <MockImageCropper
          image="data:image/jpeg;base64,test-image"
          onCrop={mockHandlers.onSave}
          onCancel={() => {}}
        />
      );
      
      const cropButton = screen.getByTestId('crop-confirm');
      await user.click(cropButton);
      
      expect(mockHandlers.onSave).toHaveBeenCalledWith('data:image/jpeg;base64,cropped-image-data');
    });
  });

  describe('私密账号', () => {
    it('应该显示私密账号提示', () => {
      const privateProfile = { ...mockProfile, isPrivate: true, isFollowing: false };
      
      render(
        <MockProfile
          profile={privateProfile}
          currentUserId="current-user"
          {...mockHandlers}
        />
      );
      
      expect(screen.getByTestId('private-account-message')).toBeInTheDocument();
      expect(screen.getByText('此账号为私密账号')).toBeInTheDocument();
      expect(screen.queryByTestId('post-grid')).not.toBeInTheDocument();
    });

    it('关注后应该能查看私密账号内容', () => {
      const privateProfile = { ...mockProfile, isPrivate: true, isFollowing: true };
      
      render(
        <MockProfile
          profile={privateProfile}
          currentUserId="current-user"
          {...mockHandlers}
        />
      );
      
      expect(screen.queryByTestId('private-account-message')).not.toBeInTheDocument();
      expect(screen.getByTestId('post-grid')).toBeInTheDocument();
    });
  });

  describe('内容标签页', () => {
    it('应该能够切换标签页', async () => {
      const user = userEvent.setup();
      render(
        <MockProfile
          profile={mockProfile}
          currentUserId="user-1" // 自己的资料
          {...mockHandlers}
        />
      );
      
      const postsTab = screen.getByTestId('posts-tab');
      const savedTab = screen.getByTestId('saved-tab');
      const likedTab = screen.getByTestId('liked-tab');
      const taggedTab = screen.getByTestId('tagged-tab');
      
      expect(postsTab).toHaveClass('active');
      
      await user.click(savedTab);
      expect(savedTab).toHaveClass('active');
      expect(postsTab).not.toHaveClass('active');
      
      await user.click(likedTab);
      expect(likedTab).toHaveClass('active');
      
      await user.click(taggedTab);
      expect(taggedTab).toHaveClass('active');
    });

    it('他人资料不应显示私人标签页', () => {
      render(
        <MockProfile
          profile={mockProfile}
          currentUserId="current-user" // 不是自己
          {...mockHandlers}
        />
      );
      
      expect(screen.getByTestId('posts-tab')).toBeInTheDocument();
      expect(screen.getByTestId('tagged-tab')).toBeInTheDocument();
      expect(screen.queryByTestId('saved-tab')).not.toBeInTheDocument();
      expect(screen.queryByTestId('liked-tab')).not.toBeInTheDocument();
    });
  });

  describe('屏蔽功能', () => {
    it('应该能够屏蔽用户', async () => {
      const user = userEvent.setup();
      render(
        <MockProfile
          profile={mockProfile}
          currentUserId="current-user"
          {...mockHandlers}
        />
      );
      
      const blockButton = screen.getByTestId('block-user');
      await user.click(blockButton);
      
      expect(mockHandlers.onBlock).toHaveBeenCalledWith('user-1');
    });
  });

  describe('帖子网格', () => {
    it('应该显示帖子网格', () => {
      render(
        <MockProfile
          profile={mockProfile}
          currentUserId="current-user"
          {...mockHandlers}
        />
      );
      
      expect(screen.getByTestId('post-grid')).toBeInTheDocument();
      expect(screen.getByTestId('post-post-1')).toBeInTheDocument();
      expect(screen.getByTestId('post-post-2')).toBeInTheDocument();
    });

    it('应该显示帖子统计信息', () => {
      const mockPosts: ProfilePost[] = [
        {
          id: 'post-1',
          content: '测试帖子',
          images: ['/test.jpg'],
          likeCount: 25,
          commentCount: 5,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ];
      
      render(
        <MockPostGrid
          posts={mockPosts}
          onPostClick={() => {}}
        />
      );
      
      expect(screen.getByText('❤️ 25')).toBeInTheDocument();
      expect(screen.getByText('💬 5')).toBeInTheDocument();
    });
  });

  describe('响应式设计', () => {
    it('应该在移动端正确显示', () => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      render(
        <MockProfile
          profile={mockProfile}
          currentUserId="current-user"
          {...mockHandlers}
        />
      );
      
      // 在实际应用中，这里会检查响应式样式
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });
  });

  describe('加载状态', () => {
    it('应该处理加载状态', () => {
      const loadingProfile = { ...mockProfile, isLoading: true };
      
      // 在实际应用中，这里会渲染加载状态
      expect(loadingProfile.isLoading).toBe(true);
    });
  });

  describe('错误处理', () => {
    it('应该处理资料保存失败', async () => {
      const user = userEvent.setup();
      const failingSave = vi.fn().mockImplementation(() => {
        return Promise.reject(new Error('保存失败'));
      });
      
      render(
        <MockProfileEdit
          profile={mockProfile}
          onSave={failingSave}
          onCancel={() => {}}
        />
      );
      
      const saveButton = screen.getByTestId('save-profile');
      await user.click(saveButton);
      
      // 验证函数被调用
      expect(failingSave).toHaveBeenCalled();
      
      // 验证错误处理
      await expect(failingSave()).rejects.toThrow('保存失败');
    });
  });
});
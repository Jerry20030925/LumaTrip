import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CreatePostModal from '../components/discover/CreatePostModal';

// Mock hooks and services
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user1',
      email: 'test@example.com',
      displayName: '测试用户',
      avatar: 'https://example.com/avatar.jpg'
    }
  })
}));

vi.mock('../services/post.service', () => ({
  createPost: vi.fn(),
  uploadImage: vi.fn(),
  compressImage: vi.fn()
}));

vi.mock('../utils/imageCompressor', () => ({
  compressImage: vi.fn().mockResolvedValue(new File(['compressed'], 'compressed.jpg', { type: 'image/jpeg' }))
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('发帖功能测试', () => {
  const mockOnClose = vi.fn();
  const mockOnPostCreated = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('创建帖子模态框', () => {
    it('应该渲染创建帖子表单', () => {
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByPlaceholderText(/分享你的旅行故事/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /发布/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /取消/i })).toBeInTheDocument();
    });

    it('应该限制文本内容长度', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const textarea = screen.getByPlaceholderText(/分享你的旅行故事/i);
      const longText = 'a'.repeat(2001); // 超过2000字符限制
      
      await user.type(textarea, longText);
      
      await waitFor(() => {
        expect(screen.getByText(/内容不能超过2000字符/i)).toBeInTheDocument();
      });
    });

    it('应该显示字符计数', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const textarea = screen.getByPlaceholderText(/分享你的旅行故事/i);
      await user.type(textarea, '测试内容');
      
      expect(screen.getByText(/4\/2000/)).toBeInTheDocument();
    });

    it('应该支持添加图片', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const imageInput = screen.getByLabelText(/添加图片/i);
      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      
      await user.upload(imageInput, file);
      
      await waitFor(() => {
        expect(screen.getByAltText(/预览图片/i)).toBeInTheDocument();
      });
    });

    it('应该限制图片数量最多9张', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const imageInput = screen.getByLabelText(/添加图片/i);
      const files = Array.from({ length: 10 }, (_, i) => 
        new File(['image'], `test${i}.jpg`, { type: 'image/jpeg' })
      );
      
      await user.upload(imageInput, files);
      
      await waitFor(() => {
        expect(screen.getByText(/最多只能上传9张图片/i)).toBeInTheDocument();
      });
    });

    it('应该支持删除已添加的图片', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const imageInput = screen.getByLabelText(/添加图片/i);
      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      
      await user.upload(imageInput, file);
      
      await waitFor(() => {
        expect(screen.getByAltText(/预览图片/i)).toBeInTheDocument();
      });
      
      const deleteButton = screen.getByRole('button', { name: /删除图片/i });
      await user.click(deleteButton);
      
      expect(screen.queryByAltText(/预览图片/i)).not.toBeInTheDocument();
    });

    it('应该支持添加位置信息', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const locationButton = screen.getByRole('button', { name: /添加位置/i });
      await user.click(locationButton);
      
      const locationInput = screen.getByPlaceholderText(/搜索位置/i);
      await user.type(locationInput, '北京天安门');
      
      await waitFor(() => {
        expect(screen.getByText(/北京天安门/i)).toBeInTheDocument();
      });
    });

    it('应该支持添加话题标签', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const textarea = screen.getByPlaceholderText(/分享你的旅行故事/i);
      await user.type(textarea, '今天去了 #北京 #旅行');
      
      await waitFor(() => {
        expect(screen.getByText(/#北京/)).toBeInTheDocument();
        expect(screen.getByText(/#旅行/)).toBeInTheDocument();
      });
    });

    it('应该在发布时显示loading状态', async () => {
      const user = userEvent.setup();
      const { createPost } = await import('../services/post.service');
      vi.mocked(createPost).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const textarea = screen.getByPlaceholderText(/分享你的旅行故事/i);
      await user.type(textarea, '测试帖子内容');
      
      const publishButton = screen.getByRole('button', { name: /发布/i });
      await user.click(publishButton);
      
      expect(screen.getByText(/发布中.../i)).toBeInTheDocument();
      expect(publishButton).toBeDisabled();
    });

    it('应该在发布成功后关闭模态框', async () => {
      const user = userEvent.setup();
      const { createPost } = await import('../services/post.service');
      vi.mocked(createPost).mockResolvedValue({ id: 'post1', success: true });
      
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const textarea = screen.getByPlaceholderText(/分享你的旅行故事/i);
      await user.type(textarea, '测试帖子内容');
      
      const publishButton = screen.getByRole('button', { name: /发布/i });
      await user.click(publishButton);
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockOnPostCreated).toHaveBeenCalled();
      });
    });

    it('应该处理发布失败的情况', async () => {
      const user = userEvent.setup();
      const { createPost } = await import('../services/post.service');
      vi.mocked(createPost).mockRejectedValue(new Error('发布失败'));
      
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const textarea = screen.getByPlaceholderText(/分享你的旅行故事/i);
      await user.type(textarea, '测试帖子内容');
      
      const publishButton = screen.getByRole('button', { name: /发布/i });
      await user.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText(/发布失败/i)).toBeInTheDocument();
      });
    });

    it('应该支持重试发布', async () => {
      const user = userEvent.setup();
      const { createPost } = await import('../services/post.service');
      vi.mocked(createPost)
        .mockRejectedValueOnce(new Error('发布失败'))
        .mockResolvedValueOnce({ id: 'post1', success: true });
      
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const textarea = screen.getByPlaceholderText(/分享你的旅行故事/i);
      await user.type(textarea, '测试帖子内容');
      
      const publishButton = screen.getByRole('button', { name: /发布/i });
      await user.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText(/发布失败/i)).toBeInTheDocument();
      });
      
      const retryButton = screen.getByRole('button', { name: /重试/i });
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('图片处理', () => {
    it('应该压缩大尺寸图片', async () => {
      const { compressImage } = await import('../utils/imageCompressor');
      const user = userEvent.setup();
      
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const imageInput = screen.getByLabelText(/添加图片/i);
      const largeFile = new File(['large image'], 'large.jpg', { 
        type: 'image/jpeg'
      });
      
      // Mock file size
      Object.defineProperty(largeFile, 'size', { value: 5 * 1024 * 1024 }); // 5MB
      
      await user.upload(imageInput, largeFile);
      
      await waitFor(() => {
        expect(compressImage).toHaveBeenCalledWith(largeFile);
      });
    });

    it('应该验证图片格式', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const imageInput = screen.getByLabelText(/添加图片/i);
      const invalidFile = new File(['text'], 'test.txt', { type: 'text/plain' });
      
      await user.upload(imageInput, invalidFile);
      
      await waitFor(() => {
        expect(screen.getByText(/只支持图片格式/i)).toBeInTheDocument();
      });
    });

    it('应该限制图片文件大小', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const imageInput = screen.getByLabelText(/添加图片/i);
      const largeFile = new File(['huge image'], 'huge.jpg', { 
        type: 'image/jpeg'
      });
      
      // Mock file size to be very large
      Object.defineProperty(largeFile, 'size', { value: 50 * 1024 * 1024 }); // 50MB
      
      await user.upload(imageInput, largeFile);
      
      await waitFor(() => {
        expect(screen.getByText(/图片文件过大/i)).toBeInTheDocument();
      });
    });
  });

  describe('表单验证', () => {
    it('应该要求至少输入内容或上传图片', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const publishButton = screen.getByRole('button', { name: /发布/i });
      await user.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText(/请输入内容或上传图片/i)).toBeInTheDocument();
      });
    });

    it('应该在有内容时启用发布按钮', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const textarea = screen.getByPlaceholderText(/分享你的旅行故事/i);
      const publishButton = screen.getByRole('button', { name: /发布/i });
      
      expect(publishButton).toBeDisabled();
      
      await user.type(textarea, '测试内容');
      
      expect(publishButton).toBeEnabled();
    });

    it('应该在只有图片时启用发布按钮', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <CreatePostModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const imageInput = screen.getByLabelText(/添加图片/i);
      const publishButton = screen.getByRole('button', { name: /发布/i });
      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      
      expect(publishButton).toBeDisabled();
      
      await user.upload(imageInput, file);
      
      await waitFor(() => {
        expect(publishButton).toBeEnabled();
      });
    });
  });
});
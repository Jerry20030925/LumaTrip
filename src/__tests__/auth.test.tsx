import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { useAuth } from '../hooks/useAuth';

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/login' })
  };
});

const mockUseAuth = vi.mocked(useAuth);

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('认证功能测试', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
      // loginWithApple: vi.fn(),
      // // resetPassword: vi.fn()
    });
  });

  describe('登录页面', () => {
    it('应该渲染登录表单', () => {
      renderWithRouter(<Login />);
      
      expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
    });

    it('应该验证邮箱格式', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText(/邮箱/i);
      await user.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: /登录/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/请输入有效的邮箱地址/i)).toBeInTheDocument();
      });
    });

    it('应该验证密码长度', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);
      
      const passwordInput = screen.getByLabelText(/密码/i);
      await user.type(passwordInput, '123');
      
      const submitButton = screen.getByRole('button', { name: /登录/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/密码至少需要6位/i)).toBeInTheDocument();
      });
    });

    it('应该调用登录函数', async () => {
      const mockLogin = vi.fn().mockResolvedValue({ success: true });
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
        // loginWithApple: vi.fn(),
        // resetPassword: vi.fn()
      });

      const user = userEvent.setup();
      renderWithRouter(<Login />);
      
      await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
      await user.type(screen.getByLabelText(/密码/i), 'password123');
      await user.click(screen.getByRole('button', { name: /登录/i }));
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('应该显示Google登录按钮', () => {
      renderWithRouter(<Login />);
      
      expect(screen.getByRole('button', { name: /Google 登录/i })).toBeInTheDocument();
    });

    it('应该显示Apple登录按钮', () => {
      renderWithRouter(<Login />);
      
      expect(screen.getByRole('button', { name: /Apple 登录/i })).toBeInTheDocument();
    });

    it('应该处理登录错误', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
        // loginWithApple: vi.fn(),
        // resetPassword: vi.fn()
      });

      const user = userEvent.setup();
      renderWithRouter(<Login />);
      
      await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
      await user.type(screen.getByLabelText(/密码/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /登录/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/登录失败/i)).toBeInTheDocument();
      });
    });
  });

  describe('注册页面', () => {
    it('应该渲染注册表单', () => {
      renderWithRouter(<Register />);
      
      expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/确认密码/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /注册/i })).toBeInTheDocument();
    });

    it('应该验证密码强度', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      
      const passwordInput = screen.getByLabelText(/^密码$/i);
      await user.type(passwordInput, 'weak');
      
      await waitFor(() => {
        expect(screen.getByText(/密码强度：弱/i)).toBeInTheDocument();
      });
    });

    it('应该验证密码确认', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      
      await user.type(screen.getByLabelText(/^密码$/i), 'password123');
      await user.type(screen.getByLabelText(/确认密码/i), 'different');
      
      const submitButton = screen.getByRole('button', { name: /注册/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/密码不匹配/i)).toBeInTheDocument();
      });
    });

    it('应该调用注册函数', async () => {
      const mockRegister = vi.fn().mockResolvedValue({ success: true });
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: mockRegister,
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
        // loginWithApple: vi.fn(),
        // resetPassword: vi.fn()
      });

      const user = userEvent.setup();
      renderWithRouter(<Register />);
      
      await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^密码$/i), 'password123');
      await user.type(screen.getByLabelText(/确认密码/i), 'password123');
      await user.click(screen.getByRole('button', { name: /注册/i }));
      
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('应该显示用户协议复选框', () => {
      renderWithRouter(<Register />);
      
      expect(screen.getByLabelText(/同意用户协议/i)).toBeInTheDocument();
    });

    it('应该要求同意用户协议', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      
      await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^密码$/i), 'password123');
      await user.type(screen.getByLabelText(/确认密码/i), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /注册/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/请同意用户协议/i)).toBeInTheDocument();
      });
    });
  });

  describe('OAuth 登录', () => {
    it('应该调用Google登录', async () => {
      const mockGoogleLogin = vi.fn().mockResolvedValue({ success: true });
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: mockGoogleLogin,
        // loginWithApple: vi.fn(),
        // resetPassword: vi.fn()
      });

      const user = userEvent.setup();
      renderWithRouter(<Login />);
      
      await user.click(screen.getByRole('button', { name: /Google 登录/i }));
      
      expect(mockGoogleLogin).toHaveBeenCalled();
    });

    it('应该调用Apple登录', async () => {
      const mockAppleLogin = vi.fn().mockResolvedValue({ success: true });
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
        // loginWithApple: mockAppleLogin,
        // resetPassword: vi.fn()
      });

      const user = userEvent.setup();
      renderWithRouter(<Login />);
      
      await user.click(screen.getByRole('button', { name: /Apple 登录/i }));
      
      expect(mockAppleLogin).toHaveBeenCalled();
    });
  });

  describe('密码重置', () => {
    it('应该显示忘记密码链接', () => {
      renderWithRouter(<Login />);
      
      expect(screen.getByText(/忘记密码/i)).toBeInTheDocument();
    });

    it('应该调用密码重置函数', async () => {
      const mockResetPassword = vi.fn().mockResolvedValue({ success: true });
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
        // loginWithApple: vi.fn(),
        // resetPassword: mockResetPassword
      });

      const user = userEvent.setup();
      renderWithRouter(<Login />);
      
      await user.click(screen.getByText(/忘记密码/i));
      
      // 假设会弹出一个模态框
      const emailInput = screen.getByPlaceholderText(/请输入邮箱/i);
      await user.type(emailInput, 'test@example.com');
      
      const resetButton = screen.getByRole('button', { name: /发送重置邮件/i });
      await user.click(resetButton);
      
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });
});
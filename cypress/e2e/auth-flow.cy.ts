describe('认证流程 E2E 测试', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('用户注册流程', () => {
    it('应该完成完整的注册流程', () => {
      // 访问注册页面
      cy.get('[data-testid="register-link"]').click();
      cy.url().should('include', '/register');

      // 填写注册表单
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('TestPassword123!');
      cy.get('[data-testid="confirm-password-input"]').type('TestPassword123!');
      
      // 同意用户协议
      cy.get('[data-testid="terms-checkbox"]').check();
      
      // 提交注册
      cy.get('[data-testid="register-button"]').click();
      
      // 验证注册成功
      cy.get('[data-testid="success-message"]').should('contain', '注册成功');
      cy.url().should('include', '/verify-email');
    });

    it('应该验证邮箱格式', () => {
      cy.get('[data-testid="register-link"]').click();
      
      cy.get('[data-testid="email-input"]').type('invalid-email');
      cy.get('[data-testid="password-input"]').type('TestPassword123!');
      cy.get('[data-testid="register-button"]').click();
      
      cy.get('[data-testid="email-error"]').should('contain', '请输入有效的邮箱地址');
    });

    it('应该验证密码强度', () => {
      cy.get('[data-testid="register-link"]').click();
      
      cy.get('[data-testid="password-input"]').type('weak');
      cy.get('[data-testid="password-strength"]').should('contain', '弱');
      
      cy.get('[data-testid="password-input"]').clear().type('StrongPassword123!');
      cy.get('[data-testid="password-strength"]').should('contain', '强');
    });

    it('应该验证密码确认', () => {
      cy.get('[data-testid="register-link"]').click();
      
      cy.get('[data-testid="password-input"]').type('TestPassword123!');
      cy.get('[data-testid="confirm-password-input"]').type('DifferentPassword');
      cy.get('[data-testid="register-button"]').click();
      
      cy.get('[data-testid="password-error"]').should('contain', '密码不匹配');
    });
  });

  describe('用户登录流程', () => {
    beforeEach(() => {
      // 假设已有测试用户
      cy.task('createTestUser', {
        email: 'test@example.com',
        password: 'TestPassword123!'
      });
    });

    it('应该完成邮箱密码登录', () => {
      cy.get('[data-testid="login-link"]').click();
      cy.url().should('include', '/login');

      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('TestPassword123!');
      cy.get('[data-testid="login-button"]').click();

      // 验证登录成功
      cy.url().should('include', '/home');
      cy.get('[data-testid="user-avatar"]').should('be.visible');
    });

    it('应该处理登录错误', () => {
      cy.get('[data-testid="login-link"]').click();
      
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();
      
      cy.get('[data-testid="error-message"]').should('contain', '登录失败');
    });

    it('应该支持记住登录状态', () => {
      cy.get('[data-testid="login-link"]').click();
      
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('TestPassword123!');
      cy.get('[data-testid="remember-checkbox"]').check();
      cy.get('[data-testid="login-button"]').click();
      
      // 刷新页面验证登录状态保持
      cy.reload();
      cy.get('[data-testid="user-avatar"]').should('be.visible');
    });

    it('应该支持Google登录', () => {
      cy.get('[data-testid="login-link"]').click();
      
      // Mock Google OAuth
      cy.window().then((win) => {
        cy.stub(win, 'open').as('googleLogin');
      });
      
      cy.get('[data-testid="google-login-button"]').click();
      cy.get('@googleLogin').should('have.been.called');
    });

    it('应该支持Apple登录', () => {
      cy.get('[data-testid="login-link"]').click();
      
      // Mock Apple OAuth
      cy.window().then((win) => {
        cy.stub(win, 'open').as('appleLogin');
      });
      
      cy.get('[data-testid="apple-login-button"]').click();
      cy.get('@appleLogin').should('have.been.called');
    });
  });

  describe('密码重置流程', () => {
    it('应该发送密码重置邮件', () => {
      cy.get('[data-testid="login-link"]').click();
      cy.get('[data-testid="forgot-password-link"]').click();
      
      cy.get('[data-testid="reset-email-input"]').type('test@example.com');
      cy.get('[data-testid="send-reset-button"]').click();
      
      cy.get('[data-testid="success-message"]').should('contain', '重置邮件已发送');
    });

    it('应该处理无效邮箱', () => {
      cy.get('[data-testid="login-link"]').click();
      cy.get('[data-testid="forgot-password-link"]').click();
      
      cy.get('[data-testid="reset-email-input"]').type('nonexistent@example.com');
      cy.get('[data-testid="send-reset-button"]').click();
      
      cy.get('[data-testid="error-message"]').should('contain', '邮箱不存在');
    });
  });

  describe('登出流程', () => {
    beforeEach(() => {
      // 先登录
      cy.task('createTestUser', {
        email: 'test@example.com',
        password: 'TestPassword123!'
      });
      
      cy.get('[data-testid="login-link"]').click();
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('TestPassword123!');
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/home');
    });

    it('应该成功登出', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();
      
      // 验证登出成功
      cy.url().should('include', '/login');
      cy.get('[data-testid="user-avatar"]').should('not.exist');
    });

    it('应该清除登录状态', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();
      
      // 刷新页面验证登录状态已清除
      cy.reload();
      cy.url().should('include', '/login');
    });
  });

  describe('会话管理', () => {
    it('应该检测会话过期', () => {
      // 模拟会话过期
      cy.window().then((win) => {
        win.localStorage.removeItem('auth_token');
      });
      
      cy.visit('/home');
      cy.url().should('include', '/login');
      cy.get('[data-testid="session-expired-message"]').should('contain', '会话已过期');
    });

    it('应该支持多设备登录检测', () => {
      // 模拟在另一设备登录
      cy.task('simulateAnotherDeviceLogin', 'test@example.com');
      
      cy.visit('/home');
      cy.get('[data-testid="multiple-login-warning"]').should('contain', '检测到多设备登录');
    });
  });

  describe('响应式设计', () => {
    it('应该在移动端正常显示', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="login-link"]').click();
      
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="mobile-layout"]').should('have.class', 'mobile');
    });

    it('应该在平板端正常显示', () => {
      cy.viewport('ipad-2');
      cy.get('[data-testid="login-link"]').click();
      
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="tablet-layout"]').should('have.class', 'tablet');
    });
  });

  describe('无障碍访问', () => {
    it('应该支持键盘导航', () => {
      cy.get('[data-testid="login-link"]').click();
      
      cy.get('body').type('{tab}');
      cy.focused().should('have.attr', 'data-testid', 'email-input');
      
      cy.focused().type('{tab}');
      cy.focused().should('have.attr', 'data-testid', 'password-input');
      
      cy.focused().type('{tab}');
      cy.focused().should('have.attr', 'data-testid', 'login-button');
    });

    it('应该有正确的ARIA标签', () => {
      cy.get('[data-testid="login-link"]').click();
      
      cy.get('[data-testid="email-input"]').should('have.attr', 'aria-label', '邮箱');
      cy.get('[data-testid="password-input"]').should('have.attr', 'aria-label', '密码');
      cy.get('[data-testid="login-button"]').should('have.attr', 'aria-label', '登录');
    });
  });
});
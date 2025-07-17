# LumaTrip 测试指南

本文档提供了 LumaTriip 项目的完整测试指南，包括单元测试、集成测试、E2E 测试、性能测试和压力测试。

## 📋 目录

- [环境准备](#环境准备)
- [测试类型](#测试类型)
- [快速开始](#快速开始)
- [详细测试命令](#详细测试命令)
- [CI/CD 集成](#cicd-集成)
- [测试最佳实践](#测试最佳实践)
- [故障排除](#故障排除)

## 🚀 环境准备

### 1. 安装依赖

```bash
# 安装所有依赖（包括测试依赖）
npm install

# 或者只安装测试相关依赖
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D cypress artillery @lhci/cli puppeteer
```

### 2. 环境变量配置

创建 `.env.test` 文件：

```bash
# 测试环境配置
VITE_SUPABASE_URL=your_test_supabase_url
VITE_SUPABASE_ANON_KEY=your_test_supabase_key
VITE_APP_ENV=test

# Cypress 测试用户
CYPRESS_TEST_EMAIL=test@example.com
CYPRESS_TEST_PASSWORD=testpassword123

# API 基础 URL
CYPRESS_API_BASE_URL=http://localhost:5173
```

## 🧪 测试类型

### 单元测试 (Vitest)
- **框架**: Vitest + React Testing Library
- **覆盖范围**: 组件、工具函数、Hooks
- **目标覆盖率**: 80%+

### 集成测试
- **范围**: 组件间交互、API 集成
- **工具**: Vitest + MSW (Mock Service Worker)

### E2E 测试 (Cypress)
- **范围**: 完整用户流程
- **浏览器**: Chrome, Firefox, Edge
- **设备**: 桌面端、移动端

### 性能测试
- **工具**: Lighthouse CI, Puppeteer
- **指标**: FCP, LCP, CLS, FID
- **目标**: 性能分数 90+

### 压力测试
- **工具**: Artillery
- **场景**: 并发用户、高负载
- **指标**: 响应时间、错误率

## ⚡ 快速开始

### 运行所有测试

```bash
# 运行完整测试套件
npm run test:all

# 或者使用脚本
./scripts/test-all.sh
```

### 开发时测试

```bash
# 监听模式运行单元测试
npm run test:watch

# 打开测试 UI
npm run test:ui

# 打开 Cypress
npm run cypress:open
```

## 📝 详细测试命令

### 单元测试

```bash
# 运行所有单元测试
npm run test

# 运行特定测试文件
npm run test auth.test.tsx

# 生成覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch

# UI 模式
npm run test:ui
```

### E2E 测试

```bash
# 打开 Cypress 界面
npm run cypress:open

# 无头模式运行
npm run cypress:run

# 指定浏览器
npm run cypress:run:chrome
npm run cypress:run:firefox

# 运行特定测试
npx cypress run --spec "cypress/e2e/auth-flow.cy.ts"
```

### 性能测试

```bash
# Lighthouse CI
npm run lighthouse

# 自定义性能测试
npm run performance:test

# 只收集数据
npm run lighthouse:collect

# 只运行断言
npm run lighthouse:assert
```

### 压力测试

```bash
# 运行压力测试
npm run load:test

# 指定配置文件
artillery run artillery-config.yml

# 生成报告
artillery run artillery-config.yml --output results.json
artillery report results.json
```

### API 测试

```bash
# 运行 API 测试
npm run test:api

# 测试特定 API
npm run test src/__tests__/api/auth.test.ts
```

## 🔧 代码质量检查

```bash
# ESLint 检查
npm run lint

# 自动修复
npm run lint:fix

# TypeScript 类型检查
npm run type-check

# 代码格式化
npm run format

# 检查格式
npm run format:check

# 部署前检查
npm run pre-deploy-check
```

## 📊 测试报告

### 查看报告

```bash
# 单元测试覆盖率
open coverage/index.html

# Cypress 测试报告
open cypress/reports/index.html

# Lighthouse 报告
open .lighthouseci/index.html

# 性能测试报告
open performance-report.html
```

### 生成报告

```bash
# 生成所有报告
npm run test:all

# 查看报告目录
ls -la test-reports/
```

## 🏗️ CI/CD 集成

### GitHub Actions

项目已配置 GitHub Actions 工作流 (`.github/workflows/test.yml`)：

- ✅ 代码质量检查
- ✅ 单元测试 + 覆盖率
- ✅ E2E 测试（多浏览器）
- ✅ 性能测试
- ✅ 压力测试
- ✅ 安全扫描
- ✅ 构建测试
- ✅ 自动部署

### 本地 CI 模拟

```bash
# 模拟 CI 环境
act -j test

# 运行特定作业
act -j unit-tests
```

## 📋 测试清单

### 功能测试清单

#### 认证系统
- [ ] 邮箱注册
- [ ] 邮箱验证
- [ ] 密码登录
- [ ] OAuth 登录 (Google/Apple)
- [ ] 密码重置
- [ ] 登录状态保持
- [ ] 多设备登录检测
- [ ] 退出登录

#### 发现页面
- [ ] 瀑布流加载
- [ ] 下拉刷新
- [ ] 上拉加载更多
- [ ] 图片懒加载
- [ ] 视频自动播放
- [ ] 标签筛选
- [ ] 搜索功能
- [ ] 地理位置筛选

#### 消息系统
- [ ] 发送文本消息
- [ ] 发送图片消息
- [ ] 发送表情
- [ ] 实时消息接收
- [ ] 消息已读状态
- [ ] 消息撤回
- [ ] 群聊功能
- [ ] 消息搜索

#### 个人中心
- [ ] 查看个人资料
- [ ] 编辑个人资料
- [ ] 头像上传裁剪
- [ ] 封面图更换
- [ ] 关注/取消关注
- [ ] 粉丝/关注列表
- [ ] 私密模式切换

### 性能测试清单

- [ ] 首屏加载时间 < 3s
- [ ] FCP < 2s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] FID < 100ms
- [ ] 性能分数 > 90
- [ ] 无内存泄漏
- [ ] 图片优化
- [ ] 代码分割

### 兼容性测试清单

#### 浏览器
- [ ] Chrome (最新版)
- [ ] Firefox (最新版)
- [ ] Safari (最新版)
- [ ] Edge (最新版)

#### 设备
- [ ] iPhone SE (375px)
- [ ] iPhone 12 (390px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1920px)

## 🛠️ 测试最佳实践

### 1. 测试命名

```javascript
// ✅ 好的测试名称
describe('用户认证', () => {
  it('应该在输入有效邮箱和密码时成功登录', () => {
    // 测试代码
  });
});

// ❌ 不好的测试名称
describe('Auth', () => {
  it('test login', () => {
    // 测试代码
  });
});
```

### 2. 测试结构 (AAA 模式)

```javascript
it('应该显示错误消息当密码太短时', () => {
  // Arrange - 准备
  const shortPassword = '123';
  
  // Act - 执行
  render(<LoginForm />);
  fireEvent.change(screen.getByLabelText('密码'), {
    target: { value: shortPassword }
  });
  
  // Assert - 断言
  expect(screen.getByText('密码至少需要8个字符')).toBeInTheDocument();
});
```

### 3. Mock 使用

```javascript
// ✅ 适当的 Mock
vi.mock('../api/auth', () => ({
  login: vi.fn().mockResolvedValue({ user: mockUser })
}));

// ❌ 过度 Mock
vi.mock('react-router-dom'); // 不必要的全局 Mock
```

### 4. 测试数据

```javascript
// ✅ 使用工厂函数
const createMockUser = (overrides = {}) => ({
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  ...overrides
});

// ✅ 使用 Faker.js
import { faker } from '@faker-js/faker';

const mockUser = {
  id: faker.datatype.uuid(),
  username: faker.internet.userName(),
  email: faker.internet.email()
};
```

### 5. 异步测试

```javascript
// ✅ 使用 waitFor
it('应该显示加载状态然后显示数据', async () => {
  render(<UserProfile userId="1" />);
  
  expect(screen.getByText('加载中...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('用户名')).toBeInTheDocument();
  });
});
```

## 🐛 故障排除

### 常见问题

#### 1. 测试运行缓慢

```bash
# 并行运行测试
npm run test -- --reporter=verbose --threads

# 只运行变更的测试
npm run test -- --changed
```

#### 2. Cypress 测试失败

```bash
# 检查服务器是否启动
curl http://localhost:5173

# 清除 Cypress 缓存
npx cypress cache clear

# 重新安装 Cypress
npm uninstall cypress && npm install cypress
```

#### 3. 覆盖率不足

```bash
# 查看详细覆盖率报告
npm run test:coverage
open coverage/index.html

# 查看未覆盖的文件
npm run test:coverage -- --reporter=text
```

#### 4. 性能测试失败

```bash
# 检查 Lighthouse 配置
cat lighthouserc.js

# 手动运行 Lighthouse
npx lighthouse http://localhost:5173 --view
```

#### 5. 内存不足

```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run test
```

### 调试技巧

#### 1. 调试单元测试

```javascript
// 使用 screen.debug()
it('调试测试', () => {
  render(<Component />);
  screen.debug(); // 打印当前 DOM
});

// 使用 console.log
it('调试测试', () => {
  const user = createMockUser();
  console.log('Mock user:', user);
});
```

#### 2. 调试 Cypress 测试

```javascript
// 使用 cy.debug()
cy.get('[data-testid="login-button"]').debug().click();

// 使用 cy.pause()
cy.pause(); // 暂停测试执行

// 查看网络请求
cy.intercept('POST', '/api/login').as('loginRequest');
cy.wait('@loginRequest').then((interception) => {
  console.log(interception);
});
```

## 📚 参考资源

- [Vitest 文档](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress 文档](https://docs.cypress.io/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Artillery 文档](https://artillery.io/docs/)
- [MSW 文档](https://mswjs.io/)

## 🤝 贡献指南

1. 添加新功能时，必须包含相应的测试
2. 确保所有测试通过后再提交 PR
3. 保持测试覆盖率在 80% 以上
4. 遵循测试命名约定
5. 更新相关文档

---

**记住**: 好的测试不仅能发现 bug，还能作为代码的文档，帮助其他开发者理解代码的预期行为。
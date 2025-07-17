# Google OAuth 配置指南

## 问题描述
当前Google登录功能出现"Unsupported provider: missing OAuth secret"错误，这是因为Supabase项目中还没有配置Google OAuth提供商。

## 解决步骤

### 1. Google Cloud Console 配置

#### 1.1 创建Google Cloud项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 记录项目ID

#### 1.2 启用必要的API
1. 在左侧菜单选择 "APIs & Services" > "Library"
2. 搜索并启用以下API：
   - Google+ API
   - Google Identity API

#### 1.3 创建OAuth 2.0凭据
1. 转到 "APIs & Services" > "Credentials"
2. 点击 "Create Credentials" > "OAuth 2.0 Client IDs"
3. 如果是首次创建，需要先配置OAuth同意屏幕：
   - 选择"External"用户类型
   - 填写应用名称：LumaTrip
   - 填写用户支持邮箱
   - 添加开发者联系信息
4. 创建OAuth 2.0客户端ID：
   - 应用类型：Web application
   - 名称：LumaTrip Web Client
   - 授权重定向URI：
     ```
     https://rwckaqywmikwonwfaqez.supabase.co/auth/v1/callback
     ```
5. 保存并记录：
   - Client ID
   - Client Secret

### 2. Supabase 配置

#### 2.1 登录Supabase控制台
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目：rwckaqywmikwonwfaqez

#### 2.2 配置Google OAuth提供商
1. 在左侧菜单选择 "Authentication" > "Providers"
2. 找到"Google"提供商
3. 启用Google提供商
4. 输入从Google Cloud Console获得的：
   - **Client ID**：从步骤1.3获得
   - **Client Secret**：从步骤1.3获得
5. 点击"Save"保存配置

#### 2.3 配置重定向URL
1. 在 "Authentication" > "URL Configuration" 中
2. 添加以下重定向URL：
   - 开发环境：`http://localhost:5174/`
   - 生产环境：您的域名

### 3. 测试配置

配置完成后：
1. 重新加载应用
2. 尝试点击Google登录按钮
3. 应该会重定向到Google登录页面
4. 登录成功后会返回到应用

## 常见问题

### Q: 仍然显示"missing OAuth secret"错误
A: 请确保：
- Google Cloud Console中的重定向URI完全正确
- Supabase中的Client ID和Secret没有多余的空格
- 等待几分钟让配置生效

### Q: 重定向后显示"Invalid redirect URI"
A: 检查Google Cloud Console中的授权重定向URI是否正确设置

### Q: 登录成功但用户信息不完整
A: 在Google Cloud Console的OAuth同意屏幕中添加必要的权限范围

## 安全注意事项

1. **保护Client Secret**：不要将Client Secret提交到代码仓库
2. **限制重定向URI**：只添加必要的重定向URI
3. **定期轮换密钥**：建议定期更新OAuth凭据
4. **监控使用情况**：在Google Cloud Console中监控API使用情况

## 联系支持

如果遇到问题，可以：
1. 查看Supabase文档：https://supabase.com/docs/guides/auth/social-login/auth-google
2. 查看Google OAuth文档：https://developers.google.com/identity/protocols/oauth2
3. 联系技术支持
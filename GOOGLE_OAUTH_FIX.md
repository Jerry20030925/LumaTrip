# 🔧 Google OAuth 重定向问题解决方案

## 问题诊断

**问题现象**: 点击 Google 登录后，成功通过 Google 认证，但最终回到了着陆页面而不是应用主页。

**问题原因**: 
1. Google Cloud Console 中的重定向 URI 配置不匹配
2. Supabase 中的 Google OAuth 提供商未正确配置
3. 认证回调处理可能有时序问题

## 🚀 立即解决方案

### 步骤 1: 检查当前重定向 URL 配置

当前代码中的重定向 URL 是：
```javascript
redirectTo: `${window.location.origin}/auth/callback`
```

对于您的网站，这意味着：
- **生产环境**: `https://www.lumatrip.com/auth/callback`
- **Vercel 部署**: `https://luma-trip-jianwei-chens-projects.vercel.app/auth/callback`

### 步骤 2: 更新 Google Cloud Console 配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择您的项目
3. 转到 **APIs & Services** > **Credentials**
4. 编辑您的 OAuth 2.0 客户端 ID
5. 在 **Authorized redirect URIs** 中添加：
   ```
   https://www.lumatrip.com/auth/callback
   https://luma-trip-jianwei-chens-projects.vercel.app/auth/callback
   ```

### 步骤 3: 检查 Supabase Google OAuth 配置

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 转到 **Authentication** > **Providers**
4. 确认 Google 提供商已启用
5. 检查 Client ID 和 Client Secret 是否正确填写

### 步骤 4: 验证 Supabase 重定向 URL

在 Supabase Dashboard 中：
1. 转到 **Authentication** > **URL Configuration**
2. 确认 **Site URL** 设置为：`https://www.lumatrip.com`
3. 在 **Redirect URLs** 中添加：
   - `https://www.lumatrip.com/**`
   - `https://luma-trip-jianwei-chens-projects.vercel.app/**`

## 🔍 调试步骤

### 1. 检查浏览器控制台

打开浏览器开发者工具，点击 Google 登录，查看：
1. 是否有任何错误信息
2. 网络请求是否成功
3. 认证回调是否被正确处理

### 2. 检查认证流程

在 `AuthCallback.tsx` 中添加更多调试信息：

```typescript
console.log('Current URL:', window.location.href);
console.log('Hash params:', window.location.hash);
console.log('Search params:', window.location.search);
```

### 3. 验证 session 状态

在登录后检查：
```javascript
// 在浏览器控制台运行
const session = await supabase.auth.getSession();
console.log('Current session:', session);
```

## 🛠️ 临时解决方案

如果问题持续存在，您可以尝试以下解决方法：

### 方案 1: 使用 Supabase 默认重定向

修改 `loginWithGoogle` 函数：

```typescript
export const loginWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // 不指定 redirectTo，让 Supabase 使用默认重定向
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });
  if (error) throw error;
  return data;
};
```

### 方案 2: 直接重定向到应用

修改 `AuthCallback.tsx` 中的重定向逻辑：

```typescript
// 在成功获取 session 后
if (data.session && data.session.user) {
  console.log('OAuth callback success:', data.session.user.email);
  setSession(data.session);
  
  // 直接重定向到应用主页，而不是着陆页
  window.location.href = '/app/home';
  return;
}
```

## ✅ 测试验证

完成配置后，按以下步骤测试：

1. **清除浏览器缓存和 cookies**
2. **访问网站** (`https://www.lumatrip.com`)
3. **点击 Google 登录**
4. **完成 Google 认证**
5. **验证是否正确重定向到 `/app/home`**

## 🚨 常见问题

### Q: 仍然重定向到着陆页面
**A**: 检查 `useAuth` hook 中的登录状态检查逻辑，确保认证状态正确更新。

### Q: 认证成功但 session 为空
**A**: 这通常是时序问题，可以在 `AuthCallback` 中增加重试逻辑。

### Q: Google 登录显示 "配置错误"
**A**: 检查 Google Cloud Console 中的重定向 URI 是否精确匹配。

## 📞 获取帮助

如果问题持续存在：
1. 检查浏览器控制台的错误日志
2. 验证 Google Cloud Console 和 Supabase 的配置
3. 联系技术支持并提供具体的错误信息

---

**注意**: 配置更改可能需要几分钟才能生效。请耐心等待并清除浏览器缓存后重试。 
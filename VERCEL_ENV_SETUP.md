# Vercel 环境变量配置指南

## 必需的环境变量

在 Vercel 项目设置中配置以下环境变量：

### 1. 应用基本配置
```bash
NODE_ENV=production
VITE_APP_NAME=LumaTrip
VITE_APP_VERSION=1.0.0
```

### 2. Supabase 数据库配置
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Google 服务配置
```bash
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. 功能开关
```bash
VITE_ENABLE_CHAT=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_LOCATION=true
VITE_ENABLE_ANALYTICS=true
```

### 5. 文件上传配置
```bash
VITE_UPLOAD_MAX_SIZE=10485760
VITE_UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp,image/gif
```

## 可选的环境变量

### 错误监控 (Sentry)
```bash
VITE_SENTRY_DSN=your-sentry-dsn
```

### AI 功能 (OpenAI)
```bash
OPENAI_API_KEY=your-openai-api-key
```

### 推送通知
```bash
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### 分析工具
```bash
VITE_VERCEL_ANALYTICS_ID=your-vercel-analytics-id
```

## 配置步骤

1. 登录 Vercel 仪表板
2. 选择你的项目
3. 进入 Settings > Environment Variables
4. 添加上述环境变量
5. 选择适当的环境 (Production, Preview, Development)

## 安全注意事项

- 所有以 `VITE_` 开头的变量都会暴露给客户端
- 不要在 `VITE_` 变量中存储敏感信息
- 服务端专用的敏感信息（如 API 密钥）不要添加 `VITE_` 前缀

## 验证配置

部署后，可以通过以下方式验证环境变量配置：

1. 检查浏览器控制台是否有相关错误
2. 测试需要 API 密钥的功能（如地图、登录等）
3. 查看 Vercel 部署日志

## 故障排除

如果遇到环境变量相关问题：

1. 确保变量名称正确
2. 检查变量值是否包含特殊字符
3. 确认变量已应用到正确的环境
4. 重新部署以应用新的环境变量
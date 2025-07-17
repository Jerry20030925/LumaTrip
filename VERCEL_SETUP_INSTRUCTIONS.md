# Vercel 环境变量配置指南

## 🚀 为 LumaTrip 配置 Google Maps API 密钥

### 步骤 1：访问 Vercel 项目设置
1. 打开浏览器访问：[https://vercel.com/jianwei-chens-projects/luma-trip/settings/environment-variables](https://vercel.com/jianwei-chens-projects/luma-trip/settings/environment-variables)
2. 登录您的 Vercel 账户

### 步骤 2：添加环境变量
点击 "Add New" 按钮，然后输入以下信息：

**Variable Name:**
```
VITE_GOOGLE_MAPS_API_KEY
```

**Value:**
```
AlzaSyDU5VTIVbim0Sjaqa2LAS60NySylbzblg
```

**Environments（选择所有环境）:**
- ✅ Production
- ✅ Preview  
- ✅ Development

### 步骤 3：保存并重新部署
1. 点击 "Save" 保存环境变量
2. 触发新的部署以应用更改：
   - 可以通过推送代码到 GitHub
   - 或在 Vercel 控制台手动触发重新部署

## ✅ 配置完成后的测试

配置完成后，您可以访问以下地址测试地图功能：

### 开发环境（本地）
```
http://localhost:5173/map-demo
```

### 生产环境
```
https://luma-trip-jianwei-chens-projects.vercel.app/map-demo
```

### 应用内地图（需要登录）
```
https://luma-trip-jianwei-chens-projects.vercel.app/app/map-example
```

## 🔧 验证配置是否成功

1. **地图显示**: 页面应该显示交互式地图
2. **搜索功能**: 可以在搜索框中输入地点名称
3. **用户位置**: 允许位置权限后显示当前位置
4. **标记功能**: 点击地图可以添加标记

## 🚨 如果遇到问题

### 问题 1: 地图不显示
- 检查浏览器控制台是否有错误信息
- 确认 API 密钥在 Vercel 中正确配置
- 验证环境变量名称拼写正确

### 问题 2: 搜索不工作
- 确保在 Google Cloud Console 中启用了 Places API
- 检查 API 密钥的限制设置

### 问题 3: 部署后没有生效
- 确认已触发重新部署
- 等待几分钟让更改生效

## 📞 需要帮助？

如果遇到任何问题，请检查：
1. Vercel 环境变量是否正确保存
2. Google Cloud Console 中的 API 是否已启用
3. API 密钥是否有正确的权限设置 
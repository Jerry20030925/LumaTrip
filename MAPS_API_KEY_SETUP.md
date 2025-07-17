# 🗺️ Google Maps API 密钥快速配置

## 从您的截图中，我看到您已经有了API密钥：`AlzaSyDU5VTIVbim0Sjaqa2LAS60NySylbzblg`

## 📋 配置步骤

### 1. 本地开发环境
在项目根目录创建 `.env.local` 文件：

```bash
VITE_GOOGLE_MAPS_API_KEY=AlzaSyDU5VTIVbim0Sjaqa2LAS60NySylbzblg
```

### 2. Vercel 生产环境
1. 访问 [Vercel项目设置](https://vercel.com/jianwei-chens-projects/luma-trip/settings/environment-variables)
2. 添加新的环境变量：
   - **Name**: `VITE_GOOGLE_MAPS_API_KEY`
   - **Value**: `AlzaSyDU5VTIVbim0Sjaqa2LAS60NySylbzblg`
   - **Environments**: 选择 Production, Preview, Development

### 3. 启用必要的API
在 [Google Cloud Console](https://console.cloud.google.com/) 中确保启用了：
- ✅ Maps JavaScript API
- ✅ Places API  
- ✅ Geocoding API

## 🚀 测试地图功能

配置完成后，您可以访问：
- **开发环境**: `http://localhost:5173/map-demo`
- **生产环境**: `https://luma-trip-jianwei-chens-projects.vercel.app/map-demo`

## 🔧 如果遇到问题

1. **API密钥无效**: 检查密钥是否正确复制
2. **地图不显示**: 确认已启用Maps JavaScript API
3. **搜索不工作**: 确认已启用Places API

## 📱 在应用中使用

地图功能已集成到LumaTrip应用中，登录后可在导航栏看到"地图"链接。 
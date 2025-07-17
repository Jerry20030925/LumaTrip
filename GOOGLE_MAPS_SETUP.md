# Google Maps API 配置指南

## 🗺️ 概述

LumaTrip 已集成 Google Maps API，提供以下功能：
- 交互式地图显示
- 地点搜索和自动完成
- 地理编码和反向地理编码
- 用户位置显示
- 自定义标记和信息窗口

## 🔑 获取 Google Maps API 密钥

### 1. 创建 Google Cloud 项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google Maps Platform

### 2. 启用必要的 API
在 Google Cloud Console 中启用以下 API：
- **Maps JavaScript API** - 用于地图显示
- **Places API** - 用于地点搜索
- **Geocoding API** - 用于地址转换

### 3. 创建 API 密钥
1. 在 Google Cloud Console 中，转到 "API 和服务" > "凭据"
2. 点击 "创建凭据" > "API 密钥"
3. 复制生成的 API 密钥

### 4. 配置 API 密钥限制（推荐）
为了安全，建议配置以下限制：

#### 应用程序限制
- **HTTP 引荐来源网址**：添加您的域名
  ```
  https://yourdomain.com/*
  https://localhost:*
  ```

#### API 限制
选择 "限制密钥"，然后选择：
- Maps JavaScript API
- Places API
- Geocoding API

## ⚙️ 项目配置

### 1. 环境变量配置
在项目根目录创建 `.env.local` 文件：

```bash
# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=你的API密钥
```

### 2. Vercel 部署配置
在 Vercel 项目设置中添加环境变量：
1. 进入 Vercel 项目控制台
2. 转到 "Settings" > "Environment Variables"
3. 添加：
   - **Name**: `VITE_GOOGLE_MAPS_API_KEY`
   - **Value**: 你的API密钥
   - **Environment**: Production, Preview, Development

## 🚀 功能使用

### 基础地图组件
```tsx
import GoogleMap from '../components/maps/GoogleMap';

<GoogleMap
  center={{ lat: 39.8283, lng: -98.5795 }}
  zoom={10}
  markers={markers}
  style={{ height: '400px' }}
  showUserLocation={true}
/>
```

### 地点搜索组件
```tsx
import PlaceSearch from '../components/maps/PlaceSearch';

<PlaceSearch
  onPlaceSelect={(place) => {
    console.log('Selected place:', place);
  }}
  placeholder="搜索地点..."
/>
```

### 位置服务集成
```tsx
import LocationService from '../services/location.service';

// 搜索附近城市
const cities = await LocationService.getNearbyCities(location, 50);

// 搜索地点
const places = await LocationService.searchPlaces('restaurant', location);
```

## 📄 API 使用示例

### 地理编码
```typescript
import { geocode } from '../utils/googleMaps';

const results = await geocode('1600 Amphitheatre Parkway, Mountain View, CA');
```

### 附近地点搜索
```typescript
import { searchNearbyPlaces } from '../utils/googleMaps';

const places = await searchNearbyPlaces(
  { lat: 37.4419, lng: -122.1430 },
  5000, // 5km 半径
  'restaurant'
);
```

## 🛡️ 安全最佳实践

### 1. API 密钥保护
- 永远不要在客户端代码中硬编码 API 密钥
- 使用环境变量存储敏感信息
- 在生产环境中配置适当的 API 密钥限制

### 2. 使用限制
- 设置每日请求限制以控制成本
- 监控 API 使用情况
- 实施客户端缓存以减少 API 调用

### 3. 错误处理
```typescript
try {
  const places = await searchNearbyPlaces(location, radius, type);
} catch (error) {
  console.error('Places search failed:', error);
  // 提供备用方案或用户友好的错误信息
}
```

## 💰 成本优化

### 1. API 调用优化
- 使用适当的字段参数限制返回数据
- 实施结果缓存
- 避免不必要的重复请求

### 2. 免费配额
Google Maps Platform 提供每月免费配额：
- Maps JavaScript API: $200 免费使用额度
- Places API: $200 免费使用额度
- Geocoding API: $200 免费使用额度

## 🔧 故障排除

### 常见错误和解决方案

#### 1. "API 密钥无效"
- 检查 API 密钥是否正确复制
- 确认已启用所需的 API
- 验证 API 密钥限制设置

#### 2. "此 API 项目未获得使用此 API 的授权"
- 在 Google Cloud Console 中启用相应的 API
- 等待几分钟让更改生效

#### 3. "超出配额"
- 检查 API 使用情况
- 考虑升级到付费计划
- 优化 API 调用频率

#### 4. 地图不显示
- 检查容器元素的高度设置
- 确认网络连接正常
- 查看浏览器控制台错误信息

## 📱 演示页面

访问以下页面查看 Google Maps 集成效果：
- **开发环境**: `http://localhost:5173/map-demo`
- **生产环境**: `https://your-domain.com/map-demo`

## 📚 相关文档

- [Google Maps JavaScript API 文档](https://developers.google.com/maps/documentation/javascript)
- [Places API 文档](https://developers.google.com/maps/documentation/places/web-service)
- [Geocoding API 文档](https://developers.google.com/maps/documentation/geocoding)

---

## 🎯 下一步

1. 获取并配置 Google Maps API 密钥
2. 在 Vercel 中添加环境变量
3. 测试地图功能
4. 根据需要调整 API 密钥限制
5. 监控 API 使用情况和成本 
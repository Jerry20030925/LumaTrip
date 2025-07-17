#!/bin/bash

# LumaTrip 部署前检查脚本
echo "🚀 LumaTrip 部署前检查开始..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node_version=$(node -v)
echo "Node.js 版本: $node_version"

# 检查 npm 版本
echo "📋 检查 npm 版本..."
npm_version=$(npm -v)
echo "npm 版本: $npm_version"

# 清理旧的构建文件
echo "🧹 清理旧的构建文件..."
rm -rf dist/
rm -rf .vercel/
rm -rf node_modules/.cache/

# 安装依赖
echo "📦 安装依赖..."
npm ci

# 运行类型检查
echo "🔍 运行类型检查..."
npm run type-check

# 运行代码检查
echo "🔍 运行代码检查..."
npm run lint

# 运行格式检查
echo "🔍 运行格式检查..."
npm run format:check

# 运行测试
echo "🧪 运行测试..."
npm run test:run

# 构建项目
echo "🏗️ 构建项目..."
npm run build

# 检查构建结果
if [ -d "dist" ]; then
    echo "✅ 构建成功！"
    echo "📊 构建统计:"
    du -sh dist/
    echo "📁 构建文件:"
    ls -la dist/
else
    echo "❌ 构建失败！"
    exit 1
fi

# 检查关键文件
echo "🔍 检查关键文件..."
required_files=("dist/index.html" "dist/manifest.json" "dist/assets")
for file in "${required_files[@]}"; do
    if [ -e "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 缺失"
        exit 1
    fi
done

# 检查 manifest.json 格式
echo "🔍 检查 PWA manifest..."
if node -e "JSON.parse(require('fs').readFileSync('dist/manifest.json', 'utf8'))" 2>/dev/null; then
    echo "✅ manifest.json 格式正确"
else
    echo "❌ manifest.json 格式错误"
    exit 1
fi

# 预览构建结果
echo "👀 启动预览服务器..."
echo "📝 可以通过以下命令查看构建结果："
echo "   npm run preview"

echo "🎉 部署前检查完成！项目已准备好部署到 Vercel。"
echo ""
echo "📋 部署步骤:"
echo "1. 确保已安装 Vercel CLI: npm i -g vercel"
echo "2. 登录 Vercel: vercel login"
echo "3. 部署项目: vercel --prod"
echo ""
echo "🔧 环境变量配置:"
echo "请在 Vercel 项目设置中配置以下环境变量："
echo "- VITE_SUPABASE_URL"
echo "- VITE_SUPABASE_ANON_KEY"
echo "- VITE_GOOGLE_MAPS_API_KEY"
echo "- VITE_GOOGLE_CLIENT_ID"
echo "查看 .env.example 文件获取完整的环境变量列表"
#!/bin/bash

# LumaTrip 全功能测试脚本
# 运行所有测试并生成报告

set -e  # 遇到错误时退出

echo "🚀 开始运行 LumaTrip 全功能测试..."
echo "======================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 创建测试报告目录
REPORT_DIR="test-reports"
mkdir -p $REPORT_DIR

# 记录开始时间
START_TIME=$(date +%s)

echo -e "${BLUE}📋 测试环境检查...${NC}"
# 检查 Node.js 版本
node --version
npm --version

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  依赖未安装，正在安装...${NC}"
    npm install
fi

echo -e "${BLUE}🧪 1. 运行单元测试...${NC}"
echo "--------------------------------------"

# 运行单元测试并生成覆盖率报告
if npm run test -- --coverage --reporter=json --outputFile=$REPORT_DIR/unit-test-results.json; then
    echo -e "${GREEN}✅ 单元测试通过${NC}"
    UNIT_TEST_PASSED=true
else
    echo -e "${RED}❌ 单元测试失败${NC}"
    UNIT_TEST_PASSED=false
fi

echo -e "${BLUE}🎭 2. 运行 E2E 测试...${NC}"
echo "--------------------------------------"

# 启动开发服务器（后台运行）
echo "启动开发服务器..."
npm run dev &
DEV_SERVER_PID=$!

# 等待服务器启动
echo "等待服务器启动..."
sleep 10

# 检查服务器是否启动成功
if curl -f http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 开发服务器启动成功${NC}"
    
    # 运行 Cypress E2E 测试
    if npx cypress run --reporter json --reporter-options "output=$REPORT_DIR/e2e-test-results.json"; then
        echo -e "${GREEN}✅ E2E 测试通过${NC}"
        E2E_TEST_PASSED=true
    else
        echo -e "${RED}❌ E2E 测试失败${NC}"
        E2E_TEST_PASSED=false
    fi
else
    echo -e "${RED}❌ 开发服务器启动失败${NC}"
    E2E_TEST_PASSED=false
fi

# 停止开发服务器
kill $DEV_SERVER_PID 2>/dev/null || true

echo -e "${BLUE}⚡ 3. 运行性能测试...${NC}"
echo "--------------------------------------"

# 重新启动服务器进行性能测试
npm run dev &
DEV_SERVER_PID=$!
sleep 10

if curl -f http://localhost:5173 > /dev/null 2>&1; then
    # 运行性能测试
    if node scripts/performance-test.js; then
        echo -e "${GREEN}✅ 性能测试通过${NC}"
        PERFORMANCE_TEST_PASSED=true
    else
        echo -e "${RED}❌ 性能测试失败${NC}"
        PERFORMANCE_TEST_PASSED=false
    fi
else
    echo -e "${RED}❌ 性能测试服务器启动失败${NC}"
    PERFORMANCE_TEST_PASSED=false
fi

# 停止服务器
kill $DEV_SERVER_PID 2>/dev/null || true

echo -e "${BLUE}🔥 4. 运行压力测试...${NC}"
echo "--------------------------------------"

# 启动服务器进行压力测试
npm run dev &
DEV_SERVER_PID=$!
sleep 10

if curl -f http://localhost:5173 > /dev/null 2>&1; then
    # 运行 Artillery 压力测试
    if npx artillery run artillery-config.yml --output $REPORT_DIR/load-test-results.json; then
        echo -e "${GREEN}✅ 压力测试通过${NC}"
        LOAD_TEST_PASSED=true
    else
        echo -e "${RED}❌ 压力测试失败${NC}"
        LOAD_TEST_PASSED=false
    fi
else
    echo -e "${RED}❌ 压力测试服务器启动失败${NC}"
    LOAD_TEST_PASSED=false
fi

# 停止服务器
kill $DEV_SERVER_PID 2>/dev/null || true

echo -e "${BLUE}🏗️  5. 构建测试...${NC}"
echo "--------------------------------------"

# 测试生产构建
if npm run build; then
    echo -e "${GREEN}✅ 构建测试通过${NC}"
    BUILD_TEST_PASSED=true
    
    # 分析构建大小
    if command -v du &> /dev/null; then
        BUILD_SIZE=$(du -sh dist | cut -f1)
        echo "📦 构建大小: $BUILD_SIZE"
    fi
else
    echo -e "${RED}❌ 构建测试失败${NC}"
    BUILD_TEST_PASSED=false
fi

echo -e "${BLUE}🔍 6. 代码质量检查...${NC}"
echo "--------------------------------------"

# ESLint 检查
if npm run lint 2>/dev/null; then
    echo -e "${GREEN}✅ ESLint 检查通过${NC}"
    LINT_PASSED=true
else
    echo -e "${YELLOW}⚠️  ESLint 检查有警告或错误${NC}"
    LINT_PASSED=false
fi

# TypeScript 类型检查
if npm run type-check 2>/dev/null || npx tsc --noEmit; then
    echo -e "${GREEN}✅ TypeScript 类型检查通过${NC}"
    TYPE_CHECK_PASSED=true
else
    echo -e "${RED}❌ TypeScript 类型检查失败${NC}"
    TYPE_CHECK_PASSED=false
fi

# 计算总耗时
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))
MINUTES=$((TOTAL_TIME / 60))
SECONDS=$((TOTAL_TIME % 60))

echo ""
echo "======================================"
echo -e "${BLUE}📊 测试结果汇总${NC}"
echo "======================================"

# 生成测试报告
REPORT_FILE="$REPORT_DIR/test-summary.md"
cat > $REPORT_FILE << EOF
# LumaTrip 测试报告

**测试时间**: $(date)
**总耗时**: ${MINUTES}分${SECONDS}秒

## 测试结果

| 测试类型 | 状态 |
|---------|------|
EOF

# 检查各项测试结果
if [ "$UNIT_TEST_PASSED" = true ]; then
    echo -e "${GREEN}✅ 单元测试: 通过${NC}"
    echo "| 单元测试 | ✅ 通过 |" >> $REPORT_FILE
else
    echo -e "${RED}❌ 单元测试: 失败${NC}"
    echo "| 单元测试 | ❌ 失败 |" >> $REPORT_FILE
fi

if [ "$E2E_TEST_PASSED" = true ]; then
    echo -e "${GREEN}✅ E2E测试: 通过${NC}"
    echo "| E2E测试 | ✅ 通过 |" >> $REPORT_FILE
else
    echo -e "${RED}❌ E2E测试: 失败${NC}"
    echo "| E2E测试 | ❌ 失败 |" >> $REPORT_FILE
fi

if [ "$PERFORMANCE_TEST_PASSED" = true ]; then
    echo -e "${GREEN}✅ 性能测试: 通过${NC}"
    echo "| 性能测试 | ✅ 通过 |" >> $REPORT_FILE
else
    echo -e "${RED}❌ 性能测试: 失败${NC}"
    echo "| 性能测试 | ❌ 失败 |" >> $REPORT_FILE
fi

if [ "$LOAD_TEST_PASSED" = true ]; then
    echo -e "${GREEN}✅ 压力测试: 通过${NC}"
    echo "| 压力测试 | ✅ 通过 |" >> $REPORT_FILE
else
    echo -e "${RED}❌ 压力测试: 失败${NC}"
    echo "| 压力测试 | ❌ 失败 |" >> $REPORT_FILE
fi

if [ "$BUILD_TEST_PASSED" = true ]; then
    echo -e "${GREEN}✅ 构建测试: 通过${NC}"
    echo "| 构建测试 | ✅ 通过 |" >> $REPORT_FILE
else
    echo -e "${RED}❌ 构建测试: 失败${NC}"
    echo "| 构建测试 | ❌ 失败 |" >> $REPORT_FILE
fi

if [ "$LINT_PASSED" = true ]; then
    echo -e "${GREEN}✅ 代码规范: 通过${NC}"
    echo "| 代码规范 | ✅ 通过 |" >> $REPORT_FILE
else
    echo -e "${YELLOW}⚠️  代码规范: 有警告${NC}"
    echo "| 代码规范 | ⚠️ 警告 |" >> $REPORT_FILE
fi

if [ "$TYPE_CHECK_PASSED" = true ]; then
    echo -e "${GREEN}✅ 类型检查: 通过${NC}"
    echo "| 类型检查 | ✅ 通过 |" >> $REPORT_FILE
else
    echo -e "${RED}❌ 类型检查: 失败${NC}"
    echo "| 类型检查 | ❌ 失败 |" >> $REPORT_FILE
fi

echo ""
echo "📁 测试报告已保存到: $REPORT_DIR/"
echo "📄 详细报告: $REPORT_FILE"

# 添加详细信息到报告
cat >> $REPORT_FILE << EOF

## 详细信息

### 测试覆盖率
- 查看详细覆盖率报告: \`coverage/index.html\`

### 性能指标
- 查看性能测试报告: \`$REPORT_DIR/performance-report.html\`

### 压力测试
- 查看压力测试报告: \`$REPORT_DIR/load-test-results.json\`

### 构建信息
- 构建大小: ${BUILD_SIZE:-"未知"}
- 构建目录: \`dist/\`

## 建议

### 如果测试失败
1. 查看具体错误信息
2. 检查依赖是否正确安装
3. 确保端口 5173 未被占用
4. 检查网络连接

### 性能优化建议
- 如果性能测试失败，考虑优化图片大小和代码分割
- 检查是否有内存泄漏
- 优化网络请求

### 代码质量
- 修复 ESLint 警告和错误
- 解决 TypeScript 类型问题
- 提高测试覆盖率到 80% 以上
EOF

# 判断整体测试是否通过
if [ "$UNIT_TEST_PASSED" = true ] && 
   [ "$E2E_TEST_PASSED" = true ] && 
   [ "$PERFORMANCE_TEST_PASSED" = true ] && 
   [ "$BUILD_TEST_PASSED" = true ] && 
   [ "$TYPE_CHECK_PASSED" = true ]; then
    echo ""
    echo -e "${GREEN}🎉 所有测试通过！项目已准备好部署。${NC}"
    echo "======================================"
    exit 0
else
    echo ""
    echo -e "${RED}❌ 部分测试失败，请检查上述错误并修复。${NC}"
    echo "======================================"
    exit 1
fi
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 性能测试配置
const config = {
  baseUrl: 'http://localhost:5173',
  pages: [
    { name: 'Home', url: '/' },
    { name: 'Login', url: '/login' },
    { name: 'Register', url: '/register' },
    { name: 'Discover', url: '/discover' },
    { name: 'Messages', url: '/messages' },
    { name: 'Profile', url: '/profile' }
  ],
  metrics: {
    loadTime: 3000, // 3秒
    fcp: 1500, // First Contentful Paint
    lcp: 2500, // Largest Contentful Paint
    fid: 100, // First Input Delay
    cls: 0.1 // Cumulative Layout Shift
  }
};

// 性能测试函数
async function runPerformanceTest() {
  console.log('🚀 开始性能测试...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  
  try {
    for (const page of config.pages) {
      console.log(`📊 测试页面: ${page.name}`);
      
      const browserPage = await browser.newPage();
      
      // 启用性能监控
      await browserPage.setCacheEnabled(false);
      await browserPage.setViewport({ width: 1920, height: 1080 });
      
      // 开始性能追踪
      await browserPage.tracing.start({
        path: `./performance-traces/${page.name}-trace.json`,
        screenshots: true
      });
      
      const startTime = Date.now();
      
      // 导航到页面
      const response = await browserPage.goto(`${config.baseUrl}${page.url}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      const loadTime = Date.now() - startTime;
      
      // 获取性能指标
      const metrics = await browserPage.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const paintEntries = performance.getEntriesByType('paint');
            const navigationEntries = performance.getEntriesByType('navigation');
            
            resolve({
              fcp: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
              lcp: entries.find(entry => entry.entryType === 'largest-contentful-paint')?.startTime || 0,
              fid: entries.find(entry => entry.entryType === 'first-input')?.processingStart || 0,
              cls: entries.reduce((sum, entry) => {
                if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                  return sum + entry.value;
                }
                return sum;
              }, 0),
              domContentLoaded: navigationEntries[0]?.domContentLoadedEventEnd - navigationEntries[0]?.domContentLoadedEventStart || 0,
              domComplete: navigationEntries[0]?.domComplete - navigationEntries[0]?.domContentLoadedEventStart || 0
            });
          }).observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
          
          // 如果5秒内没有获取到指标，返回默认值
          setTimeout(() => {
            resolve({
              fcp: 0,
              lcp: 0,
              fid: 0,
              cls: 0,
              domContentLoaded: 0,
              domComplete: 0
            });
          }, 5000);
        });
      });
      
      // 获取资源加载信息
      const resourceTiming = await browserPage.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return resources.map(resource => ({
          name: resource.name,
          duration: resource.duration,
          size: resource.transferSize || 0,
          type: resource.initiatorType
        }));
      });
      
      // 获取内存使用情况
      const memoryUsage = await browserPage.evaluate(() => {
        return {
          usedJSHeapSize: performance.memory?.usedJSHeapSize || 0,
          totalJSHeapSize: performance.memory?.totalJSHeapSize || 0,
          jsHeapSizeLimit: performance.memory?.jsHeapSizeLimit || 0
        };
      });
      
      // 停止追踪
      await browserPage.tracing.stop();
      
      // 计算评分
      const score = calculatePerformanceScore({
        loadTime,
        ...metrics
      });
      
      const result = {
        page: page.name,
        url: page.url,
        loadTime,
        metrics,
        resourceTiming,
        memoryUsage,
        score,
        status: response.status(),
        timestamp: new Date().toISOString()
      };
      
      results.push(result);
      
      console.log(`✅ ${page.name} 测试完成 - 评分: ${score}/100`);
      console.log(`   加载时间: ${loadTime}ms`);
      console.log(`   FCP: ${metrics.fcp.toFixed(2)}ms`);
      console.log(`   LCP: ${metrics.lcp.toFixed(2)}ms`);
      console.log(`   CLS: ${metrics.cls.toFixed(3)}`);
      
      await browserPage.close();
    }
    
    // 生成报告
    await generateReport(results);
    
  } catch (error) {
    console.error('❌ 性能测试失败:', error);
  } finally {
    await browser.close();
  }
}

// 计算性能评分
function calculatePerformanceScore(metrics) {
  let score = 100;
  
  // 加载时间评分 (40%)
  if (metrics.loadTime > config.metrics.loadTime) {
    score -= 40 * (metrics.loadTime - config.metrics.loadTime) / config.metrics.loadTime;
  }
  
  // FCP评分 (20%)
  if (metrics.fcp > config.metrics.fcp) {
    score -= 20 * (metrics.fcp - config.metrics.fcp) / config.metrics.fcp;
  }
  
  // LCP评分 (20%)
  if (metrics.lcp > config.metrics.lcp) {
    score -= 20 * (metrics.lcp - config.metrics.lcp) / config.metrics.lcp;
  }
  
  // CLS评分 (20%)
  if (metrics.cls > config.metrics.cls) {
    score -= 20 * (metrics.cls - config.metrics.cls) / config.metrics.cls;
  }
  
  return Math.max(0, Math.round(score));
}

// 生成性能报告
async function generateReport(results) {
  const reportDir = './performance-reports';
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportDir, `performance-report-${timestamp}.json`);
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: results.length,
      averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      averageLoadTime: results.reduce((sum, r) => sum + r.loadTime, 0) / results.length,
      passedPages: results.filter(r => r.score >= 90).length,
      failedPages: results.filter(r => r.score < 70).length
    },
    results,
    thresholds: config.metrics
  };
  
  // 保存JSON报告
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // 生成HTML报告
  const htmlReport = generateHtmlReport(report);
  const htmlPath = path.join(reportDir, `performance-report-${timestamp}.html`);
  fs.writeFileSync(htmlPath, htmlReport);
  
  console.log('\n📊 性能测试报告:');
  console.log(`   总页面数: ${report.summary.totalPages}`);
  console.log(`   平均评分: ${report.summary.averageScore.toFixed(1)}/100`);
  console.log(`   平均加载时间: ${report.summary.averageLoadTime.toFixed(0)}ms`);
  console.log(`   通过页面: ${report.summary.passedPages}`);
  console.log(`   失败页面: ${report.summary.failedPages}`);
  console.log(`   报告保存至: ${htmlPath}`);
  
  // 如果有页面评分低于70，退出码为1
  if (report.summary.failedPages > 0) {
    process.exit(1);
  }
}

// 生成HTML报告
function generateHtmlReport(report) {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LumaTrip 性能测试报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .metric { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .metric-value { font-size: 2em; font-weight: bold; color: #333; }
        .metric-label { color: #666; margin-top: 5px; }
        .results { padding: 0 30px 30px; }
        .page-result { margin-bottom: 20px; padding: 20px; border: 1px solid #e1e5e9; border-radius: 8px; }
        .page-header { display: flex; justify-content: between; align-items: center; margin-bottom: 15px; }
        .page-name { font-size: 1.2em; font-weight: bold; }
        .score { padding: 5px 15px; border-radius: 20px; color: white; font-weight: bold; }
        .score-excellent { background: #28a745; }
        .score-good { background: #ffc107; color: #333; }
        .score-poor { background: #dc3545; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .metric-item { text-align: center; padding: 10px; background: #f8f9fa; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 LumaTrip 性能测试报告</h1>
            <p>测试时间: ${report.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value">${report.summary.averageScore.toFixed(1)}</div>
                <div class="metric-label">平均评分</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.averageLoadTime.toFixed(0)}ms</div>
                <div class="metric-label">平均加载时间</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.passedPages}</div>
                <div class="metric-label">通过页面</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.failedPages}</div>
                <div class="metric-label">失败页面</div>
            </div>
        </div>
        
        <div class="results">
            <h2>详细结果</h2>
            ${report.results.map(result => `
                <div class="page-result">
                    <div class="page-header">
                        <div class="page-name">${result.page}</div>
                        <div class="score ${
                          result.score >= 90 ? 'score-excellent' : 
                          result.score >= 70 ? 'score-good' : 'score-poor'
                        }">${result.score}/100</div>
                    </div>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <div><strong>${result.loadTime}ms</strong></div>
                            <div>加载时间</div>
                        </div>
                        <div class="metric-item">
                            <div><strong>${result.metrics.fcp.toFixed(0)}ms</strong></div>
                            <div>FCP</div>
                        </div>
                        <div class="metric-item">
                            <div><strong>${result.metrics.lcp.toFixed(0)}ms</strong></div>
                            <div>LCP</div>
                        </div>
                        <div class="metric-item">
                            <div><strong>${result.metrics.cls.toFixed(3)}</strong></div>
                            <div>CLS</div>
                        </div>
                        <div class="metric-item">
                            <div><strong>${(result.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</strong></div>
                            <div>内存使用</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
  `;
}

// 内存泄漏检测
async function detectMemoryLeaks() {
  console.log('🔍 开始内存泄漏检测...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const measurements = [];
  
  for (let i = 0; i < 10; i++) {
    await page.goto(`${config.baseUrl}/discover`);
    await page.waitForTimeout(2000);
    
    const memory = await page.evaluate(() => {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize
      };
    });
    
    measurements.push(memory);
    console.log(`第${i + 1}次测量: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
  }
  
  await browser.close();
  
  // 分析内存趋势
  const trend = measurements.map((m, i) => ({
    iteration: i + 1,
    memory: m.usedJSHeapSize / 1024 / 1024
  }));
  
  const memoryGrowth = trend[trend.length - 1].memory - trend[0].memory;
  
  console.log(`\n📊 内存泄漏检测结果:`);
  console.log(`   初始内存: ${trend[0].memory.toFixed(2)}MB`);
  console.log(`   最终内存: ${trend[trend.length - 1].memory.toFixed(2)}MB`);
  console.log(`   内存增长: ${memoryGrowth.toFixed(2)}MB`);
  
  if (memoryGrowth > 50) {
    console.log('⚠️  检测到可能的内存泄漏');
    return false;
  } else {
    console.log('✅ 未检测到明显内存泄漏');
    return true;
  }
}

// 主函数
async function main() {
  try {
    // 确保目录存在
    if (!fs.existsSync('./performance-traces')) {
      fs.mkdirSync('./performance-traces', { recursive: true });
    }
    
    // 运行性能测试
    await runPerformanceTest();
    
    // 运行内存泄漏检测
    await detectMemoryLeaks();
    
    console.log('\n🎉 所有测试完成!');
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  runPerformanceTest,
  detectMemoryLeaks,
  calculatePerformanceScore
};
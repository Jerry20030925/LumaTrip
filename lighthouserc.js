module.exports = {
  ci: {
    collect: {
      // 要测试的 URL
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/login',
        'http://localhost:4173/register',
        'http://localhost:4173/discover',
        'http://localhost:4173/messages',
        'http://localhost:4173/profile',
        'http://localhost:4173/settings'
      ],
      // 启动命令
      startServerCommand: 'npm run preview',
      // 启动超时时间
      startServerReadyTimeout: 30000,
      // 每个 URL 运行次数
      numberOfRuns: 3,
      // Chrome 设置
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --headless',
        // 预设配置
        preset: 'desktop',
        // 自定义配置
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        // 禁用某些审计
        skipAudits: [
          'canonical',
          'robots-txt',
          'tap-targets'
        ],
        // 只运行特定类别
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo'
        ]
      }
    },
    assert: {
      // 性能断言
      assertions: {
        // 性能分数
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        
        // 核心 Web 指标
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // 其他重要指标
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'interactive': ['error', { maxNumericValue: 3000 }],
        'max-potential-fid': ['error', { maxNumericValue: 100 }],
        
        // 资源优化
        'unused-css-rules': ['warn', { maxLength: 0 }],
        'unused-javascript': ['warn', { maxLength: 0 }],
        'modern-image-formats': ['warn', { maxLength: 0 }],
        'offscreen-images': ['warn', { maxLength: 0 }],
        'render-blocking-resources': ['warn', { maxLength: 0 }],
        
        // 网络优化
        'uses-text-compression': ['warn', { maxLength: 0 }],
        'uses-responsive-images': ['warn', { maxLength: 0 }],
        'efficient-animated-content': ['warn', { maxLength: 0 }],
        
        // 可访问性
        'color-contrast': ['error', { maxLength: 0 }],
        'image-alt': ['error', { maxLength: 0 }],
        'label': ['error', { maxLength: 0 }],
        'link-name': ['error', { maxLength: 0 }],
        
        // SEO
        'document-title': ['error', { maxLength: 0 }],
        'meta-description': ['error', { maxLength: 0 }],
        'http-status-code': ['error', { maxLength: 0 }],
        'crawlable-anchors': ['error', { maxLength: 0 }]
      }
    },
    upload: {
      // 上传到 Lighthouse CI 服务器
      target: 'temporary-public-storage',
      // 或者上传到自定义服务器
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: 'your-build-token'
    },
    server: {
      // 如果运行自己的 LHCI 服务器
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lhci.db'
      }
    },
    wizard: {
      // 向导配置
      // 运行 `lhci wizard` 时使用
    }
  }
};
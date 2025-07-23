import { useEffect } from 'react';

// Core Web Vitals 类型定义
interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// 性能阈值配置
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 }
};

// 评级函数
const getRating = (metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[metricName as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

// 发送指标到分析服务
const sendToAnalytics = (metric: Metric) => {
  // 可以发送到 Google Analytics, Vercel Analytics 等
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      custom_map: { metric_id: 'custom_metric_id' },
      metric_value: metric.value,
      metric_rating: metric.rating
    });
  }
  
  // 发送到 Vercel Analytics
  if (typeof window !== 'undefined' && window.va) {
    window.va('event', 'Web Vital', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating
    });
  }
  
  // 开发环境下在控制台输出
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 Performance Metric:`, {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      threshold: THRESHOLDS[metric.name as keyof typeof THRESHOLDS]
    });
  }
};

// 监控函数
const observeMetric = (metricName: string, observer: PerformanceObserver) => {
  try {
    observer.observe({ entryTypes: [metricName] });
  } catch (e) {
    // 某些浏览器可能不支持特定指标
    console.warn(`Performance metric ${metricName} not supported`);
  }
};

const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // 检查浏览器支持
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // 监控 First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          const metric: Metric = {
            name: 'FCP',
            value: entry.startTime,
            rating: getRating('FCP', entry.startTime),
            delta: entry.startTime,
            id: entry.name
          };
          sendToAnalytics(metric);
        }
      });
    });
    observeMetric('paint', fcpObserver);

    // 监控 Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        const metric: Metric = {
          name: 'LCP',
          value: lastEntry.startTime,
          rating: getRating('LCP', lastEntry.startTime),
          delta: lastEntry.startTime,
          id: 'lcp'
        };
        sendToAnalytics(metric);
      }
    });
    observeMetric('largest-contentful-paint', lcpObserver);

    // 监控 First Input Delay (FID)
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        const metric: Metric = {
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          rating: getRating('FID', entry.processingStart - entry.startTime),
          delta: entry.processingStart - entry.startTime,
          id: 'fid'
        };
        sendToAnalytics(metric);
      });
    });
    observeMetric('first-input', fidObserver);

    // 监控 Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      const metric: Metric = {
        name: 'CLS',
        value: clsValue,
        rating: getRating('CLS', clsValue),
        delta: clsValue,
        id: 'cls'
      };
      sendToAnalytics(metric);
    });
    observeMetric('layout-shift', clsObserver);

    // 监控 Time to First Byte (TTFB)
    const navigationObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        const ttfb = entry.responseStart - entry.requestStart;
        const metric: Metric = {
          name: 'TTFB',
          value: ttfb,
          rating: getRating('TTFB', ttfb),
          delta: ttfb,
          id: 'ttfb'
        };
        sendToAnalytics(metric);
      });
    });
    observeMetric('navigation', navigationObserver);

    // 页面可见性变化时发送 CLS
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const finalMetric: Metric = {
          name: 'CLS',
          value: clsValue,
          rating: getRating('CLS', clsValue),
          delta: clsValue,
          id: 'cls-final'
        };
        sendToAnalytics(finalMetric);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 清理函数
    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      navigationObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null; // 这个组件不渲染任何 UI
};

// 类型声明扩展
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    va?: (...args: any[]) => void;
  }
}

export default PerformanceMonitor; 
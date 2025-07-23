import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'LumaTrip - 探索世界，分享旅程',
  description = '全球旅行者社区，发现精彩目的地，分享旅行故事，连接志同道合的旅行伙伴',
  keywords = '旅行, 旅游, 社交, 目的地, 攻略, 分享, LumaTrip',
  canonical,
  ogImage = '/icons/og-image.png',
  ogType = 'website',
  noindex = false
}) => {
  useEffect(() => {
    // 更新页面标题
    if (title) {
      document.title = title;
    }

    // 更新 meta 标签
    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updateProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // 基础 SEO 标签
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    
    if (noindex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow');
    }

    // Open Graph 标签
    updateProperty('og:title', title);
    updateProperty('og:description', description);
    updateProperty('og:image', ogImage);
    updateProperty('og:type', ogType);
    updateProperty('og:site_name', 'LumaTrip');

    // Twitter Card 标签
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);

    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // 结构化数据 - 旅行网站
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": "LumaTrip",
      "description": description,
      "url": window.location.origin,
      "logo": `${window.location.origin}/luma-logo.svg`,
      "sameAs": [],
      "offers": {
        "@type": "Offer",
        "category": "Travel Planning",
        "price": "0",
        "priceCurrency": "USD"
      }
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);

  }, [title, description, keywords, canonical, ogImage, ogType, noindex]);

  return null; // 这个组件不渲染任何 UI
};

export default SEOHead; 
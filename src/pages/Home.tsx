import { useState, useEffect } from 'react';
import { Search, ArrowDown, Star, Heart, MessageCircle, Globe, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  rating: number;
  posts: number;
  tags: string[];
}

interface FeaturedContent {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
  };
  image: string;
  likes: number;
  comments: number;
  location: string;
}

interface Testimonial {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
}

const Home = () => {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('全部');
  const [contentFilter, setContentFilter] = useState('最新');

  useEffect(() => {
    // Mock destinations data
    const mockDestinations: Destination[] = [
      {
        id: '1',
        name: '巴厘岛',
        country: '印度尼西亚',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        rating: 4.8,
        posts: 1234,
        tags: ['海滩', '文化', '度假']
      },
      {
        id: '2',
        name: '京都',
        country: '日本',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
        rating: 4.9,
        posts: 892,
        tags: ['文化', '历史', '樱花']
      },
      {
        id: '3',
        name: '圣托里尼',
        country: '希腊',
        image: 'https://images.unsplash.com/photo-1570077188648-56e4b16f9d72?w=400&h=300&fit=crop',
        rating: 4.7,
        posts: 756,
        tags: ['海岛', '浪漫', '日落']
      },
      {
        id: '4',
        name: '马尔代夫',
        country: '马尔代夫',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
        rating: 4.9,
        posts: 645,
        tags: ['海滩', '蜜月', '潜水']
      }
    ];
    setDestinations(mockDestinations);

    // Mock featured content
    const mockContent: FeaturedContent[] = [
      {
        id: '1',
        title: '探索巴厘岛的隐秘海滩',
        author: {
          name: '旅行达人小李',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        likes: 1234,
        comments: 89,
        location: '巴厘岛, 印度尼西亚'
      },
      {
        id: '2',
        title: '京都樱花季完美攻略',
        author: {
          name: '摄影师张三',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
        likes: 856,
        comments: 45,
        location: '京都, 日本'
      },
      {
        id: '3',
        title: '瑞士阿尔卑斯山徒步体验',
        author: {
          name: '户外爱好者王五',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        likes: 2156,
        comments: 156,
        location: '瑞士阿尔卑斯山'
      }
    ];
    setFeaturedContent(mockContent);

    // Mock testimonials
    const mockTestimonials: Testimonial[] = [
      {
        id: '1',
        content: 'LumaTrip让我发现了许多隐藏的美景，遇到了很多志同道合的旅行者。这里的社区氛围真的很棒！',
        author: {
          name: '李小明',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
          role: '旅行博主'
        }
      },
      {
        id: '2',
        content: '作为一个摄影师，我在LumaTrip上分享了很多作品，获得了很多认可和灵感。这里的用户都很有品味。',
        author: {
          name: '王摄影',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
          role: '摄影师'
        }
      },
      {
        id: '3',
        content: '通过LumaTrip，我不仅记录了自己的旅行，还帮助了很多计划类似行程的朋友。分享的快乐是双倍的！',
        author: {
          name: '张小红',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
          role: '旅行达人'
        }
      }
    ];
    setTestimonials(mockTestimonials);

    // Handle scroll effect for navigation
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 50);
    };

    // Add scroll animations
    const observerElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    observerElements.forEach((el) => observer.observe(el));

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [user]);

  const destinationFilters = ['全部', '亚洲', '欧洲', '美洲', '非洲'];
  const contentFilters = ['最新', '热门', '编辑推荐'];

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="homepage-container min-h-screen bg-gray-50">
      {/* Fixed Navigation */}
      <nav className={`homepage-nav ${isNavScrolled ? 'scrolled' : ''}`}>
        <div className="homepage-container-width">
          <div className="flex items-center justify-between h-[70px]">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">LumaTrip</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">发现</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">目的地</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">故事</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">关于</a>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Globe className="w-5 h-5 text-gray-600" />
              </button>
              <button className="btn-secondary px-4 py-2 text-sm hidden md:block">
                登录
              </button>
              <button className="btn-primary px-4 py-2 text-sm">
                注册
              </button>
              <button 
                className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">LumaTrip</h1>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 space-y-4">
              <a href="#" className="block text-lg font-medium text-gray-900 py-3 border-b">发现</a>
              <a href="#" className="block text-lg font-medium text-gray-900 py-3 border-b">目的地</a>
              <a href="#" className="block text-lg font-medium text-gray-900 py-3 border-b">故事</a>
              <a href="#" className="block text-lg font-medium text-gray-900 py-3 border-b">关于</a>
            </div>
            <div className="p-4 border-t space-y-3">
              <button className="w-full btn-secondary py-3">登录</button>
              <button className="w-full btn-primary py-3">注册</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="homepage-hero">
        <video 
          className="homepage-hero-bg"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/api/placeholder/1920/1080" type="video/mp4" />
        </video>
        <div className="homepage-hero-overlay"></div>
        <div className="homepage-hero-content">
          <h1 className="homepage-hero h1">探索世界，分享你的旅程</h1>
          <p className="homepage-hero p">加入全球旅行者社区，发现精彩目的地</p>
          
          <div className="homepage-search-wrapper mb-12">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索目的地、用户或话题..."
                className="homepage-search w-full pl-16 pr-8 py-4 border-0 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['巴厘岛', '京都', '圣托里尼', '马尔代夫'].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white bg-opacity-20 text-white text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="homepage-cta">
            <button className="btn-primary px-8 py-4 text-lg">
              开始探索
            </button>
            <button className="btn-secondary px-8 py-4 text-lg text-white border-white hover:bg-white hover:text-blue-600">
              了解更多
            </button>
          </div>
        </div>
        
        <div className="homepage-scroll-indicator">
          <ArrowDown className="w-6 h-6 text-white" />
        </div>
      </section>

      {/* Features Section */}
      <section className="homepage-section">
        <div className="homepage-container-width">
          <div className="text-center mb-12">
            <p className="text-sm text-blue-600 font-medium mb-2">为什么选择 LumaTrip</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">让旅行更有意义</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">通过我们的平台，与全球旅行者连接，分享精彩瞬间，发现新的目的地</p>
          </div>
          
          <div className="homepage-features">
            <div className="homepage-feature-card fade-in stagger-fade">
              <div className="homepage-feature-icon">📸</div>
              <h3 className="homepage-feature-title">分享精彩瞬间</h3>
              <p className="homepage-feature-desc">用照片和故事记录你的旅程，让美好回忆永远留存</p>
            </div>
            <div className="homepage-feature-card fade-in stagger-fade">
              <div className="homepage-feature-icon">🗺️</div>
              <h3 className="homepage-feature-title">发现新目的地</h3>
              <p className="homepage-feature-desc">探索全球旅行者推荐的地点，找到你的下一个冒险</p>
            </div>
            <div className="homepage-feature-card fade-in stagger-fade">
              <div className="homepage-feature-icon">👥</div>
              <h3 className="homepage-feature-title">连接旅行伙伴</h3>
              <p className="homepage-feature-desc">认识志同道合的旅行者，一起探索世界的美好</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="homepage-section alt">
        <div className="homepage-container-width">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">热门目的地</h2>
            <p className="text-gray-600 mb-6">发现最受欢迎的旅行目的地</p>
            
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {destinationFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="homepage-destinations">
            {destinations.map((destination) => (
              <div key={destination.id} className="homepage-destination-card">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="homepage-destination-image"
                />
                <div className="homepage-destination-content">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{destination.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{destination.country}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{destination.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500">{formatNumber(destination.posts)} 篇帖子</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {destination.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="homepage-section">
        <div className="homepage-container-width">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">来自社区的精彩分享</h2>
            <p className="text-gray-600 mb-6">探索其他旅行者的故事和经验</p>
            
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {contentFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setContentFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    contentFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="homepage-content-grid">
            {featuredContent.map((content) => (
              <div key={content.id} className="homepage-content-card">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={content.image}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={content.author.avatar}
                      alt={content.author.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-900">{content.author.name}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{content.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {formatNumber(content.likes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {formatNumber(content.comments)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="homepage-testimonials">
        <div className="homepage-container-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">听听他们怎么说</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">来自全球用户的真实评价</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">"</div>
                <p className="text-white mb-6 italic">{testimonial.content}</p>
                <div className="flex items-center justify-center gap-3">
                  <img
                    src={testimonial.author.avatar}
                    alt={testimonial.author.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-white font-medium">{testimonial.author.name}</p>
                    <p className="text-blue-200 text-sm">{testimonial.author.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="homepage-cta-section homepage-section">
        <div className="homepage-container-width">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">准备开始你的旅行故事了吗？</h2>
            <p className="text-blue-100 mb-8 text-lg">加入 LumaTrip，与全球旅行者一起探索世界</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary px-8 py-4 bg-white text-blue-600 hover:bg-gray-100">
                免费注册
              </button>
              <button className="btn-secondary px-8 py-4 text-white border-white hover:bg-white hover:text-blue-600">
                下载应用
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="homepage-container-width">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">LumaTrip</h3>
              </div>
              <p className="text-gray-400 mb-4">探索世界，分享旅程</p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700">
                  <span className="text-sm">i</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">发现</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">热门目的地</a></li>
                <li><a href="#" className="hover:text-white transition-colors">旅行故事</a></li>
                <li><a href="#" className="hover:text-white transition-colors">摄影作品</a></li>
                <li><a href="#" className="hover:text-white transition-colors">旅行攻略</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">社区</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">用户中心</a></li>
                <li><a href="#" className="hover:text-white transition-colors">创作者</a></li>
                <li><a href="#" className="hover:text-white transition-colors">活动</a></li>
                <li><a href="#" className="hover:text-white transition-colors">论坛</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">支持</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">帮助中心</a></li>
                <li><a href="#" className="hover:text-white transition-colors">联系我们</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
                <li><a href="#" className="hover:text-white transition-colors">服务条款</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LumaTrip. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
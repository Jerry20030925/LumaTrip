import { useState, useEffect } from 'react';
import { Search, ArrowDown, Star, Heart, MessageCircle, Globe, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const LandingPage = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [contentFilter, setContentFilter] = useState('Latest');

  useEffect(() => {
    // Mock destinations data
    const mockDestinations: Destination[] = [
      {
        id: '1',
        name: 'Bali',
        country: 'Indonesia',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        rating: 4.8,
        posts: 1234,
        tags: ['Beach', 'Culture', 'Vacation']
      },
      {
        id: '2',
        name: 'Kyoto',
        country: 'Japan',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
        rating: 4.9,
        posts: 892,
        tags: ['Culture', 'History', 'Cherry Blossoms']
      },
      {
        id: '3',
        name: 'Santorini',
        country: 'Greece',
        image: 'https://images.unsplash.com/photo-1570077188648-56e4b16f9d72?w=400&h=300&fit=crop',
        rating: 4.7,
        posts: 756,
        tags: ['Island', 'Romance', 'Sunset']
      },
      {
        id: '4',
        name: 'Maldives',
        country: 'Maldives',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
        rating: 4.9,
        posts: 645,
        tags: ['Beach', 'Honeymoon', 'Diving']
      }
    ];
    setDestinations(mockDestinations);

    // Mock featured content
    const mockContent: FeaturedContent[] = [
      {
        id: '1',
        title: 'Discovering Hidden Beaches in Bali',
        author: {
          name: 'Travel Explorer Alex',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        likes: 1234,
        comments: 89,
        location: 'Bali, Indonesia'
      },
      {
        id: '2',
        title: 'Perfect Cherry Blossom Season Guide in Kyoto',
        author: {
          name: 'Photographer Sam',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
        likes: 856,
        comments: 45,
        location: 'Kyoto, Japan'
      },
      {
        id: '3',
        title: 'Hiking the Swiss Alps Experience',
        author: {
          name: 'Adventure Seeker Mike',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
        },
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        likes: 2156,
        comments: 156,
        location: 'Swiss Alps'
      }
    ];
    setFeaturedContent(mockContent);

    // Mock testimonials
    const mockTestimonials: Testimonial[] = [
      {
        id: '1',
        content: 'LumaTrip helped me discover amazing hidden gems and connect with fellow travelers. The community here is truly wonderful!',
        author: {
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
          role: 'Travel Blogger'
        }
      },
      {
        id: '2',
        content: 'As a photographer, I love sharing my work on LumaTrip and getting inspiration from other travelers. The quality of content here is amazing.',
        author: {
          name: 'David Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
          role: 'Photographer'
        }
      },
      {
        id: '3',
        content: 'Through LumaTrip, I not only documented my travels but also helped many friends plan similar trips. Sharing the joy is double the happiness!',
        author: {
          name: 'Emma Wilson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
          role: 'Travel Expert'
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
  }, []);

  const destinationFilters = ['All', 'Asia', 'Europe', 'Americas', 'Africa'];
  const contentFilters = ['Latest', 'Popular', 'Editor\'s Pick'];

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
              <a href="#discover" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Discover</a>
              <a href="#destinations" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Destinations</a>
              <a href="#stories" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Stories</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">About</a>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Globe className="w-5 h-5 text-gray-600" />
              </button>
              <Link to="/app/login" className="btn-secondary px-4 py-2 text-sm hidden md:block">
                Login
              </Link>
              <Link to="/app/register" className="btn-primary px-4 py-2 text-sm">
                Sign Up
              </Link>
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
              <a href="#discover" className="block text-lg font-medium text-gray-900 py-3 border-b">Discover</a>
              <a href="#destinations" className="block text-lg font-medium text-gray-900 py-3 border-b">Destinations</a>
              <a href="#stories" className="block text-lg font-medium text-gray-900 py-3 border-b">Stories</a>
              <a href="#about" className="block text-lg font-medium text-gray-900 py-3 border-b">About</a>
            </div>
            <div className="p-4 border-t space-y-3">
              <Link to="/app/login" className="w-full btn-secondary py-3 block text-center">Login</Link>
              <Link to="/app/register" className="w-full btn-primary py-3 block text-center">Sign Up</Link>
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
          poster="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop"
        >
          <source src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        </video>
        <div className="homepage-hero-overlay"></div>
        <div className="homepage-hero-content">
          <h1 className="homepage-hero h1">Explore the World, Share Your Journey</h1>
          <p className="homepage-hero p">Join the global community of travelers and discover amazing destinations</p>
          
          <div className="homepage-search-wrapper mb-12">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search destinations, users, or topics..."
                className="homepage-search w-full pl-16 pr-8 py-4 border-0 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['Bali', 'Kyoto', 'Santorini', 'Maldives'].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white bg-opacity-20 text-white text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="homepage-cta">
            <Link to="/app/register" className="btn-primary px-8 py-4 text-lg">
              Start Exploring
            </Link>
            <button className="btn-secondary px-8 py-4 text-lg text-white border-white hover:bg-white hover:text-blue-600">
              Learn More
            </button>
          </div>
        </div>
        
        <div className="homepage-scroll-indicator">
          <ArrowDown className="w-6 h-6 text-white" />
        </div>
      </section>

      {/* Features Section */}
      <section className="homepage-section" id="discover">
        <div className="homepage-container-width">
          <div className="text-center mb-12">
            <p className="text-sm text-blue-600 font-medium mb-2">Why Choose LumaTrip</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Make Travel More Meaningful</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Connect with travelers worldwide, share amazing moments, and discover new destinations through our platform</p>
          </div>
          
          <div className="homepage-features">
            <div className="homepage-feature-card fade-in stagger-fade">
              <div className="homepage-feature-icon">📸</div>
              <h3 className="homepage-feature-title">Share Amazing Moments</h3>
              <p className="homepage-feature-desc">Capture your journey with photos and stories, creating lasting memories</p>
            </div>
            <div className="homepage-feature-card fade-in stagger-fade">
              <div className="homepage-feature-icon">🗺️</div>
              <h3 className="homepage-feature-title">Discover New Destinations</h3>
              <p className="homepage-feature-desc">Explore places recommended by fellow travelers and find your next adventure</p>
            </div>
            <div className="homepage-feature-card fade-in stagger-fade">
              <div className="homepage-feature-icon">👥</div>
              <h3 className="homepage-feature-title">Connect with Travel Buddies</h3>
              <p className="homepage-feature-desc">Meet like-minded travelers and explore the world's beauty together</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="homepage-section alt" id="destinations">
        <div className="homepage-container-width">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
            <p className="text-gray-600 mb-6">Discover the most loved travel destinations</p>
            
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
                  <p className="text-xs text-gray-500">{formatNumber(destination.posts)} posts</p>
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
      <section className="homepage-section" id="stories">
        <div className="homepage-container-width">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Amazing Stories from Our Community</h2>
            <p className="text-gray-600 mb-6">Explore stories and experiences from other travelers</p>
            
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
      <section className="homepage-testimonials" id="about">
        <div className="homepage-container-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">Real reviews from travelers around the world</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Your Travel Story?</h2>
            <p className="text-blue-100 mb-8 text-lg">Join LumaTrip and explore the world with fellow travelers</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/app/register" className="btn-primary px-8 py-4 bg-white text-blue-600 hover:bg-gray-100">
                Sign Up Free
              </Link>
              <button className="btn-secondary px-8 py-4 text-white border-white hover:bg-white hover:text-blue-600">
                Download App
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
              <p className="text-gray-400 mb-4">Explore the world, share your journey</p>
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
              <h4 className="font-semibold mb-4">Discover</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Popular Destinations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Travel Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Photography</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Travel Guides</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">User Hub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Creators</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Forum</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
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

export default LandingPage;
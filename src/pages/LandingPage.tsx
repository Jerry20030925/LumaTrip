import { useState, useEffect } from 'react';
import { Search, ArrowDown, Heart, MessageCircle, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Container,
  Group,
  Button,
  Text,
  Title,
  Stack,
  Card,
  Badge,
  Avatar,
  TextInput,
  Paper,
  Center,
  Box,
  Overlay,
  ActionIcon,
  Burger,
  Drawer,
  Anchor,
  SimpleGrid,
  Image,
  Rating
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import '../styles/LandingPage.css';

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
  const [opened, { open, close }] = useDisclosure(false);
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
    <>
      {/* Fixed Navigation */}
      <Paper
        pos="fixed"
        top={0}
        left={0}
        right={0}
        style={{
          zIndex: 1000,
          backgroundColor: isNavScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.1)',
          backdropFilter: isNavScrolled ? 'blur(10px)' : 'none',
          borderBottom: isNavScrolled ? '1px solid var(--mantine-color-gray-3)' : 'none',
          transition: 'all 0.3s ease'
        }}
        p="md"
        radius={0}
      >
        <Container size="xl">
          <Group justify="space-between" align="center">
            {/* Logo */}
            <Group gap="sm">
              <Box
                style={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Globe size={20} style={{ color: 'white' }} />
              </Box>
              <Title order={2} size="h3" c={isNavScrolled ? 'dark' : 'white'}>
                LumaTrip
              </Title>
            </Group>

            {/* Desktop Navigation */}
            <Group gap="xl" visibleFrom="md">
              <Anchor href="#discover" c={isNavScrolled ? 'dark' : 'white'} fw={500}>
                Discover
              </Anchor>
              <Anchor href="#destinations" c={isNavScrolled ? 'dark' : 'white'} fw={500}>
                Destinations
              </Anchor>
              <Anchor href="#stories" c={isNavScrolled ? 'dark' : 'white'} fw={500}>
                Stories
              </Anchor>
              <Anchor href="#about" c={isNavScrolled ? 'dark' : 'white'} fw={500}>
                About
              </Anchor>
            </Group>

            {/* Right Actions */}
            <Group gap="sm">
              <ActionIcon variant="subtle" c={isNavScrolled ? 'dark' : 'white'}>
                <Globe size={20} />
              </ActionIcon>
              <Button
                component={Link}
                to="/app/login"
                variant={isNavScrolled ? 'subtle' : 'white'}
                color={isNavScrolled ? 'dark' : 'blue'}
                visibleFrom="md"
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/app/register"
                gradient={{ from: 'blue', to: 'purple' }}
                variant="gradient"
              >
                Sign Up
              </Button>
              <Burger
                opened={opened}
                onClick={open}
                hiddenFrom="md"
                color={isNavScrolled ? 'dark' : 'white'}
              />
            </Group>
          </Group>
        </Container>
      </Paper>

      {/* Mobile Menu */}
      <Drawer opened={opened} onClose={close} title="LumaTrip" hiddenFrom="md">
        <Stack gap="lg">
          <Stack gap="md">
            <Anchor href="#discover" size="lg" fw={500} onClick={close}>
              Discover
            </Anchor>
            <Anchor href="#destinations" size="lg" fw={500} onClick={close}>
              Destinations
            </Anchor>
            <Anchor href="#stories" size="lg" fw={500} onClick={close}>
              Stories
            </Anchor>
            <Anchor href="#about" size="lg" fw={500} onClick={close}>
              About
            </Anchor>
          </Stack>
          <Stack gap="sm">
            <Button component={Link} to="/app/login" variant="subtle" fullWidth>
              Login
            </Button>
            <Button component={Link} to="/app/register" fullWidth gradient={{ from: 'blue', to: 'purple' }}>
              Sign Up
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      {/* Hero Section */}
      <Box
        pos="relative"
        style={{
          height: '100vh',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <video 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1
          }}
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop"
        >
          <source src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        </video>
        
        <Overlay color="#000" backgroundOpacity={0.4} zIndex={2} />
        
        <Center style={{ height: '100%', zIndex: 3, position: 'relative' }}>
          <Container size="md">
            <Stack align="center" gap="xl" ta="center">
              <Title
                order={1}
                size={60}
                c="white"
                fw={700}
                style={{
                  lineHeight: 1.2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Explore the World, Share Your Journey
              </Title>
              
              <Text
                size="xl"
                c="white"
                opacity={0.9}
                maw={600}
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                Join the global community of travelers and discover amazing destinations
              </Text>
              
              <Stack align="center" gap="lg" w="100%" maw={600}>
                <TextInput
                  size="xl"
                  radius="xl"
                  placeholder="Search destinations, users, or topics..."
                  leftSection={<Search size={20} />}
                  w="100%"
                  styles={{
                    input: {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      fontSize: '18px',
                      padding: '16px 20px'
                    }
                  }}
                />
                
                <Group justify="center" gap="xs">
                  {['Bali', 'Kyoto', 'Santorini', 'Maldives'].map((tag) => (
                    <Badge
                      key={tag}
                      variant="white"
                      color="blue"
                      size="lg"
                      radius="xl"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </Group>
              </Stack>
              
              <Group justify="center" gap="md">
                <Button
                  component={Link}
                  to="/app/register"
                  size="xl"
                  radius="xl"
                  gradient={{ from: 'blue', to: 'purple' }}
                  style={{
                    padding: '16px 32px',
                    fontSize: '18px',
                    fontWeight: 600
                  }}
                >
                  Start Exploring
                </Button>
                <Button
                  component={Link}
                  to="/app/login"
                  size="xl"
                  radius="xl"
                  variant="white"
                  color="blue"
                  style={{
                    padding: '16px 32px',
                    fontSize: '18px',
                    fontWeight: 600
                  }}
                >
                  Login
                </Button>
              </Group>
            </Stack>
          </Container>
        </Center>
        
        <Center
          pos="absolute"
          bottom={30}
          left={0}
          right={0}
          style={{ zIndex: 3 }}
        >
          <ActionIcon
            variant="transparent"
            c="white"
            size="xl"
            style={{
              animation: 'bounce 2s infinite'
            }}
          >
            <ArrowDown size={24} />
          </ActionIcon>
        </Center>
      </Box>

      {/* Features Section */}
      <Container size="xl" py={100} id="discover">
        <Stack align="center" gap="xl">
          <Stack align="center" gap="md" ta="center">
            <Badge size="lg" variant="light" color="blue" radius="xl">
              Why Choose LumaTrip
            </Badge>
            <Title order={2} size={48} fw={700}>
              Make Travel More Meaningful
            </Title>
            <Text size="lg" c="dimmed" maw={600}>
              Connect with travelers worldwide, share amazing moments, and discover new destinations through our platform
            </Text>
          </Stack>
          
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt="xl">
            <Card padding="xl" radius="lg" shadow="sm" style={{ textAlign: 'center' }}>
              <Text size="48px" mb="md">📸</Text>
              <Title order={3} size="h3" mb="md">
                Share Amazing Moments
              </Title>
              <Text c="dimmed">
                Capture your journey with photos and stories, creating lasting memories
              </Text>
            </Card>
            
            <Card padding="xl" radius="lg" shadow="sm" style={{ textAlign: 'center' }}>
              <Text size="48px" mb="md">🗺️</Text>
              <Title order={3} size="h3" mb="md">
                Discover New Destinations
              </Title>
              <Text c="dimmed">
                Explore places recommended by fellow travelers and find your next adventure
              </Text>
            </Card>
            
            <Card padding="xl" radius="lg" shadow="sm" style={{ textAlign: 'center' }}>
              <Text size="48px" mb="md">👥</Text>
              <Title order={3} size="h3" mb="md">
                Connect with Travel Buddies
              </Title>
              <Text c="dimmed">
                Meet like-minded travelers and explore the world's beauty together
              </Text>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>

      {/* Popular Destinations */}
      <Paper bg="gray.0" py={100} id="destinations">
        <Container size="xl">
          <Stack align="center" gap="xl">
            <Stack align="center" gap="md" ta="center">
              <Title order={2} size={48} fw={700}>
                Popular Destinations
              </Title>
              <Text size="lg" c="dimmed" mb="lg">
                Discover the most loved travel destinations
              </Text>
              
              <Group justify="center" gap="xs">
                {destinationFilters.map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? 'filled' : 'light'}
                    size="sm"
                    radius="xl"
                    onClick={() => setSelectedFilter(filter)}
                  >
                    {filter}
                  </Button>
                ))}
              </Group>
            </Stack>
            
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
              {destinations.map((destination) => (
                <Card key={destination.id} padding="lg" radius="lg" shadow="sm" style={{ cursor: 'pointer' }}>
                  <Card.Section>
                    <Image
                      src={destination.image}
                      alt={destination.name}
                      height={200}
                      fit="cover"
                    />
                  </Card.Section>
                  
                  <Stack gap="xs" mt="md">
                    <Title order={3} size="h4">{destination.name}</Title>
                    <Text size="sm" c="dimmed">{destination.country}</Text>
                    
                    <Group gap="xs">
                      <Rating value={destination.rating} fractions={2} readOnly size="sm" />
                      <Text size="sm" fw={500}>{destination.rating}</Text>
                    </Group>
                    
                    <Text size="xs" c="dimmed">{formatNumber(destination.posts)} posts</Text>
                    
                    <Group gap={4}>
                      {destination.tags.map((tag, index) => (
                        <Badge key={index} size="xs" variant="light" radius="xl">
                          {tag}
                        </Badge>
                      ))}
                    </Group>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Paper>

      {/* Featured Content */}
      <Container size="xl" py={100} id="stories">
        <Stack align="center" gap="xl">
          <Stack align="center" gap="md" ta="center">
            <Title order={2} size={48} fw={700}>
              Amazing Stories from Our Community
            </Title>
            <Text size="lg" c="dimmed" mb="lg">
              Explore stories and experiences from other travelers
            </Text>
            
            <Group justify="center" gap="xs">
              {contentFilters.map((filter) => (
                <Button
                  key={filter}
                  variant={contentFilter === filter ? 'filled' : 'outline'}
                  size="sm"
                  radius="xl"
                  onClick={() => setContentFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </Group>
          </Stack>
          
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {featuredContent.map((content) => (
              <Card key={content.id} padding="lg" radius="lg" shadow="sm" style={{ cursor: 'pointer' }}>
                <Card.Section>
                  <Image
                    src={content.image}
                    alt={content.title}
                    height={200}
                    fit="cover"
                  />
                </Card.Section>
                
                <Stack gap="sm" mt="md">
                  <Group gap="xs">
                    <Avatar src={content.author.avatar} size="sm" radius="xl" />
                    <Text size="sm" fw={500}>{content.author.name}</Text>
                  </Group>
                  
                  <Title order={3} size="h4" lineClamp={2}>
                    {content.title}
                  </Title>
                  
                  <Group gap="lg">
                    <Group gap={4}>
                      <Heart size={16} />
                      <Text size="sm" c="dimmed">{formatNumber(content.likes)}</Text>
                    </Group>
                    <Group gap={4}>
                      <MessageCircle size={16} />
                      <Text size="sm" c="dimmed">{formatNumber(content.comments)}</Text>
                    </Group>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      {/* Testimonials Section */}
      <Box
        py={100}
        id="about"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Container size="xl">
          <Stack align="center" gap="xl">
            <Stack align="center" gap="md" ta="center">
              <Title order={2} size={48} fw={700} c="white">
                What Our Users Say
              </Title>
              <Text size="lg" c="blue.1" maw={600}>
                Real reviews from travelers around the world
              </Text>
            </Stack>
            
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {testimonials.map((testimonial) => (
                <Paper
                  key={testimonial.id}
                  p="xl"
                  radius="lg"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                  }}
                >
                  <Stack align="center" gap="md">
                    <Text size="48px" c="white">"</Text>
                    <Text c="white" style={{ fontStyle: 'italic' }}>
                      {testimonial.content}
                    </Text>
                    <Group gap="sm">
                      <Avatar
                        src={testimonial.author.avatar}
                        size="lg"
                        radius="xl"
                      />
                      <Stack gap={2}>
                        <Text c="white" fw={500}>{testimonial.author.name}</Text>
                        <Text size="sm" c="blue.1">{testimonial.author.role}</Text>
                      </Stack>
                    </Group>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Paper
        py={100}
        style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
        }}
      >
        <Container size="xl">
          <Center>
            <Stack align="center" gap="xl" ta="center" maw={800}>
              <Title order={2} size={48} fw={700} c="white">
                Ready to Start Your Travel Story?
              </Title>
              <Text size="xl" c="blue.1">
                Join LumaTrip and explore the world with fellow travelers
              </Text>
              <Group justify="center" gap="md">
                <Button
                  component={Link}
                  to="/app/register"
                  size="xl"
                  radius="xl"
                  variant="white"
                  color="blue"
                  style={{
                    padding: '16px 32px',
                    fontSize: '18px',
                    fontWeight: 600
                  }}
                >
                  Sign Up Free
                </Button>
                <Button
                  size="xl"
                  radius="xl"
                  variant="outline"
                  c="white"
                  style={{
                    borderColor: 'white',
                    padding: '16px 32px',
                    fontSize: '18px',
                    fontWeight: 600
                  }}
                >
                  Download App
                </Button>
              </Group>
            </Stack>
          </Center>
        </Container>
      </Paper>

      {/* Footer */}
      <Paper bg="dark.8" c="white" py={80}>
        <Container size="xl">
          <SimpleGrid cols={{ base: 1, md: 4 }} spacing="lg">
            <Box>
              <Group gap="sm" mb="md">
                <Box
                  style={{
                    width: 32,
                    height: 32,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Globe size={20} style={{ color: 'white' }} />
                </Box>
                <Title order={3} size="h3" c="white">
                  LumaTrip
                </Title>
              </Group>
              <Text c="dimmed" mb="md">
                Explore the world, share your journey
              </Text>
              <Group gap="sm">
                <ActionIcon variant="subtle" size="lg" radius="xl" c="dimmed">
                  <Text size="sm">f</Text>
                </ActionIcon>
                <ActionIcon variant="subtle" size="lg" radius="xl" c="dimmed">
                  <Text size="sm">t</Text>
                </ActionIcon>
                <ActionIcon variant="subtle" size="lg" radius="xl" c="dimmed">
                  <Text size="sm">i</Text>
                </ActionIcon>
              </Group>
            </Box>
            
            <Box>
              <Text fw={600} mb="md" c="white">
                Discover
              </Text>
              <Stack gap="xs">
                <Anchor c="dimmed" size="sm">Popular Destinations</Anchor>
                <Anchor c="dimmed" size="sm">Travel Stories</Anchor>
                <Anchor c="dimmed" size="sm">Photography</Anchor>
                <Anchor c="dimmed" size="sm">Travel Guides</Anchor>
              </Stack>
            </Box>
            
            <Box>
              <Text fw={600} mb="md" c="white">
                Community
              </Text>
              <Stack gap="xs">
                <Anchor c="dimmed" size="sm">User Hub</Anchor>
                <Anchor c="dimmed" size="sm">Creators</Anchor>
                <Anchor c="dimmed" size="sm">Events</Anchor>
                <Anchor c="dimmed" size="sm">Forum</Anchor>
              </Stack>
            </Box>
            
            <Box>
              <Text fw={600} mb="md" c="white">
                Support
              </Text>
              <Stack gap="xs">
                <Anchor c="dimmed" size="sm">Help Center</Anchor>
                <Anchor c="dimmed" size="sm">Contact Us</Anchor>
                <Anchor c="dimmed" size="sm">Privacy Policy</Anchor>
                <Anchor c="dimmed" size="sm">Terms of Service</Anchor>
              </Stack>
            </Box>
          </SimpleGrid>
          
          <Box mt={60} pt="lg" style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
            <Text ta="center" c="dimmed" size="sm">
              &copy; 2024 LumaTrip. All rights reserved.
            </Text>
          </Box>
        </Container>
      </Paper>
    </>
  );
};

export default LandingPage;
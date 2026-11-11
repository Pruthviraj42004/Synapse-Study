import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  alpha
} from '@mui/material';
import {
  VideoCall,
  Chat,
  Draw,
  Groups,
  CloudUpload,
  Security,
  AutoAwesome,
  TrendingUp,
  EmojiEvents
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Groups fontSize="large" />,
      title: 'Study Rooms',
      description: 'Create or join collaborative study sessions with other students',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      delay: 0.1
    },
    {
      icon: <Chat fontSize="large" />,
      title: 'Real-time Chat',
      description: 'Communicate instantly with your study group members',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      delay: 0.2
    },
    {
      icon: <VideoCall fontSize="large" />,
      title: 'Video Conferencing',
      description: 'Face-to-face discussions with integrated video calling',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      delay: 0.3
    },
    {
      icon: <Draw fontSize="large" />,
      title: 'Virtual Whiteboard',
      description: 'Collaborative whiteboard for visual learning and problem solving',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      delay: 0.4
    },
    {
      icon: <CloudUpload fontSize="large" />,
      title: 'File Sharing',
      description: 'Share documents, notes, and resources with your study group',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      delay: 0.5
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      delay: 0.6
    }
  ];

  const stats = [
    { value: '10K+', label: 'Active Students', icon: <Groups /> },
    { value: '5K+', label: 'Study Sessions', icon: <TrendingUp /> },
    { value: '50+', label: 'Subject Areas', icon: <EmojiEvents /> }
  ];

  return (
    <>
      <Helmet>
        <title>Study Sphere - Collaborative Online Learning Platform</title>
        <meta name="description" content="Join thousands of students in collaborative online learning. Create study rooms, share resources, and learn together with real-time video, chat, and whiteboard features." />
      </Helmet>

      {/* Background Effects */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, rgba(0,240,255,0) 70%)',
            animation: 'float-slow 8s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '10%',
            left: '10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(189,0,255,0.15) 0%, rgba(189,0,255,0) 70%)',
            animation: 'float 10s ease-in-out infinite',
          }
        }}
      />

      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 8, md: 12 },
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease-out'
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
            <AutoAwesome
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                fontSize: 40,
                color: 'primary.main',
                animation: 'rotate-slow 20s linear infinite'
              }}
            />
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              className="animated-gradient-text"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                fontWeight: 'bold',
                mb: 2
              }}
            >
              Study Sphere
            </Typography>
          </Box>

          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            className="fade-in-up"
            sx={{
              mb: 3,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 300,
              color: 'text.primary',
            }}
          >
            Collaborative Online Learning Platform
          </Typography>

          <Typography
            variant="h6"
            className="fade-in-up stagger-2"
            sx={{
              mb: 5,
              maxWidth: 700,
              mx: 'auto',
              color: 'text.secondary',
              lineHeight: 1.8,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            Connect with fellow students, create study groups, and learn together with
            real-time video conferencing, interactive whiteboards, and seamless file sharing.
          </Typography>

          <Box
            className="fade-in-up stagger-3"
            sx={{
              display: 'flex',
              gap: 3,
              justifyContent: 'center',
              flexWrap: 'wrap',
              mb: 6
            }}
          >
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              className="glow-pulse"
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: '50px',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #00f0ff 0%, #7c3aed 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00f0ff 20%, #7c3aed 120%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(0, 240, 255, 0.4)'
                }
              }}
            >
              Get Started Free
            </Button>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              size="large"
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: '50px',
                borderWidth: '2px',
                textTransform: 'none',
                '&:hover': {
                  borderWidth: '2px',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)'
                }
              }}
            >
              Sign In
            </Button>
          </Box>

          {/* Trust Indicators */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip
              label="Free Forever"
              sx={{
                background: alpha('#00f0ff', 0.1),
                color: 'primary.main',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                px: 1
              }}
            />
            <Chip
              label="No Credit Card"
              sx={{
                background: alpha('#7c3aed', 0.1),
                color: 'secondary.main',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                px: 1
              }}
            />
            <Chip
              label="Instant Access"
              sx={{
                background: alpha('#bd00ff', 0.1),
                color: '#bd00ff',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                px: 1
              }}
            />
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            className="text-gradient-cyber"
            sx={{
              mb: 2,
              fontWeight: 'bold',
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Why Choose Study Sphere?
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Everything you need for collaborative learning in one platform
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid
                item
                xs={12}
                md={6}
                lg={4}
                key={index}
                className={`fade-in-up stagger-${index + 1}`}
              >
                <Card
                  className="glass-card-enhanced hover-lift"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: feature.gradient,
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4, flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: '16px',
                        background: feature.gradient,
                        mb: 3,
                        animation: 'float 3s ease-in-out infinite',
                        animationDelay: `${feature.delay}s`
                      }}
                    >
                      <Box sx={{ color: 'white' }}>
                        {feature.icon}
                      </Box>
                    </Box>
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{ fontWeight: 'bold', mb: 2 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Stats Section */}
        <Box
          sx={{
            py: 8,
            px: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(0,240,255,0.05) 0%, rgba(189,0,255,0.05) 100%)',
            border: '1px solid',
            borderColor: alpha('#00f0ff', 0.2),
            my: 8,
            position: 'relative',
            overflow: 'hidden'
          }}
          className="dots-bg"
        >
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            align="center"
            sx={{ mb: 6, fontWeight: 'bold' }}
          >
            Join Our Learning Community
          </Typography>

          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 3,
                  }}
                  className={`fade-in-up stagger-${index + 1}`}
                >
                  <Box sx={{ mb: 2, color: 'primary.main', fontSize: 48 }}>
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h2"
                    className="animated-gradient-text"
                    sx={{
                      fontWeight: 'bold',
                      mb: 1,
                      fontSize: { xs: '2.5rem', md: '3.5rem' }
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontWeight: 'medium' }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            mb: 4
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Ready to Start Learning?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Create your free account and join study sessions today!
          </Typography>

          <Button
            component={Link}
            to="/register"
            variant="contained"
            size="large"
            className="glow-pulse-pink"
            sx={{
              px: 8,
              py: 2.5,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: '50px',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #f093fb 20%, #f5576c 120%)',
                transform: 'scale(1.05)',
              }
            }}
          >
            Start Learning Now
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default Home;
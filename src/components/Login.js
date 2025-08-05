import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Container,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  School as SchoolIcon,
  LockOutlined as LockIcon,
  EmailOutlined as EmailIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';

const MotionPaper = motion(Paper);
const MotionButton = motion(Button);
const MotionBox = motion(Box);

const Login = ({ setIsLoggedIn, setView, setTeacherId }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken(true);
      
      const response = await axios.post('/api/auth/login', { email }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      localStorage.setItem('token', token);
      setTeacherId(response.data.teacher.id);
      setIsLoggedIn(true);
      setView('dashboard');
    } catch (error) {
      setError('Login failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B73FF 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            variants={floatingVariants}
            animate="animate"
            style={{
              position: 'absolute',
              width: `${40 + i * 20}px`,
              height: `${40 + i * 20}px`,
              borderRadius: '50%',
              background: `rgba(255, 255, 255, ${0.1 - i * 0.01})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </Box>

      <Container 
        maxWidth="sm" 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          py: { xs: 2, sm: 4 }
        }}
      >
        <MotionPaper
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          elevation={24}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.95)',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <MotionBox variants={itemVariants} textAlign="center" mb={4}>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <SchoolIcon 
                sx={{ 
                  fontSize: { xs: 60, sm: 80 }, 
                  color: '#667eea', 
                  mb: 2,
                  filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))'
                }} 
              />
            </motion.div>
            
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '3rem' },
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                letterSpacing: '-0.02em'
              }}
            >
              Welcome Back
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Sign in to your teacher dashboard
            </Typography>
          </MotionBox>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem'
                  }
                }}
              >
                {error}
              </Alert>
            </motion.div>
          )}

          <MotionBox variants={itemVariants} component="form" noValidate>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)'
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)'
                  }
                }
              }}
            />
            
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)'
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)'
                  }
                }
              }}
            />

            <MotionButton
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 2,
                borderRadius: 3,
                fontSize: '1.2rem',
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                  boxShadow: '0 12px 35px rgba(102, 126, 234, 0.6)',
                },
                '&:disabled': {
                  background: 'linear-gradient(45deg, #a0a0a0, #888888)',
                }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} color="inherit" />
                  Signing In...
                </Box>
              ) : (
                'Sign In'
              )}
            </MotionButton>
          </MotionBox>
        </MotionPaper>
      </Container>
    </Box>
  );
};

export default Login;

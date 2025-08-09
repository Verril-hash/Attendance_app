// Login.js
import React, { useState } from 'react';
import {
  TextField, Button, Typography, Box, Paper, Container, Alert, CircularProgress, IconButton, InputAdornment,
} from '@mui/material';
import {
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, School as SchoolIcon,
  LockOutlined as LockIcon, EmailOutlined as EmailIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { validateToken } from '../services/api';

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
      console.log('Generated Token:', token); // Debug
      localStorage.setItem('token', token); // Set token first

      // Manually set the token for this request
      const response = await validateToken(email, token); // Pass token explicitly
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
      <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            variants={floatingVariants}
            animate="animate"
            style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
          />
        ))}
      </Box>
      <Container maxWidth="xs">
        <MotionPaper
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          elevation={6}
          sx={{
            mt: 8,
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <motion.div variants={itemVariants}>
              <SchoolIcon sx={{ fontSize: 60, color: '#667eea' }} />
            </motion.div>
          </Box>

          <Typography variant="h5" align="center" gutterBottom sx={{ color: '#333', fontWeight: 700 }}>
            Teacher Login
          </Typography>

          <MotionBox variants={itemVariants}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#667eea' }} />
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
          </MotionBox>

          <MotionBox variants={itemVariants}>
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {error && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}
        </MotionPaper>
      </Container>
    </Box>
  );
};

export default Login;
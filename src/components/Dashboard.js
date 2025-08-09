import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Container,
  Chip,
  IconButton,
  Fab,
  Avatar,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Class as ClassIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { getClasses, getAnalytics, createClass } from '../services/api';

const MotionCard = motion(Card);
const MotionFab = motion(Fab);
const MotionBox = motion(Box);

const Dashboard = ({ setView, setClassId }) => {
  const [classes, setClasses] = useState([]);
  const [analytics, setAnalytics] = useState({ dates: [], rates: [] });
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  const [openClassSetup, setOpenClassSetup] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    timings: {
      Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '', Saturday: ''
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await getClasses();
        setClasses(response.data);
        if (response.data.length > 0) {
          setSelectedClassId(response.data[0].id);
          setClassId(response.data[0].id);
        } else {
          setError('No classes found. Create a class to get started.');
        }
      } catch (error) {
        const errorMsg = error.response?.data?.error || error.message || 'Failed to fetch classes';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();

    const interval = setInterval(() => {
      setCurrentDate(new Date().toDateString());
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedClassId) return;

      try {
        const response = await getAnalytics(selectedClassId);
        setAnalytics(response.data);
      } catch (error) {
        const errorMsg = error.response?.data?.error || error.message || 'Failed to fetch analytics';
        setError(errorMsg);
      }
    };
    fetchAnalytics();
  }, [selectedClassId]);

  const handleClassSetupOpen = () => setOpenClassSetup(true);
  const handleClassSetupClose = () => setOpenClassSetup(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass(prev => ({ ...prev, [name]: value }));
  };

  const handleTimingChange = (day) => (e) => {
    const { value } = e.target;
    setNewClass(prev => ({
      ...prev,
      timings: { ...prev.timings, [day]: value },
    }));
  };

  const handleCreateClass = async () => {
    try {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        const payload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
        userId = payload.uid || payload.sub;
        if (!userId) throw new Error('No user ID found');
      }

      const response = await createClass({
        name: newClass.name,
        description: newClass.description,
        teacher_id: userId,
        timings: newClass.timings,
      });

      setClasses([...classes, response.data]);
      setNewClass({
        name: '',
        description: '',
        timings: { Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '', Saturday: '' }
      });
      handleClassSetupClose();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create class';
      setError(errorMsg);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleAnalyticsClick = () => {
    if (selectedClassId) {
      setView('analytics');
    } else {
      setError('Please select a class first.');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pb: { xs: 2, sm: 4 }
    }}>
      <Container maxWidth="xl" sx={{ pt: { xs: 1, sm: 2, md: 4 } }}>
        {/* Header Section */}
        <MotionBox
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{ mb: { xs: 2, sm: 4 } }}
        >
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: { xs: 2, sm: 4 },
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, opacity: 0.1 }}>
              <ClassIcon sx={{ fontSize: { xs: 80, sm: 120 } }} />
            </Box>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                    <Avatar 
                      sx={{ 
                        width: { xs: 40, sm: 50, md: 60 }, 
                        height: { xs: 40, sm: 50, md: 60 }, 
                        mr: { xs: 1, sm: 2 },
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <PersonIcon sx={{ fontSize: { xs: 20, sm: 30, md: 35 } }} />
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h3" 
                        component="h1" 
                        sx={{ 
                          fontWeight: 800,
                          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                          lineHeight: 1.2
                        }}
                      >
                        Dashboard
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          opacity: 0.9,
                          fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                        }}
                      >
                        Welcome back, Pranav Pitre!
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mb: { xs: 0.5, sm: 1 } }}>
                      <CalendarIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 20 } }} />
                      <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>
                        {currentDate}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.9rem' } }}>
                      {getCurrentTime()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </MotionBox>

        {/* Stats Cards */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
            <Grid item xs={12} sm={6} md={3}>
              <MotionCard 
                variants={statsVariants}
                whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                sx={{ 
                  borderRadius: { xs: 2, sm: 3 },
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                  <ClassIcon sx={{ fontSize: { xs: 30, sm: 40 }, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {loading ? <Skeleton width={50} /> : classes.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.9rem' } }}>
                    Total Classes
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MotionCard 
                variants={statsVariants}
                whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                sx={{ 
                  borderRadius: { xs: 2, sm: 3 },
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: 'white'
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                  <TrendingUpIcon sx={{ fontSize: { xs: 30, sm: 40 }, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {loading ? <Skeleton width={50} /> : analytics.rates.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.9rem' } }}>
                    Records
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MotionCard 
                variants={statsVariants}
                whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                sx={{ 
                  borderRadius: { xs: 2, sm: 3 },
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white'
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                  <AnalyticsIcon sx={{ fontSize: { xs: 30, sm: 40 }, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {loading ? <Skeleton width={50} /> : 
                      analytics.rates.length > 0 ? 
                        (analytics.rates.reduce((a, b) => a + b, 0) / analytics.rates.length).toFixed(0) + '%' 
                        : '0%'
                    }
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.9rem' } }}>
                    Avg Attendance
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MotionCard 
                variants={statsVariants}
                whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                sx={{ 
                  borderRadius: { xs: 2, sm: 3 },
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white'
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                  <ScheduleIcon sx={{ fontSize: { xs: 30, sm: 40 }, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {loading ? <Skeleton width={50} /> : 
                      Object.values(classes.reduce((acc, cls) => 
                        ({ ...acc, ...cls.timings }), {}
                      )).filter(Boolean).length
                    }
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.9rem' } }}>
                    Total Schedules
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          </Grid>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card sx={{ mb: { xs: 2, sm: 3 }, borderLeft: '4px solid #ef4444', bgcolor: '#fef2f2' }}>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Typography color="#dc2626" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  {error}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Classes Section */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          sx={{ mb: { xs: 2, sm: 4 } }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              mb: { xs: 2, sm: 3 }, 
              fontWeight: 700, 
              color: '#1e293b',
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.25rem' },
              textAlign: 'center',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: { xs: '40px', sm: '50px' },
                height: '3px',
                background: '#667eea',
                borderRadius: '2px',
              }
            }}
          >
            Your Classes
          </Typography>
          
          {loading ? (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {[...Array(3)].map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card sx={{ borderRadius: { xs: 8, sm: 12 }, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Skeleton variant="rectangular" height={150} sx={{ borderRadius: { xs: 4, sm: 8 }, mb: 2 }} />
                      <Skeleton variant="text" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 1 }} />
                      <Skeleton variant="text" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                <AnimatePresence>
                  {classes.map((cls, index) => (
                    <Grid item xs={12} sm={6} md={4} key={cls.id}>
                      <MotionCard
                        variants={cardVariants}
                        whileHover={{ y: -10, boxShadow: '0 12px 30px rgba(0,0,0,0.2)' }}
                        sx={{ 
                          borderRadius: { xs: 8, sm: 12 },
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                            transform: 'scale(1.02)'
                          }
                        }}
                        onClick={() => {
                          setSelectedClassId(cls.id);
                          setClassId(cls.id);
                          setView('classDetails');
                        }}
                      >
                        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative', color: 'white' }}>
                          <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip 
                              label={cls.name} 
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                color: 'white',
                                borderRadius: 8,
                                p: '4px 12px'
                              }}
                            />
                            <Box sx={{ 
                              bgcolor: 'rgba(255, 255, 255, 0.2)', 
                              borderRadius: '50%', 
                              p: 1 
                            }}>
                              <ClassIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                          </Box>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.9)',
                              mb: { xs: 2, sm: 3 },
                              fontSize: '0.95rem',
                              lineHeight: 1.6
                            }}
                          >
                            {cls.description || 'No description available'}
                          </Typography>
                          <Box sx={{ 
                            overflowX: 'auto',
                            whiteSpace: 'nowrap',
                            pb: 2,
                            '&::-webkit-scrollbar': { height: '6px' },
                            '&::-webkit-scrollbar-thumb': { 
                              background: 'rgba(255, 255, 255, 0.3)', 
                              borderRadius: '4px' 
                            },
                            '&::-webkit-scrollbar-track': { background: 'transparent' }
                          }}>
                            {Object.entries(cls.timings).map(([day, time]) => time && (
                              <Box
                                key={day}
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                                  borderRadius: 8,
                                  p: 1,
                                  mr: 1.5,
                                  transition: 'transform 0.2s, box-shadow 0.2s',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                  }
                                }}
                              >
                                <AccessTimeIcon sx={{ fontSize: 18, mr: 1, color: 'white' }} />
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: 'white',
                                    fontSize: '0.85rem',
                                    fontWeight: 500
                                  }}
                                >
                                  {`${day}: ${time}`}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </CardContent>
                      </MotionCard>
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            </motion.div>
          )}
        </MotionBox>

        {/* Floating Action Buttons */}
        <Box sx={{ 
          position: 'fixed', 
          bottom: { xs: 12, sm: 16, md: 24 }, 
          right: { xs: 12, sm: 16, md: 24 }, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 1, sm: 2 } 
        }}>
          <MotionFab
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAnalyticsClick}
            sx={{
              background: 'linear-gradient(45deg, #ff9800, #f57c00)',
              color: 'white',
              width: { xs: 48, sm: 56, md: 64 },
              height: { xs: 48, sm: 56, md: 64 },
              '&:hover': {
                background: 'linear-gradient(45deg, #fb8c00, #ef6c00)',
                boxShadow: '0 8px 25px rgba(255, 152, 0, 0.4)'
              }
            }}
          >
            <AnalyticsIcon sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
          </MotionFab>

          <MotionFab
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClassSetupOpen}
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              width: { xs: 48, sm: 56, md: 64 },
              height: { xs: 48, sm: 56, md: 64 },
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            <AddIcon sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
          </MotionFab>
        </Box>
        {/* Class Setup Dialog */}
        <Dialog 
          open={openClassSetup} 
          onClose={handleClassSetupClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: { xs: 2, sm: 4 } } }}
        >
          <DialogTitle sx={{ 
            fontSize: { xs: '1.2rem', sm: '1.5rem' }, 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Create New Class
          </DialogTitle>
          <DialogContent sx={{ pt: { xs: 2, sm: 3 } }}>
            <TextField
              label="Class Name"
              name="name"
              value={newClass.name}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: '0.9rem', sm: '1rem' } }}
            />
            <TextField
              label="Description"
              name="description"
              value={newClass.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: '0.9rem', sm: '1rem' } }}
            />
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <TextField
                key={day}
                label={`${day} Timing`}
                value={newClass.timings[day]}
                onChange={handleTimingChange(day)}
                fullWidth
                margin="normal"
                variant="outlined"
                placeholder="e.g., 9:00 AM - 11:00 AM"
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              />
            ))}
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
            <Button onClick={handleClassSetupClose} sx={{ textTransform: 'none', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateClass} 
              variant="contained"
              sx={{
                textTransform: 'none',
                borderRadius: { xs: 1, sm: 2 },
                px: { xs: 2, sm: 3 },
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                },
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Create Class
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;
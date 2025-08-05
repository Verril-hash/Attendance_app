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
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

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
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await axios.get('/api/classes', {
          headers: { Authorization: `Bearer ${token}` },
        });

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
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await axios.get(`/api/analytics/${selectedClassId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      let userId = localStorage.getItem('userId');
      if (!userId) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.uid || payload.sub;
        if (!userId) throw new Error('No user ID found');
      }

      const response = await axios.post('/api/classes', {
        name: newClass.name,
        description: newClass.description,
        teacher_id: userId,
        timings: newClass.timings,
      }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pb: 4
    }}>
      <Container maxWidth="xl" sx={{ pt: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        {/* Header Section */}
        <MotionBox
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{ mb: { xs: 3, sm: 4 } }}
        >
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, opacity: 0.1 }}>
              <ClassIcon sx={{ fontSize: { xs: 80, sm: 120 } }} />
            </Box>
            <CardContent sx={{ p: { xs: 2, sm: 4 }, position: 'relative', zIndex: 1 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: { xs: 40, sm: 60 }, 
                        height: { xs: 40, sm: 60 }, 
                        mr: { xs: 1, sm: 2 },
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <PersonIcon sx={{ fontSize: { xs: 24, sm: 35 } }} />
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h3" 
                        component="h1" 
                        sx={{ 
                          fontWeight: 800,
                          fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3rem' },
                          lineHeight: 1.2
                        }}
                      >
                        Dashboard
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          opacity: 0.9,
                          fontSize: { xs: '0.9rem', sm: '1.25rem' }
                        }}
                      >
                        Welcome back, Sir Pranav!
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mb: 1 }}>
                      <CalendarIcon sx={{ mr: 1 }} />
                      <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                        {currentDate}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ opacity: 0.8, fontSize: { xs: '0.8rem', sm: '1rem' } }}>
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
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
            <Grid item xs={6} sm={3}>
              <MotionCard 
                variants={statsVariants}
                whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                sx={{ 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                  <ClassIcon sx={{ fontSize: { xs: 28, sm: 40 }, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    {loading ? <Skeleton width={60} /> : classes.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Total Classes
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <MotionCard 
                variants={statsVariants}
                whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                sx={{ 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: 'white'
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                  <TrendingUpIcon sx={{ fontSize: { xs: 28, sm: 40 }, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    {loading ? <Skeleton width={60} /> : analytics.rates.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Records
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={6} sm={3}>
              <MotionCard 
                variants={statsVariants}
                whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                sx={{ 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white'
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                  <AnalyticsIcon sx={{ fontSize: { xs: 28, sm: 40 }, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    {loading ? <Skeleton width={60} /> : 
                      analytics.rates.length > 0 ? 
                        (analytics.rates.reduce((a, b) => a + b, 0) / analytics.rates.length).toFixed(0) + '%' 
                        : '0%'
                    }
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Avg Attendance
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={6} sm={3}>
              <MotionCard 
                variants={statsVariants}
                whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                sx={{ 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white'
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                  <ScheduleIcon sx={{ fontSize: { xs: 28, sm: 40 }, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    {loading ? <Skeleton width={60} /> : 
                      Object.values(classes.reduce((acc, cls) => 
                        ({ ...acc, ...cls.timings }), {}
                      )).filter(Boolean).length
                    }
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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
            <Card sx={{ mb: 3, borderLeft: '4px solid #ef4444', bgcolor: '#fef2f2' }}>
              <CardContent>
                <Typography color="#dc2626" sx={{ fontWeight: 500 }}>
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
          sx={{ mb: { xs: 3, sm: 4 } }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 3, 
              fontWeight: 700, 
              color: '#1e293b',
              fontSize: { xs: '1.5rem', sm: '2.25rem' }
            }}
          >
            Your Classes
          </Typography>
          
          {loading ? (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {[...Array(3)].map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
                      <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
                      <Skeleton variant="text" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <AnimatePresence>
                  {classes.map((cls, index) => (
                    <Grid item xs={12} sm={6} lg={4} key={cls.id}>
                      <MotionCard
                        variants={cardVariants}
                        whileHover={{ 
                          y: -10, 
                          boxShadow: '0 20px 40px rgba(0,0,0,0.15)' 
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedClassId(cls.id);
                          setClassId(cls.id);
                          setView('classDetails');
                        }}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 4,
                          overflow: 'hidden',
                          background: `linear-gradient(135deg, ${
                            index % 4 === 0 ? '#667eea, #764ba2' :
                            index % 4 === 1 ? '#f093fb, #f5576c' :
                            index % 4 === 2 ? '#4facfe, #00f2fe' :
                            '#43e97b, #38f9d7'
                          })`,
                          color: 'white',
                          transition: 'all 0.3s ease',
                          position: 'relative'
                        }}
                      >
                        <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                          <ClassIcon sx={{ fontSize: { xs: 80, sm: 100 } }} />
                        </Box>
                        <CardContent sx={{ p: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <ClassIcon sx={{ mr: 2, fontSize: { xs: 24, sm: 32 } }} />
                            <Typography 
                              variant="h5" 
                              component="h2" 
                              sx={{ 
                                fontWeight: 700,
                                fontSize: { xs: '1.1rem', sm: '1.5rem' }
                              }}
                            >
                              {cls.name}
                            </Typography>
                          </Box>
                          
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              mb: 3, 
                              opacity: 0.9,
                              fontSize: { xs: '0.85rem', sm: '1rem' },
                              minHeight: { xs: '2em', sm: '2.5em' }
                            }}
                          >
                            {cls.description || 'No description available'}
                          </Typography>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {Object.entries(cls.timings || {})
                              .filter(([_, time]) => time)
                              .slice(0, { xs: 2, sm: 3 }[window.innerWidth < 600 ? 'xs' : 'sm'])
                              .map(([day, time]) => (
                                <Chip 
                                  key={day}
                                  label={`${day.slice(0, 3)}: ${time}`}
                                  size="small"
                                  sx={{ 
                                    bgcolor: 'rgba(255,255,255,0.25)',
                                    color: 'white',
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                    fontWeight: 500,
                                    backdropFilter: 'blur(10px)'
                                  }}
                                />
                              ))}
                            {Object.values(cls.timings || {}).filter(Boolean).length > 3 && (
                              <Chip 
                                label={`+${Object.values(cls.timings || {}).filter(Boolean).length - 3} more`}
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(255,255,255,0.25)',
                                  color: 'white',
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  fontWeight: 500
                                }}
                              />
                            )}
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

        {/* Analytics Button */}
        {selectedClassId && (
          <MotionBox
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            sx={{ position: 'fixed', bottom: { xs: 100, sm: 120 }, right: { xs: 16, sm: 24 } }}
          >
            <Fab
              color="secondary"
              onClick={() => setView('analytics')}
              size={window.innerWidth < 600 ? "medium" : "large"}
              sx={{
                background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ff5252, #e53e3e)',
                  transform: 'scale(1.1)',
                },
                boxShadow: '0 8px 25px rgba(255, 107, 107, 0.4)'
              }}
            >
              <AnalyticsIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />
            </Fab>
          </MotionBox>
        )}

        {/* Create Class Button */}
        <MotionFab
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          color="primary"
          onClick={handleClassSetupOpen}
          size={window.innerWidth < 600 ? "medium" : "large"}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
            },
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
          }}
        >
          <AddIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />
        </MotionFab>

        {/* Create Class Dialog */}
        <Dialog 
          open={openClassSetup} 
          onClose={handleClassSetupClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              p: 1,
              mx: { xs: 2, sm: 4 }
            }
          }}
        >
          <DialogTitle sx={{ 
            fontSize: { xs: '1.5rem', sm: '1.8rem' }, 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            pb: 1
          }}>
            Create New Class
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              name="name"
              label="Class Name"
              value={newClass.name}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <TextField
              name="description"
              label="Description"
              value={newClass.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              rows={3}
              sx={{ mb: 4 }}
            />

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1e293b', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Class Schedule
            </Typography>
            
            <Grid container spacing={2}>
              {Object.keys(newClass.timings).map(day => (
                <Grid item xs={12} sm={6} md={4} key={day}>
                  <TextField
                    label={day}
                    value={newClass.timings[day]}
                    onChange={handleTimingChange(day)}
                    fullWidth
                    size="small"
                    placeholder="e.g., 10:00 AM"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={handleClassSetupClose} 
              sx={{ mr: 1, textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateClass} 
              variant="contained"
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                }
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

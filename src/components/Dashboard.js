// Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Button, Typography, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent,
  Grid, Container, Chip, IconButton, Fab, Avatar, Skeleton,
} from '@mui/material';
import {
  Add as AddIcon, Analytics as AnalyticsIcon, Class as ClassIcon, Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon, Person as PersonIcon, CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { getClasses, createClass } from '../services/api';

const MotionCard = motion(Card);
const MotionFab = motion(Fab);
const MotionBox = motion(Box);

const Dashboard = ({ setView, setClassId }) => {
  const [classes, setClasses] = useState([]);
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

  const handleInputChange = (e) => {
    setNewClass({ ...newClass, [e.target.name]: e.target.value });
  };

  const handleTimingChange = (day) => (e) => {
    setNewClass({
      ...newClass,
      timings: { ...newClass.timings, [day]: e.target.value }
    });
  };

  const handleClassSetupOpen = () => setOpenClassSetup(true);
  const handleClassSetupClose = () => setOpenClassSetup(false);

  const handleCreateClass = async () => {
    try {
      await createClass(newClass);
      setOpenClassSetup(false);
      setNewClass({ name: '', description: '', timings: { Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '', Saturday: '' } });
      // Refetch classes to update the list
      const response = await getClasses();
      setClasses(response.data);
      if (response.data.length > 0) {
        setSelectedClassId(response.data[0].id);
        setClassId(response.data[0].id);
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Failed to create class');
    }
  };

  return (
    <Box sx={{ py: 4, minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff, #ffffff)' }}>
      <Container>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {currentDate}
          </Typography>
        </Box>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <MotionBox variants={containerVariants} initial="hidden" animate="visible">
          <Grid container spacing={3}>
            {loading ? (
              Array(3).fill().map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                </Grid>
              ))
            ) : (
              classes.map((cls) => (
                <Grid item xs={12} sm={6} md={4} key={cls.id}>
                  <MotionCard
                    variants={cardVariants}
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)' }}
                    sx={{ borderRadius: 2, cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setClassId(cls.id);
                      setView('classDetails');
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ClassIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {cls.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {cls.description}
                      </Typography>
                      <Chip
                        label={cls.timings.Monday || 'No Schedule'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    </CardContent>
                  </MotionCard>
                </Grid>
              ))
            )}
          </Grid>
        </MotionBox>

        <MotionFab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          variants={statsVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClassSetupOpen}
        >
          <AddIcon />
        </MotionFab>

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
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Card,
  CardContent,
  Grid,
  Container,
  Chip,
  IconButton,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { getStudents, addStudent, saveAttendance, deleteClass, deleteStudent } from '../services/api'; // Adjust path

const MotionCard = motion(Card);
const MotionListItem = motion(ListItem);
const MotionBox = motion(Box);
const MotionFab = motion(Fab);

const ClassDetails = ({ classId, setView }) => {
  const [students, setStudents] = useState([]);
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
  };
  
  const listItemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getStudents(classId);
        // Sort students by rollNo ascending (numeric or string)
        const sorted = [...response.data].sort((a, b) => {
          const aNum = Number(a.rollNo), bNum = Number(b.rollNo);
          if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
          return String(a.rollNo).localeCompare(String(b.rollNo));
        });
        setStudents(sorted);
        // Set all students to present by default
        setAttendance(
          sorted.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
        );
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId]);

  const handleAddStudent = async () => {
    if (!rollNo || !name) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const added = await addStudent(classId, { rollNo, name });
      const newStudent = added.data || { id: Date.now(), rollNo, name }; // fallback if API doesn't return student
      setStudents(prev => [...prev, newStudent]);
      setAttendance(prev => ({ ...prev, [newStudent.id]: true }));
      setRollNo(''); setName(''); setOpenAdd(false);
      setSuccess('Student added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add student');
    }
  };

  const handleAttendanceChange = (id) => (e) =>
    setAttendance({ ...attendance, [id]: e.target.checked });

  const handleSaveAttendance = async () => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const list = Object.entries(attendance)
        .filter(([_, present]) => present)
        .map(([id]) => id);

      await saveAttendance(classId, { date, attendance: list });
      setSuccess('Attendance saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save attendance');
    }
  };

  const handleDeleteClass = async () => {
    try {
      await deleteClass(classId);
      setSuccess('Class deleted successfully');
      setTimeout(() => {
        setSuccess(null);
        setView('dashboard');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete class');
    } finally {
      setOpenDelete(false);
    }
  };

  const handleDownloadPDF = () => {
    setSuccess('Generating PDF...');
    const element = document.createElement('div');
    const today = new Date();
    const dateStr = today.toLocaleDateString();
    const dayStr = today.toLocaleDateString('en-US', { weekday: 'long' });
    const present = Object.values(attendance).filter(Boolean).length;
    const absent = students.length - present;
    const rate = students.length ? ((present / students.length) * 100).toFixed(1) : 0;

    element.innerHTML = `
      <h1 style="font-size: 20px; color: #667eea; text-align: center; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Attendance Report</h1>
      <p><strong>Date:</strong> ${dateStr}</p>
      <p><strong>Day:</strong> ${dayStr}</p>
      <p><strong>Total Students:</strong> ${students.length}</p>
      <p><strong>Present:</strong> ${present}</p>
      <p><strong>Absent:</strong> ${absent}</p>
      <p><strong>Attendance Rate:</strong> ${rate}%</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #667eea; color: white;">
            <th style="padding: 8px; text-align: left;">Roll No</th>
            <th style="padding: 8px; text-align: left;">Name</th>
            <th style="padding: 8px; text-align: left;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${students.map((student) => `
            <tr style="background: #ffffff;">
              <td style="padding: 8px; border: 1px solid #ddd;">${student.rollNo}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${student.name}</td>
              <td style="padding: 8px; border: 1px solid #ddd; ${attendance[student.id] ? 'background: #e8f5e8; color: #2e7d32;' : 'background: #ffebee; color: #d32f2f;'}">
                ${attendance[student.id] ? 'Present' : 'Absent'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
        Generated on ${today.toLocaleString()}
      </div>
    `;

    const options = {
      margin: 10,
      filename: `attendance-report-${today.toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).toPdf().get('pdf').then((pdf) => {
      const blob = pdf.output('blob');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = options.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      setSuccess('PDF downloaded successfully');
      setTimeout(() => setSuccess(null), 3000);
    }).catch((error) => {
      setError('Failed to generate PDF: ' + error.message);
      setTimeout(() => setError(null), 3000);
    });
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;
  const attendanceRate = students.length ? ((presentCount / students.length) * 100).toFixed(1) : 0;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pb: { xs: 2, sm: 4 }
    }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 1, sm: 2, md: 4 } }}>
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          sx={{ mb: { xs: 2, sm: 4 } }}
        >
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: { xs: 2, sm: 4 },
              overflow: 'hidden',
              position: 'relative',
              boxShadow: { xs: 'none', sm: '0 4px 12px rgba(0,0,0,0.1)' }
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, opacity: 0.1 }}>
              <SchoolIcon sx={{ fontSize: { xs: 80, sm: 120 } }} />
            </Box>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 3 } }}>
                <IconButton 
                  onClick={() => setView('dashboard')}
                  sx={{ 
                    mr: { xs: 1, sm: 2 }, 
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    '&:hover': { background: 'rgba(255,255,255,0.2)' },
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Box>
                  <Typography 
                    variant="h3" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.5rem' },
                      lineHeight: 1.2
                    }}
                  >
                    Class Details
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: { xs: 0.5, sm: 1 } }}>
                    <TodayIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 20 } }} />
                    <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </MotionBox>

        {/* Stats Cards */}
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
          {[
            { 
              label: 'Total Students', 
              value: students.length, 
              color: '#0277bd', 
              bg: 'linear-gradient(135deg, #03a9f4 0%, #0277bd 100%)',
              icon: <PersonIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
            },
            { 
              label: 'Present Today', 
              value: presentCount, 
              color: '#2e7d32', 
              bg: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              icon: <CheckCircleIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
            },
            { 
              label: 'Attendance Rate', 
              value: `${attendanceRate}%`, 
              color: '#f57c00', 
              bg: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              icon: <TodayIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
            }
          ].map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={card.label}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    borderRadius: { xs: 2, sm: 3 },
                    background: card.bg,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%'
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ mb: { xs: 1, sm: 2 } }}>{card.icon}</Box>
                    <Typography
                      variant="h3"
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                      }}
                    >
                      {loading ? <LinearProgress sx={{ width: 50, mx: 'auto' }} /> : card.value}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500, fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                      ${card.label}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Alert 
                severity="error" 
                sx={{ 
                  mb: { xs: 1, sm: 3 }, 
                  borderRadius: { xs: 2, sm: 3 },
                  '& .MuiAlert-icon': { fontSize: { xs: '1rem', sm: '1.5rem' } }
                }}
              >
                {error}
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Alert 
                severity="success" 
                sx={{ 
                  mb: { xs: 1, sm: 3 }, 
                  borderRadius: { xs: 2, sm: 3 },
                  '& .MuiAlert-icon': { fontSize: { xs: '1rem', sm: '1.5rem' } }
                }}
              >
                {success}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Students List */}
        <MotionCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          sx={{ 
            borderRadius: { xs: 2, sm: 4 }, 
            overflow: 'hidden', 
            boxShadow: { xs: '0 2px 6px rgba(0,0,0,0.1)', sm: '0 8px 32px rgba(0,0,0,0.1)' }
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
                }}
              >
                <PersonIcon sx={{ mr: { xs: 1, sm: 2 } }} />
                Student Attendance (${students.length} students)
              </Typography>
            </Box>

            {students.length === 0 ? (
              <Box sx={{ p: { xs: 2, sm: 4, md: 6 }, textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: { xs: 40, sm: 80 }, color: '#e0e7ff', mb: { xs: 1, sm: 2 } }} />
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }, mb: { xs: 0.5, sm: 1 } }}>
                  No students found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                  Add students to start taking attendance
                </Typography>
              </Box>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <List sx={{ p: 0 }}>
                  {students.map((student, index) => (
                    <MotionListItem
                      key={student.id}
                      variants={listItemVariants}
                      sx={{
                        borderBottom: index < students.length - 1 ? '1px solid #f1f5f9' : 'none',
                        '&:hover': { bgcolor: '#f8fafc' },
                        py: { xs: 1, sm: 2 },
                        px: { xs: 2, sm: 3, md: 4 }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Checkbox
                            checked={attendance[student.id] || false}
                            onChange={handleAttendanceChange(student.id)}
                            size="small"
                            sx={{
                              mr: { xs: 1, sm: 2 },
                              '&.Mui-checked': { color: '#22c55e' },
                              padding: { xs: 0, sm: '8px' }
                            }}
                          />
                        </motion.div>
                        
                        <Avatar 
                          sx={{ 
                            mr: { xs: 1, sm: 3 }, 
                            width: { xs: 30, sm: 40, md: 48 }, 
                            height: { xs: 30, sm: 40, md: 48 },
                            bgcolor: attendance[student.id] ? '#22c55e' : '#64748b',
                            fontSize: { xs: '0.75rem', sm: '1rem', md: '1.25rem' },
                            fontWeight: 600
                          }}
                        >
                          ${student.name.charAt(0).toUpperCase()}
                        </Avatar>
                        
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: { xs: 0.5, sm: 1 } }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 600,
                                fontSize: { xs: '0.875rem', sm: '1.1rem', md: '1.25rem' }
                              }}
                            >
                              {student.name}
                            </Typography>
                            <Chip 
                              label={`Roll: ${student.rollNo}`} 
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderColor: '#e2e8f0',
                                fontSize: { xs: '0.625rem', sm: '0.75rem' }
                              }}
                            />
                            {attendance[student.id] && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                              >
                                <CheckCircleIcon sx={{ color: '#22c55e', fontSize: { xs: 16, sm: 24 } }} />
                              </motion.div>
                            )}
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: attendance[student.id] ? '#22c55e' : '#64748b',
                              fontWeight: 500,
                              fontSize: { xs: '0.625rem', sm: '0.9rem' }
                            }}
                          >
                            ${attendance[student.id] ? '✓ Present' : '○ Absent'}
                          </Typography>
                        </Box>
                        {/* Delete Student Button removed */}
                      </Box>
                    </MotionListItem>
                  ))}
                </List>
              </motion.div>
            )}
          </CardContent>
        </MotionCard>

        {/* Floating Action Buttons */}
        <Box sx={{ 
          position: 'fixed', 
          bottom: { xs: 8, sm: 16, md: 24 }, 
          right: { xs: 8, sm: 16, md: 24 }, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 1, sm: 2 }
        }}>
          {/* Download PDF */}
          <MotionFab
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={handleDownloadPDF}
            sx={{
              background: 'linear-gradient(45deg,#ff6b6b,#ee5a24)', 
              color: 'white',
              width: { xs: 40, sm: 56, md: 64 }, height: { xs: 40, sm: 56, md: 64 },
              '&:hover': { 
                background: 'linear-gradient(45deg,#ff5252,#e53e3e)',
                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)'
              }
            }}
          >
            <DownloadIcon sx={{ fontSize: { xs: 16, sm: 24, md: 28 } }} />
          </MotionFab>

          {/* Save Attendance */}
          <MotionFab
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={handleSaveAttendance}
            sx={{
              background: 'linear-gradient(45deg,#22c55e,#16a34a)', 
              color: 'white',
              width: { xs: 40, sm: 56, md: 64 }, height: { xs: 40, sm: 56, md: 64 },
              '&:hover': { 
                background: 'linear-gradient(45deg,#16a34a,#15803d)',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
              }
            }}
          >
            <SaveIcon sx={{ fontSize: { xs: 16, sm: 24, md: 28 } }} />
          </MotionFab>

          {/* Add Student */}
          <MotionFab
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9}}
            onClick={() => setOpenAdd(true)}
            sx={{
              background: 'linear-gradient(45deg,#667eea,#764ba2)', 
              color: 'white',
              width: { xs: 40, sm: 56, md: 64 }, height: { xs: 40, sm: 56, md: 64 },
              '&:hover': { 
                background: 'linear-gradient(45deg,#5a6fd8,#6a42a0)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            <AddIcon sx={{ fontSize: { xs: 16, sm: 24, md: 28 } }} />
          </MotionFab>

          {/* Delete Class FAB */}
          <MotionFab
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setOpenDelete(true)}
            sx={{
              background: 'linear-gradient(45deg,#ef4444,#dc2626)', 
              color: 'white',
              width: { xs: 40, sm: 56, md: 64 }, height: { xs: 40, sm: 56, md: 64 },
              '&:hover': { 
                background: 'linear-gradient(45deg,#dc2626,#b91c1c)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
              }
            }}
          >
            <DeleteIcon sx={{ fontSize: { xs: 16, sm: 24, md: 28 } }} />
          </MotionFab>
        </Box>

        {/* Add Student Dialog */}
        <Dialog 
          open={openAdd} 
          onClose={() => setOpenAdd(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: { xs: 2, sm: 4 } } }}
        >
          <DialogTitle sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem' }, 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Add New Student
          </DialogTitle>
          
          <DialogContent sx={{ pt: { xs: 2, sm: 3 } }}>
            <TextField
              label="Roll Number"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{ mb: { xs: 1, sm: 2 }, '& .MuiInputBase-input': { fontSize: { xs: '0.75rem', sm: '1rem' } } }}
            />
            
            <TextField
              label="Student Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{ '& .MuiInputBase-input': { fontSize: { xs: '0.75rem', sm: '1rem' } } }}
            />
          </DialogContent>
          
          <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
            <Button 
              onClick={() => setOpenAdd(false)}
              sx={{ textTransform: 'none', fontSize: { xs: '0.75rem', sm: '1rem' } }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddStudent} 
              variant="contained"
              sx={{
                textTransform: 'none',
                borderRadius: { xs: 1, sm: 2 },
                px: { xs: 2, sm: 3 },
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': { background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)' },
                fontSize: { xs: '0.75rem', sm: '1rem' }
              }}
            >
              Add Student
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Class Dialog */}
        <Dialog open={openDelete} onClose={() => setOpenDelete(false)} PaperProps={{ sx: { borderRadius: { xs: 2, sm: 4 } } }}>
          <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Delete Class</DialogTitle>
          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Are you sure you want to delete this class? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
            <Button onClick={() => setOpenDelete(false)} sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>Cancel</Button>
            <Button onClick={handleDeleteClass} color="error" variant="contained" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ClassDetails;
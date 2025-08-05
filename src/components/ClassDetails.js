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
  LinearProgress,
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
  Today as TodayIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import axios from 'axios';

const MotionCard = motion(Card);
const MotionListItem = motion(ListItem);
const MotionBox = motion(Box);
const MotionFab = motion(Fab);

const ClassDetails = ({ classId, setView }) => {
  /* ------------------------------ state ------------------------------ */
  const [students, setStudents] = useState([]);
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(true);

  /* --------------------------- animations ---------------------------- */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  /* --------------------------- data fetch ---------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const stuRes = await axios.get(`/api/students/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(stuRes.data);
        setAttendance(
          stuRes.data.reduce((acc, s) => ({ ...acc, [s.id]: false }), {})
        );
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId]);

  /* ------------------------ handlers / helpers ----------------------- */
  const handleAddStudent = async () => {
    if (!rollNo || !name) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/students/${classId}`,
        { rollNo, name },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      const refetch = await axios.get(`/api/students/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(refetch.data);
      setRollNo('');
      setName('');
      setOpenAdd(false);
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
      const token = localStorage.getItem('token');
      const date = new Date().toISOString().split('T')[0];
      const list = Object.entries(attendance)
        .filter(([_, present]) => present)
        .map(([id]) => id);

      await axios.post(
        `/api/attendance/${classId}`,
        { date, attendance: list },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      setSuccess('Attendance saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save attendance');
    }
  };

  const handleDeleteClass = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  /* ----------------------- PDF generation --------------------------- */
  const handleDownloadPDF = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString();
    const dayStr = today.toLocaleDateString('en-US', { weekday: 'long' });
    const present = Object.values(attendance).filter(Boolean).length;
    const rate = students.length ? ((present / students.length) * 100).toFixed(1) : 0;

    const printWindow = window.open('', '_blank');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Attendance Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
          h1 { color: #667eea; text-align: center; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #667eea; color: white; }
          .present { background: #e8f5e8; color: #2e7d32; font-weight: bold; }
          .absent { background: #ffebee; color: #d32f2f; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Attendance Report</h1>
        <p><strong>Date:</strong> ${dateStr}</p>
        <p><strong>Day:</strong> ${dayStr}</p>
        <p><strong>Total Students:</strong> ${students.length}</p>
        <p><strong>Present:</strong> ${present}</p>
        <p><strong>Attendance Rate:</strong> ${rate}%</p>

        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student) => `
              <tr>
                <td>${student.rollNo}</td>
                <td>${student.name}</td>
                <td class="${attendance[student.id] ? 'present' : 'absent'}">
                  ${attendance[student.id] ? 'Present' : 'Absent'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">Generated on ${today.toLocaleString()}</div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <script>
          window.onload = function() {
            const options = {
              margin: 10,
              filename: 'attendance-report-${today.toISOString().slice(0, 10)}.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            };

            html2pdf().set(options).from(document.body).save().then(() => {
              window.close();
            });
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setSuccess('Generating PDF...');
    setTimeout(() => setSuccess(null), 3000);
  };

  /* ----------------------- derived values --------------------------- */
  const presentCount = Object.values(attendance).filter(Boolean).length;
  const attendanceRate = students.length ? ((presentCount / students.length) * 100).toFixed(1) : 0;

  /* ------------------------------ UI -------------------------------- */
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pb: 4,
    }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          sx={{ mb: { xs: 3, sm: 4 } }}
        >
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, opacity: 0.1 }}>
              <SchoolIcon sx={{ fontSize: { xs: 80, sm: 120 } }} />
            </Box>
            <CardContent sx={{ p: { xs: 2, sm: 4 }, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <IconButton 
                  onClick={() => setView('dashboard')}
                  sx={{ 
                    mr: { xs: 1, sm: 2 }, 
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    '&:hover': { background: 'rgba(255,255,255,0.2)' },
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
                      fontSize: { xs: '1.5rem', sm: '2.5rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    Class Details
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TodayIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
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
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          {[
            { 
              label: 'Total Students', 
              value: students.length, 
              color: '#0277bd', 
              bg: 'linear-gradient(135deg, #03a9f4 0%, #0277bd 100%)',
              icon: <PersonIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />,
            },
            { 
              label: 'Present Today', 
              value: presentCount, 
              color: '#2e7d32', 
              bg: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              icon: <CheckCircleIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />,
            },
            { 
              label: 'Attendance Rate', 
              value: `${attendanceRate}%`, 
              color: '#f57c00', 
              bg: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              icon: <TodayIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />,
            },
          ].map((card, index) => (
            <Grid item xs={12} sm={4} key={card.label}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    borderRadius: 3,
                    background: card.bg,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ mb: { xs: 1, sm: 2 } }}>{card.icon}</Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.5rem' } }}>
                      {loading ? <LinearProgress sx={{ width: 60, mx: 'auto' }} /> : card.value}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500, fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                      {card.label}
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
                  mb: 3, 
                  borderRadius: 3,
                  '& .MuiAlert-icon': { fontSize: '1.5rem' },
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
                  mb: 3, 
                  borderRadius: 3,
                  '& .MuiAlert-icon': { fontSize: '1.5rem' },
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
          sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              p: { xs: 2, sm: 4 }, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: { xs: '1.1rem', sm: '1.5rem' },
                }}
              >
                <PersonIcon sx={{ mr: 2 }} />
                Student Attendance ({students.length} students)
              </Typography>
            </Box>

            {students.length === 0 ? (
              <Box sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: { xs: 60, sm: 80 }, color: '#e0e7ff', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  No students found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
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
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 2, sm: 4 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Checkbox
                            checked={attendance[student.id] || false}
                            onChange={handleAttendanceChange(student.id)}
                            size="large"
                            sx={{
                              mr: { xs: 1, sm: 2 },
                              '&.Mui-checked': { color: '#22c55e' },
                            }}
                          />
                        </motion.div>

                        <Avatar 
                          sx={{ 
                            mr: { xs: 2, sm: 3 }, 
                            width: { xs: 36, sm: 48 }, 
                            height: { xs: 36, sm: 48 },
                            bgcolor: attendance[student.id] ? '#22c55e' : '#64748b',
                            fontSize: { xs: '0.9rem', sm: '1.25rem' },
                            fontWeight: 600,
                          }}
                        >
                          {student.name.charAt(0).toUpperCase()}
                        </Avatar>

                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: 1, flexWrap: 'wrap' }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 600,
                                fontSize: { xs: '1rem', sm: '1.25rem' },
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
                                fontSize: '0.75rem',
                              }}
                            />
                            {attendance[student.id] && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                              >
                                <CheckCircleIcon sx={{ color: '#22c55e', fontSize: { xs: 20, sm: 24 } }} />
                              </motion.div>
                            )}
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: attendance[student.id] ? '#22c55e' : '#64748b',
                              fontWeight: 500,
                              fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            }}
                          >
                            {attendance[student.id] ? '✓ Present' : '○ Absent'}
                          </Typography>
                        </Box>
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
          bottom: { xs: 16, sm: 24 }, 
          right: { xs: 16, sm: 24 }, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 1.5, sm: 2 },
        }}>
          {/* Delete Class */}
          <MotionFab
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpenDelete(true)}
            size={window.innerWidth < 600 ? 'medium' : 'large'}
            sx={{
              background: 'linear-gradient(45deg, #d32f2f, #b71c1c)',
              color: 'white',
              '&:hover': { 
                background: 'linear-gradient(45deg, #c62828, #a52714)',
                boxShadow: '0 8px 25px rgba(211, 47, 47, 0.4)',
              },
            }}
          >
            <DeleteIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />
          </MotionFab>

          {/* Download PDF */}
          <MotionFab
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDownloadPDF}
            size={window.innerWidth < 600 ? 'medium' : 'large'}
            sx={{
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)', 
              color: 'white',
              '&:hover': { 
                background: 'linear-gradient(45deg, #ff5252, #e53e3e)',
                boxShadow: '0 8px 25px rgba(255, 107, 107, 0.4)',
              },
            }}
          >
            <DownloadIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />
          </MotionFab>

          {/* Save Attendance */}
          <MotionFab
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSaveAttendance}
            size={window.innerWidth < 600 ? 'medium' : 'large'}
            sx={{
              background: 'linear-gradient(45deg, #22c55e, #16a34a)', 
              color: 'white',
              '&:hover': { 
                background: 'linear-gradient(45deg, #16a34a, #15803d)',
                boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
              },
            }}
          >
            <SaveIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />
          </MotionFab>

          {/* Add Student */}
          <MotionFab
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpenAdd(true)}
            size={window.innerWidth < 600 ? 'medium' : 'large'}
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)', 
              color: 'white',
              '&:hover': { 
                background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
              },
            }}
          >
            <AddIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />
          </MotionFab>
        </Box>

        {/* Add Student Dialog */}
        <Dialog 
          open={openAdd} 
          onClose={() => setOpenAdd(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4, mx: { xs: 2, sm: 4 } } }}
        >
          <DialogTitle sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem' }, 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Add New Student
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              label="Roll Number"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Student Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
            />
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setOpenAdd(false)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddStudent} 
              variant="contained"
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                },
              }}
            >
              Add Student
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Class Dialog */}
        <Dialog
          open={openDelete}
          onClose={() => setOpenDelete(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4, mx: { xs: 2, sm: 4 } } }}
        >
          <DialogTitle sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 600,
            color: '#d32f2f',
          }}>
            Confirm Delete Class
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this class? This action cannot be undone and will remove all associated student data and attendance records.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setOpenDelete(false)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteClass}
              variant="contained"
              color="error"
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ClassDetails;
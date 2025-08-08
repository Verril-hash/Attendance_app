// ClassDetails.js
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, List, ListItem, ListItemText, Checkbox, Card, CardContent,
  Grid, Container, Chip, IconButton, Alert, Fab, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Divider, LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon, Download as DownloadIcon, Save as SaveIcon, Person as PersonIcon,
  CheckCircle as CheckCircleIcon, ArrowBack as ArrowBackIcon, Delete as DeleteIcon,
  School as SchoolIcon, Today as TodayIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { getStudents, addStudent, saveAttendance, deleteClass } from '../services/api';

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
        const response = await getStudents(classId);
        const sortedStudents = [...response.data].sort((a, b) => a.rollNo - b.rollNo);
        setStudents(sortedStudents);
        setAttendance(
          sortedStudents.reduce((acc, s) => ({ ...acc, [s.id]: false }), {})
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
    const existingRollNos = students.map(s => s.rollNo);
    if (existingRollNos.includes(parseInt(rollNo))) {
      setError('Roll number already exists');
      return;
    }
    if (existingRollNos.length > 0 && parseInt(rollNo) !== Math.max(...existingRollNos) + 1) {
      setError('Roll number must be the next sequential number');
      return;
    }
    try {
      await addStudent(classId, { rollNo: parseInt(rollNo), name });
      const refetch = await getStudents(classId);
      const sortedStudents = [...refetch.data].sort((a, b) => a.rollNo - b.rollNo);
      setStudents(sortedStudents);
      setRollNo('');
      setName('');
      setOpenAdd(false);
      setSuccess('Student added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add student');
    }
  };

  const handleAttendanceChange = (studentId) => (event) => {
    setAttendance({ ...attendance, [studentId]: event.target.checked });
  };

  const handleSaveAttendance = async () => {
    try {
      const attendanceData = Object.entries(attendance)
        .filter(([, value]) => value)
        .map(([studentId]) => studentId);
      await saveAttendance(classId, { studentIds: attendanceData });
      setSuccess('Attendance saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save attendance');
    }
  };

  const handleDeleteClass = async () => {
    try {
      await deleteClass(classId);
      setOpenDelete(false);
      setView('dashboard');
      setSuccess('Class deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete class');
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('class-details-card');
    html2pdf().from(element).save(`class_${classId}_details.pdf`);
  };

  /* ----------------------------- UI --------------------------------- */
  return (
    <Box sx={{ py: 4, minHeight: '100vh' }}>
      <Container>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => setView('dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Class Details
          </Typography>
        </Box>

        {loading && <LinearProgress />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <MotionCard
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          id="class-details-card"
        >
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Class ID: {classId}</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Manage student details, record attendance, and generate reports for this class.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Chip
                  icon={<TodayIcon />}
                  label={`Last Updated: ${new Date().toLocaleDateString()}`}
                  color="primary"
                  variant="outlined"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Students
            </Typography>
            <List>
              <AnimatePresence>
                {students.map((student) => (
                  <MotionListItem
                    key={student.id}
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <ListItemText
                      primary={`${student.rollNo}. ${student.name}`}
                      secondary={
                        <Checkbox
                          checked={attendance[student.id] || false}
                          onChange={handleAttendanceChange(student.id)}
                        />
                      }
                    />
                  </MotionListItem>
                ))}
              </AnimatePresence>
            </List>

            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveAttendance}
                startIcon={<SaveIcon />}
              >
                Save Attendance
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleDownloadPDF}
                startIcon={<DownloadIcon />}
                sx={{ ml: 2 }}
              >
                Download PDF
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setOpenDelete(true)}
                startIcon={<DeleteIcon />}
                sx={{ ml: 2 }}
              >
                Delete Class
              </Button>
            </Box>
          </CardContent>
        </MotionCard>

        {/* Add Student Dialog */}
        <Dialog
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          maxWidth="xs"
          fullWidth
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
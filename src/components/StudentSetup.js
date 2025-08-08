// StudentSetup.js
import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { addStudent } from '../services/api';

const StudentSetup = ({ classId, setView }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    if (!name || !email) {
      setError('Please fill in all fields');
      return;
    }
    try {
      await addStudent(classId, { name, email, class_id: classId });
      setSuccess('Student added successfully');
      setName('');
      setEmail('');
      setTimeout(() => setView('classDetails'), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to add student';
      setError(errorMsg);
      console.error('Error adding student:', errorMsg, error);
    }
  };

  return (
    <Box mt={5}>
      <Typography variant="h4">Add Student</Typography>
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="primary">{success}</Typography>}
      <TextField
        label="Student Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Student Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" onClick={handleSubmit}>
        Add Student
      </Button>
      <Button onClick={() => setView('classDetails')} sx={{ ml: 2 }}>
        Back to Class
      </Button>
    </Box>
  );
};

export default StudentSetup;
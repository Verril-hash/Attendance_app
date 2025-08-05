import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

const ClassSetup = ({ setView, teacherId }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    if (!name || !description) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      await axios.post(
        '/api/classes',
        { name, description, teacher_id: teacherId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Class created successfully');
      setName('');
      setDescription('');
      setTimeout(() => setView('dashboard'), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create class';
      setError(errorMsg);
      console.error('Error creating class:', errorMsg, error);
    }
  };

  return (
    <Box mt={5}>
      <Typography variant="h4">Create Class</Typography>
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="primary">{success}</Typography>}
      <TextField
        label="Class Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" onClick={handleSubmit}>
        Create Class
      </Button>
      <Button onClick={() => setView('dashboard')} sx={{ ml: 2 }}>
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default ClassSetup;
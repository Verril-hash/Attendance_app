import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import axios from 'axios';
import { auth } from './firebase';
import { getIdToken } from 'firebase/auth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ClassDetails from './components/ClassDetails';
import StudentSetup from './components/StudentSetup';
import Analytics from './components/Analytics';
import ClassSetup from './components/ClassSetup';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('login');
  const [teacherId, setTeacherId] = useState(null);
  const [classId, setClassId] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token || !auth.currentUser) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setView('login');
        return;
      }
      try {
        const freshToken = await getIdToken(auth.currentUser, true); // Force refresh
        localStorage.setItem('token', freshToken);
        const response = await axios.post('/api/auth/login', { email: auth.currentUser.email }, {
          headers: { Authorization: `Bearer ${freshToken}`, 'Content-Type': 'application/json' },
        });
        console.log('Token validation response:', response.data);
        setTeacherId(response.data.teacher.id);
        setIsLoggedIn(true);
        setView('dashboard');
      } catch (error) {
        console.error('Token validation failed:', error.response?.data || error.message);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setView('login');
      }
    };
    validateToken();
  }, []);

  return (
    <Container>
      {view === 'login' && <Login setIsLoggedIn={setIsLoggedIn} setView={setView} setTeacherId={setTeacherId} />}
      {view === 'dashboard' && isLoggedIn && <Dashboard setView={setView} setClassId={setClassId} />}
      {view === 'classDetails' && isLoggedIn && <ClassDetails classId={classId} setView={setView} />}
      {view === 'studentSetup' && isLoggedIn && <StudentSetup classId={classId} setView={setView} />}
      {view === 'analytics' && isLoggedIn && classId && <Analytics classId={classId} setView={setView} />} {/* Added setView */}
      {view === 'classSetup' && isLoggedIn && <ClassSetup setView={setView} teacherId={teacherId} />}
    </Container>
  );
};

export default App;
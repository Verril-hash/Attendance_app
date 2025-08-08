// Analytics.js
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Container, Card, CardContent, Grid, IconButton, CircularProgress, Chip, Button,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, TrendingUp as TrendingUpIcon, Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon, ShowChart as ShowChartIcon, Download as DownloadIcon,
} from '@mui/icons-material';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { getAnalytics, getStudents } from '../services/api';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const Analytics = ({ classId, setView }) => {
  const [analytics, setAnalytics] = useState({ dates: [], rates: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!classId) {
        setError('No class selected');
        setLoading(false);
        return;
      }

      try {
        const analyticsResponse = await getAnalytics(classId);
        setAnalytics(analyticsResponse.data);
        const stuRes = await getStudents(classId);
        setTotalStudents(stuRes.data.length);
      } catch (error) {
        const errorMsg = error.response?.data?.error || error.message || 'Failed to fetch analytics';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [classId]);

  const data = {
    labels: analytics.dates,
    datasets: [
      {
        label: 'Attendance Rate',
        data: analytics.rates,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 12,
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#667eea',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: false,
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: 'Attendance Rate (%)', color: '#1e293b' },
        ticks: { color: '#475569' },
      },
      x: {
        title: { display: true, text: 'Date', color: '#1e293b' },
        ticks: { color: '#475569' },
      },
    },
  };

  const averageRate = analytics.rates.length > 0 ? Math.round(analytics.rates.reduce((a, b) => a + b, 0) / analytics.rates.length) : 0;

  const handleDownloadMonthlyPDF = () => {
    const element = document.getElementById('analytics-card');
    html2pdf().set({ html2canvas: { scale: 2 } }).from(element).save(`class_${classId}_analytics.pdf`);
    setSuccess('PDF downloaded successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <Box sx={{ py: 4, minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff, #ffffff)' }}>
      <Container>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => setView('dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Analytics
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress color="primary" size={60} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <>
            <MotionCard
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              id="analytics-card"
              sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}
            >
              <CardContent>
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h5"
                    sx={{ 
                      fontWeight: 700, 
                      color: '#1e293b',
                      fontSize: { xs: '1.25rem', sm: '2rem' },
                    }}
                  >
                    Attendance Trend Analysis
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                    <Chip 
                      label={`${analytics.dates.length} days tracked`}
                      color="primary"
                      variant="outlined"
                      size={window.innerWidth < 600 ? "small" : "medium"}
                    />
                    <Chip 
                      label={`Avg: ${averageRate}%`}
                      color="success"
                      variant="outlined"
                      size={window.innerWidth < 600 ? "small" : "medium"}
                    />
                  </Box>
                </Box>
                <Box sx={{ height: { xs: 250, sm: 450 } }}>
                  <Line data={data} options={options} />
                </Box>
              </CardContent>
            </MotionCard>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              {success && (
                <Typography variant="body1" color="success.main" sx={{ mb: 2 }}>
                  {success}
                </Typography>
              )}
              <Button
                variant="contained"
                onClick={handleDownloadMonthlyPDF}
                startIcon={<DownloadIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                  },
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                }}
              >
                Download Monthly Report
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Analytics;
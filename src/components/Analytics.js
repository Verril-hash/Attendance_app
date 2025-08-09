import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  IconButton,
  LinearProgress,
  Chip,
  Button
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarTodayIcon,
  ShowChart as ShowChartIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { getAnalytics } from '../services/api'; // Adjust path
import html2pdf from 'html2pdf.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const Analytics = ({ classId, setView }) => {
  const [analytics, setAnalytics] = useState({ dates: [], rates: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!classId) {
        setError('No class selected');
        setLoading(false);
        return;
      }

      try {
        const response = await getAnalytics(classId);
        setAnalytics(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch analytics');
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
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#22c55e',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        padding: 8,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
      },
    },
    scales: {
      x: {
        type: 'category',
        title: { display: true, text: 'Date', font: { size: 14, weight: 'bold' }, color: '#64748b' },
        grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
        ticks: { color: '#64748b', font: { size: 10 }, padding: 8 },
      },
      y: {
        type: 'linear',
        title: { display: true, text: 'Attendance Rate (%)', font: { size: 14, weight: 'bold' }, color: '#64748b' },
        grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
        ticks: { color: '#64748b', font: { size: 10 }, padding: 8, min: 0, max: 100 },
      },
    },
  };

  const averageRate = analytics.rates.length > 0
    ? (analytics.rates.reduce((a, b) => a + b, 0) / analytics.rates.length).toFixed(1)
    : 0;
  const maxRate = analytics.rates.length > 0 ? Math.max(...analytics.rates).toFixed(1) : 0;
  const minRate = analytics.rates.length > 0 ? Math.min(...analytics.rates).toFixed(1) : 0;

  const generateMonthlyReport = () => {
    const element = document.createElement('div');
    const currentDate = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    // Assuming total students is a fixed value or derived from an API; here we'll use a placeholder
    const totalStudents = 30; // Replace with actual total students if available from API
    element.innerHTML = `
      <h1 style="font-size: 20px; color: #667eea; text-align: center; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Monthly Attendance Report - ${currentDate}</h1>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #667eea; color: white;">
            <th style="padding: 8px; text-align: left;">Date</th>
            <th style="padding: 8px; text-align: left;">Total Students</th>
            <th style="padding: 8px; text-align: left;">Present</th>
            <th style="padding: 8px; text-align: left;">Absent</th>
            <th style="padding: 8px; text-align: left;">Attendance Rate</th>
          </tr>
        </thead>
        <tbody>
          ${analytics.dates.map((date, index) => {
            const rate = analytics.rates[index] || 0;
            const present = totalStudents * (rate / 100);
            const absent = totalStudents - present;
            return `
              <tr style="background: ${index % 2 === 0 ? '#f8fafc' : 'white'};">
                <td style="padding: 8px; border: 1px solid #ddd;">${date}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${totalStudents}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${present.toFixed(0)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${absent.toFixed(0)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${rate}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p><strong>Summary:</strong></p>
        <p>Average Attendance Rate: ${averageRate}%</p>
        <p>Highest Attendance Rate: ${maxRate}%</p>
        <p>Lowest Attendance Rate: ${minRate}%</p>
      </div>
    `;

    html2pdf().from(element).save(`Monthly_Attendance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', pb: 4 }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 2, sm: 4 } }}>
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          sx={{ mb: 4 }}
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
              <AssessmentIcon sx={{ fontSize: 120 }} />
            </Box>
            <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton
                  onClick={() => setView('dashboard')}
                  sx={{
                    mr: 2,
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
                      fontSize: { xs: '1.8rem', sm: '2.5rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    Analytics Dashboard
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CalendarTodayIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </MotionBox>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              label: 'Total Records',
              value: analytics.dates.length,
              color: '#0277bd',
              bg: 'linear-gradient(135deg, #03a9f4 0%, #0277bd 100%)',
              icon: <CalendarTodayIcon sx={{ fontSize: 32 }} />,
            },
            {
              label: 'Average Rate',
              value: `${averageRate}%`,
              color: '#2e7d32',
              bg: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
            },
            {
              label: 'Highest Rate',
              value: `${maxRate}%`,
              color: '#f57c00',
              bg: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              icon: <ShowChartIcon sx={{ fontSize: 32 }} />,
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
                  <CardContent sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ mb: 2 }}>{card.icon}</Box>
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 700, fontSize: { xs: '2rem', sm: '2.5rem' } }}
                    >
                      {loading ? <LinearProgress sx={{ width: 60, mx: 'auto' }} /> : card.value}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                      {card.label}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Chart */}
        <MotionCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: { xs: 300, sm: 400 }, gap: 3 }}>
                <LinearProgress sx={{ width: '100%', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Loading analytics data...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <AssessmentIcon sx={{ fontSize: 80, color: '#e0e7ff', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  {error}
                </Typography>
                <Chip label="Unable to load data" color="error" variant="outlined" />
              </Box>
            ) : analytics.dates.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, color: '#1e293b', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                  >
                    Attendance Trend Analysis
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={`${analytics.dates.length} days tracked`} color="primary" variant="outlined" />
                    <Chip label={`Avg: ${averageRate}%`} color="success" variant="outlined" />
                  </Box>
                </Box>
                <Box sx={{ height: { xs: 300, sm: 400 } }}>
                  <Line data={data} options={options} />
                </Box>
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={generateMonthlyReport}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 3,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      '&:hover': { background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)' },
                    }}
                  >
                    Generate Monthly Report
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <ShowChartIcon sx={{ fontSize: 80, color: '#e0e7ff', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No analytics data available
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Take attendance to see detailed analytics and trends
                </Typography>
                <Chip label="No data found" color="default" variant="outlined" sx={{ mt: 2 }} />
              </Box>
            )}
          </CardContent>
        </MotionCard>
      </Container>
    </Box>
  );
};

export default Analytics;
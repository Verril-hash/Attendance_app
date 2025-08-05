import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  IconButton,
  CircularProgress,
  Chip,
  Button,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  ShowChart as ShowChartIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import axios from 'axios';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const Analytics = ({ classId, setView }) => {
  const [analytics, setAnalytics] = useState({ dates: [], rates: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [success, setSuccess] = useState(null); // Added success state

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!classId) {
        setError('No class selected');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await axios.get(`/api/analytics/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAnalytics(response.data);
        const stuRes = await axios.get(`/api/students/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Date',
          font: { size: 16, weight: 'bold' },
          color: '#64748b',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 12 },
          padding: 10,
        },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Attendance Rate (%)',
          font: { size: 16, weight: 'bold' },
          color: '#64748b',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 12 },
          padding: 10,
        },
        min: 0,
        max: 100,
      },
    },
  };

  const averageRate = analytics.rates.length > 0
    ? (analytics.rates.reduce((a, b) => a + b, 0) / analytics.rates.length).toFixed(1)
    : 0;

  const maxRate = analytics.rates.length > 0 ? Math.max(...analytics.rates).toFixed(1) : 0;
  const minRate = analytics.rates.length > 0 ? Math.min(...analytics.rates).toFixed(1) : 0;

  const handleDownloadMonthlyPDF = () => {
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();
    const dailyAttendance = analytics.dates.map((date, index) => ({
      date,
      attended: totalStudents > 0 ? Math.round((analytics.rates[index] / 100) * totalStudents) : 0,
      rate: analytics.rates[index],
    }));

    const printWindow = window.open('', '_blank');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Monthly Attendance Report - ${month} ${year}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
          h1 { color: #667eea; text-align: center; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #667eea; color: white; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Monthly Attendance Report</h1>
        <p><strong>Month:</strong> ${month} ${year}</p>
        <p><strong>Total Students:</strong> ${totalStudents}</p>
        <p><strong>Average Attendance Rate:</strong> ${averageRate}%</p>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Students Attended</th>
              <th>Attendance Rate</th>
            </tr>
          </thead>
          <tbody>
            ${dailyAttendance.map(day => `
              <tr>
                <td>${day.date}</td>
                <td>${day.attended}</td>
                <td>${day.rate}%</td>
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
              filename: 'monthly-attendance-report-${month}-${year}.pdf',
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

    setSuccess('Monthly PDF generated successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pb: 4,
    }}>
      <Container maxWidth="xl" sx={{ pt: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
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
              <AssessmentIcon sx={{ fontSize: { xs: 80, sm: 120 } }} />
            </Box>
            <CardContent sx={{ p: { xs: 2, sm: 4 }, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <IconButton 
                  onClick={() => {
                    console.log('Back button clicked, setView type:', typeof setView);
                    if (setView && typeof setView === 'function') {
                      setView('dashboard');
                    } else {
                      console.error('setView is not a function or not provided');
                    }
                  }}
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
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <TrendingUpIcon sx={{ fontSize: { xs: 28, sm: 45 } }} />
                    Analytics Dashboard
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, mt: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    Comprehensive attendance insights and trends
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </MotionBox>

        {/* Stats Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          {[
            { 
              label: 'Total Records', 
              value: analytics.dates.length, 
              bg: 'linear-gradient(135deg, #03a9f4 0%, #0277bd 100%)',
              icon: <CalendarIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />,
              suffix: '',
            },
            { 
              label: 'Average Rate', 
              value: averageRate, 
              bg: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              icon: <TrendingUpIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />,
              suffix: '%',
            },
            { 
              label: 'Highest Rate', 
              value: maxRate, 
              bg: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              icon: <ShowChartIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />,
              suffix: '%',
            },
            { 
              label: 'Lowest Rate', 
              value: minRate, 
              bg: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              icon: <AssessmentIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />,
              suffix: '%',
            },
          ].map((card, index) => (
            <Grid item xs={6} sm={3} key={card.label}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    borderRadius: 4,
                    background: card.bg,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 4 }, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ mb: { xs: 1, sm: 2 } }}>{card.icon}</Box>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: { xs: '1.5rem', sm: '2.5rem' },
                        mb: 1,
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={40} color="inherit" />
                      ) : (
                        `${card.value}${card.suffix}`
                      )}
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

        {/* Chart */}
        <MotionCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            minHeight: { xs: 400, sm: 600 },
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: { xs: 300, sm: 500 },
                gap: 3,
              }}>
                <CircularProgress size={60} />
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Loading analytics data...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <AssessmentIcon sx={{ fontSize: { xs: 60, sm: 80 }, color: '#e0e7ff', mb: 2 }} />
                <Typography variant="h6" color="error" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {error}
                </Typography>
                <Chip 
                  label="Unable to load data" 
                  color="error" 
                  variant="outlined" 
                />
              </Box>
            ) : analytics.dates.length > 0 ? (
              <>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: { xs: 2, sm: 4 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                }}>
                  <Typography 
                    variant="h4" 
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
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <ShowChartIcon sx={{ fontSize: { xs: 60, sm: 80 }, color: '#e0e7ff', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  No analytics data available
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  Start taking attendance to see detailed analytics and trends
                </Typography>
                <Chip 
                  label="No data found" 
                  color="default" 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  size={window.innerWidth < 600 ? "small" : "medium"}
                />
              </Box>
            )}
          </CardContent>
        </MotionCard>

        {/* Download Button and Success Message */}
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
      </Container>
    </Box>
  );
};

export default Analytics;
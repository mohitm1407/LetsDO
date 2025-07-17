import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './home.css';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalProjects: number;
}

function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    totalProjects: 0
  });

  useEffect(() => {
    // You can fetch dashboard stats here
    // For now, using placeholder data
    setStats({
      totalTasks: 12,
      completedTasks: 8,
      inProgressTasks: 4,
      totalProjects: 3
    });
  }, []);

  const quickActions = [
    {
      title: 'View Tasks',
      description: 'Manage and track all your tasks',
      icon: <AssignmentIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      action: () => navigate('/tasks'),
      color: '#e3f2fd'
    },
    {
      title: 'View Projects',
      description: 'Organize your work into projects',
      icon: <FolderIcon sx={{ fontSize: 40, color: '#388e3c' }} />,
      action: () => navigate('/projects'),
      color: '#e8f5e8'
    }
  ];

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: <AssignmentIcon sx={{ fontSize: 30, color: '#1976d2' }} />,
      color: '#e3f2fd'
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: <TrendingUpIcon sx={{ fontSize: 30, color: '#388e3c' }} />,
      color: '#e8f5e8'
    },
    {
      title: 'In Progress',
      value: stats.inProgressTasks,
      icon: <DashboardIcon sx={{ fontSize: 30, color: '#f57c00' }} />,
      color: '#fff3e0'
    },
    {
      title: 'Projects',
      value: stats.totalProjects,
      icon: <FolderIcon sx={{ fontSize: 30, color: '#7b1fa2' }} />,
      color: '#f3e5f5'
    }
  ];

  return (
    <div className="layout">
      <Sidebar />
      
      <div className="main-wrapper">
        <Box
          sx={{
            background: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            pt: 4,
            pb: 4,
            minHeight: '100vh',
          }}
        >
          <Container maxWidth="xl">
            {/* Welcome Section */}
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                component="h1" 
                fontWeight="bold" 
                sx={{ 
                  mb: 2, 
                  color: 'white', 
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)' 
                }}
              >
                Welcome to LetsDO
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Your personal task and project management solution. Stay organized, track progress, and achieve your goals.
              </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {statCards.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card 
                    sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Box 
                        sx={{ 
                          backgroundColor: stat.color,
                          borderRadius: '50%',
                          width: 60,
                          height: 60,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Quick Actions */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                sx={{ 
                  mb: 3, 
                  color: 'white', 
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                  textAlign: 'center'
                }}
              >
                Quick Actions
              </Typography>
              
              <Grid container spacing={3} justifyContent="center">
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card 
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                      onClick={action.action}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Box 
                          sx={{ 
                            backgroundColor: action.color,
                            borderRadius: '50%',
                            width: 80,
                            height: 80,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                          }}
                        >
                          {action.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {action.description}
                        </Typography>
                        <Button 
                          variant="contained" 
                          onClick={(e) => {
                            e.stopPropagation();
                            action.action();
                          }}
                          sx={{ 
                            borderRadius: 2,
                            px: 3
                          }}
                        >
                          Go
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Recent Activity Section */}
            <Box sx={{ textAlign: 'center' }}>
              <Card 
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  py: 4
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Get Started
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Ready to boost your productivity? Start by creating your first task or project.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button 
                      variant="contained" 
                      onClick={() => navigate('/tasks')}
                      sx={{ borderRadius: 2, px: 3 }}
                    >
                      Create Task
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/projects')}
                      sx={{ borderRadius: 2, px: 3 }}
                    >
                      View Projects
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Container>
        </Box>
      </div>
    </div>
  );
}

export default HomePage;
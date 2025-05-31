import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import NoteIcon from '@mui/icons-material/Note';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

interface Meeting {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: number;
  status: number;
  project_name: string;
  project_id: number;
}

interface Project {
  id: number;
  name: string;
  description: string;
  task_count: number;
}

function Dashboard() {
  const navigate = useNavigate();
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : '1';

      // Fetch upcoming meetings
      const meetingsResponse = await axios.get(`http://0.0.0.0:8001/meetings/`);
      const meetings = meetingsResponse.data.map((meeting: any) => ({
        id: meeting.id,
        title: meeting.title,
        date: meeting.start_time.split('T')[0],
        startTime: meeting.start_time.split('T')[1].slice(0, 5),
        endTime: meeting.end_time.split('T')[1].slice(0, 5),
        description: meeting.description
      }));
      setUpcomingMeetings(meetings);

      // Fetch tasks
      const tasksResponse = await axios.get(`http://0.0.0.0:8001/tasks/${userId}`);
      const tasks = tasksResponse.data.task_list || [];
      setTodoTasks(tasks.filter((task: Task) => task.status === 0));

      // Fetch projects
      const projectsResponse = await axios.get(`http://0.0.0.0:8001/projects/${userId}`);
      setProjects(projectsResponse.data.projects || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityDetails = (priority: number) => {
    switch (priority) {
      case 0:
        return { label: 'High', color: '#d32f2f', icon: <PriorityHighIcon /> };
      case 1:
        return { label: 'Medium', color: '#ed6c02', icon: <FlagIcon /> };
      case 2:
        return { label: 'Low', color: '#2e7d32', icon: <LowPriorityIcon /> };
      default:
        return { label: 'Unknown', color: '#757575', icon: <FlagIcon /> };
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleMeetingClick = (meetingId: number) => {
    navigate(`/meeting-notes/${meetingId}`);
  };

  const handleTaskClick = (taskId: number) => {
    navigate(`/task-notes/${taskId}`);
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-wrapper">
        <Box sx={{ backgroundColor: '#f5f7fa', p: 3, minHeight: '100vh' }}>
          <Container maxWidth="xl">
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, color: '#1a237e' }}>
              Dashboard
            </Typography>

            <Grid container spacing={3}>
              {/* Upcoming Meetings */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      color: '#1976d2'
                    }}>
                      <ScheduleIcon /> Upcoming Meetings
                    </Typography>
                    <List>
                      {upcomingMeetings.slice(0, 5).map((meeting, index) => (
                        <React.Fragment key={meeting.id}>
                          {index > 0 && <Divider />}
                          <ListItem 
                            component="div"
                            onClick={() => handleMeetingClick(meeting.id)}
                            sx={{ 
                              borderRadius: 1,
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)'
                              }
                            }}
                          >
                            <ListItemText
                              primary={meeting.title}
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {formatDate(meeting.date)}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {meeting.startTime} - {meeting.endTime}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* TODO Tasks */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      color: '#9c27b0'
                    }}>
                      <HourglassTopIcon /> TODO Tasks
                    </Typography>
                    <List>
                      {todoTasks.slice(0, 5).map((task, index) => {
                        const priorityDetails = getPriorityDetails(task.priority);
                        return (
                          <React.Fragment key={task.id}>
                            {index > 0 && <Divider />}
                            <ListItem 
                              component="div"
                              onClick={() => handleTaskClick(task.id)}
                              sx={{ 
                                borderRadius: 1,
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: 'rgba(156, 39, 176, 0.08)'
                                }
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {task.title}
                                    <Chip
                                      size="small"
                                      label={priorityDetails.label}
                                      icon={priorityDetails.icon}
                                      sx={{
                                        backgroundColor: `${priorityDetails.color}15`,
                                        color: priorityDetails.color,
                                        height: 20
                                      }}
                                    />
                                  </Box>
                                }
                                secondary={task.project_name}
                              />
                              <Tooltip title="Open Notes">
                                <IconButton 
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskClick(task.id);
                                  }}
                                  sx={{ 
                                    color: '#9c27b0',
                                    '&:hover': {
                                      backgroundColor: 'rgba(156, 39, 176, 0.08)'
                                    }
                                  }}
                                >
                                  <NoteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </ListItem>
                          </React.Fragment>
                        );
                      })}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Projects vs Tasks Table */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      color: '#2e7d32'
                    }}>
                      <CheckCircleIcon /> Projects Overview
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Project Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Total Tasks</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {projects.map((project) => (
                            <TableRow 
                              key={project.id}
                              sx={{ 
                                '&:hover': {
                                  backgroundColor: 'rgba(46, 125, 50, 0.08)'
                                }
                              }}
                            >
                              <TableCell>{project.name}</TableCell>
                              <TableCell>{project.description}</TableCell>
                              <TableCell align="right">{project.task_count}</TableCell>
                              <TableCell align="right">
                                <Tooltip title="View Project">
                                  <IconButton 
                                    size="small"
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                    sx={{ 
                                      color: '#2e7d32',
                                      '&:hover': {
                                        backgroundColor: 'rgba(46, 125, 50, 0.08)'
                                      }
                                    }}
                                  >
                                    <NoteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </div>
    </div>
  );
}

export default Dashboard; 
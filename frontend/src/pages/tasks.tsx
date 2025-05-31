import '@fortawesome/fontawesome-free/css/all.min.css';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import FlagIcon from '@mui/icons-material/Flag';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import NoteIcon from '@mui/icons-material/Note';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddTaskModal from '../components/AddTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import Sidebar from '../components/Sidebar';
import '../pages/home.css';

// Styled components for custom UI elements
const StyledTaskCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
  }
}));

// Type definitions
interface Task {
  id: number;
  title: string;
  description: string;
  priority: number;
  status: number;
  created_at: string;
  project_name: string;
  project_id: number;
}

// Map priority and status to human-readable labels and colors
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

const getStatusDetails = (status: number) => {
  switch (status) {
    case 0:
      return { label: 'To Do', color: '#0288d1', icon: <ScheduleIcon /> };
    case 1:
      return { label: 'In Progress', color: '#9c27b0', icon: <HourglassTopIcon /> };
    case 2:
      return { label: 'Completed', color: '#2e7d32', icon: <CheckCircleIcon /> };
    case 3:
      return { label: 'Dropped', color: '#757575', icon: <CancelIcon /> };
    default:
      return { label: 'Unknown', color: '#757575', icon: <ScheduleIcon /> };
  }
};

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Assuming user ID is stored in localStorage
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : '1'; // Default to 1 if not found
      
      const response = await axios.get(`http://0.0.0.0:8001/tasks/${userId}`);
      setTasks(response.data.task_list || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again later.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter tasks based on selected filter and search query
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filter) {
      case 'todo':
        return task.status === 0;
      case 'inprogress':
        return task.status === 1;
      case 'completed':
        return task.status === 2;
      case 'dropped':
        return task.status === 3;
      case 'high':
        return task.priority === 0;
      case 'medium':
        return task.priority === 1;
      case 'low':
        return task.priority === 2;
      default:
        return true;
    }
  });

  // Format date string to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  const handleOpenNotes = (taskId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent task card click event
    navigate(`/task-notes/${taskId}`);
  };

  // Group tasks by status and sort by creation date
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const statusLabel = getStatusDetails(task.status).label;
    if (!acc[statusLabel]) {
      acc[statusLabel] = [];
    }
    acc[statusLabel].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Sort tasks within each status group by creation date
  Object.keys(groupedTasks).forEach(status => {
    groupedTasks[status].sort((a, b) => b.id - a.id);
  });

  // Define the order of status groups
  const statusOrder = ['To Do', 'In Progress', 'Completed', 'Dropped'];

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-wrapper">
        <Box
          sx={{
            backgroundColor: '#f5f7fa',
            pt: 2,
            pb: 4,
            height: '100%',
            overflow: 'auto',
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ 
              mb: 4,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center' 
            }}>
              <div>
                <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
                  My Tasks
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage and track all your tasks in one place
                </Typography>
              </div>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setAddModalOpen(true)}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                Add Task
              </Button>
            </Box>

            {/* Search and filter section */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 4, 
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              <TextField
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={handleSearchChange}
                variant="outlined"
                sx={{ flexGrow: 1, minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="task-filter-label">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FilterListIcon sx={{ mr: 1 }} /> Filter Tasks
                  </Box>
                </InputLabel>
                <Select
                  labelId="task-filter-label"
                  value={filter}
                  label="Filter Tasks"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">All Tasks</MenuItem>
                  <Divider />
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="inprogress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="dropped">Dropped</MenuItem>
                  <Divider />
                  <MenuItem value="high">High Priority</MenuItem>
                  <MenuItem value="medium">Medium Priority</MenuItem>
                  <MenuItem value="low">Low Priority</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Tasks display by status */}
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Loading tasks...</Typography>
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="error">{error}</Typography>
              </Box>
            ) : filteredTasks.length === 0 ? (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  backgroundColor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tasks found
                </Typography>
                <Typography color="text.secondary">
                  {searchQuery ? 'Try a different search term' : 'Create some tasks to get started'}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {statusOrder.map(status => {
                  const tasks = groupedTasks[status] || [];
                  if (tasks.length === 0) return null;

                  return (
                    <Box key={status}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mb: 2, 
                          color: getStatusDetails(
                            statusOrder.indexOf(status)
                          ).color,
                          fontWeight: 'bold'
                        }}
                      >
                        {status} ({tasks.length})
                      </Typography>
                      <Grid container spacing={3}>
                        {tasks.map(task => {
                          const priorityDetails = getPriorityDetails(task.priority);
                          const statusDetails = getStatusDetails(task.status);
                          
                          return (
                            <Grid item xs={12} md={6} lg={4} key={task.id}>
                              <StyledTaskCard onClick={() => handleTaskClick(task)}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography 
                                    variant="subtitle1" 
                                    sx={{ fontWeight: 'bold', mb: 0.5 }}
                                  >
                                    {task.title}
                                  </Typography>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Tooltip title="Open Notes">
                                      <IconButton 
                                        size="small"
                                        onClick={(e) => handleOpenNotes(task.id, e)}
                                        sx={{ 
                                          color: '#1976d2',
                                          '&:hover': {
                                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                          }
                                        }}
                                      >
                                        <NoteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Chip 
                                      size="small" 
                                      label={priorityDetails.label}
                                      icon={priorityDetails.icon}
                                      sx={{ 
                                        backgroundColor: `${priorityDetails.color}15`,
                                        color: priorityDetails.color,
                                        fontWeight: 'bold'
                                      }}
                                    />
                                  </Box>
                                </Box>
                                
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ 
                                    mb: 2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {task.description}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Chip 
                                    size="small" 
                                    label={task.project_name}
                                    sx={{ 
                                      backgroundColor: '#e3f2fd',
                                      color: '#1976d2',
                                    }}
                                  />
                                  {/* <Typography variant="caption" color="text.secondary">
                                    {formatDate(task.created_at)}
                                  </Typography> */}
                                </Box>
                              </StyledTaskCard>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Edit Task Modal */}
            <EditTaskModal
              open={editModalOpen}
              onClose={() => setEditModalOpen(false)}
              task={selectedTask}
              onTaskUpdated={fetchTasks}
            />
            
            {/* Add Task Modal */}
            <AddTaskModal
              open={addModalOpen}
              onClose={() => setAddModalOpen(false)}
              onTaskAdded={fetchTasks}
            />
          </Container>
        </Box>
      </div>
    </div>
  );
}

export default TasksPage; 
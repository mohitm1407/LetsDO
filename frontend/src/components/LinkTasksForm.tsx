import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Typography, 
  Button,
  Paper,
  Divider,
  InputAdornment,
  CircularProgress,
  Tab,
  Tabs
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CancelIcon from '@mui/icons-material/Cancel';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import FlagIcon from '@mui/icons-material/Flag';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import axios from 'axios';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: number;
  status: number;
  project_title?: string;
  project_name?: string;
}

interface LinkTasksFormProps {
  meetingId: number;
  onTasksLinked: () => void;
}

function LinkTasksForm({ meetingId, onTasksLinked }: LinkTasksFormProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [linkedTasks, setLinkedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [taskTabValue, setTaskTabValue] = useState(0); // 0: Todo, 1: In Progress, 2: Completed
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch all tasks when component mounts
    fetchTasks();
    // Fetch tasks already linked to this meeting
    fetchLinkedTasks();
  }, []);
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Get user ID from localStorage
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : '1';
      
      const response = await axios.get(`http://0.0.0.0:8001/tasks/${userId}`);
      const taskList = response.data.task_list || [];
      console.log(taskList)
      // No longer filtering out completed tasks
      setTasks(taskList);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchLinkedTasks = async () => {
    try {
      const response = await axios.get(`http://0.0.0.0:8001/meetings/${meetingId}`);
      console.log(response.data)
      if (response.data && response.data.tasks && response.data.tasks.length > 0) {
        // Use the task data directly from the response
        
        setLinkedTasks(response.data.tasks);
      } else {
        setLinkedTasks([]);
      }
    } catch (err) {
      console.error('Error fetching linked tasks:', err);
      // Don't set error here as it's not critical
    }
  };
  
  const handleTaskTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTaskTabValue(newValue);
  };
  
  const getTaskStatusDetails = (status: number) => {
    switch (status) {
      case 0:
        return { label: 'To Do', color: '#0288d1', icon: <ScheduleIcon fontSize="small" /> };
      case 1:
        return { label: 'In Progress', color: '#9c27b0', icon: <HourglassTopIcon fontSize="small" /> };
      case 2:
        return { label: 'Completed', color: '#2e7d32', icon: <CheckCircleIcon fontSize="small" /> };
      case 3:
        return { label: 'Dropped', color: '#757575', icon: <CancelIcon fontSize="small" /> };
      default:
        return { label: 'Unknown', color: '#757575', icon: <ScheduleIcon fontSize="small" /> };
    }
  };
  
  const getTaskPriorityDetails = (priority: number) => {
    switch (priority) {
      case 0:
        return { label: 'High', color: '#d32f2f', icon: <PriorityHighIcon fontSize="small" /> };
      case 1:
        return { label: 'Medium', color: '#ed6c02', icon: <FlagIcon fontSize="small" /> };
      case 2:
        return { label: 'Low', color: '#2e7d32', icon: <LowPriorityIcon fontSize="small" /> };
      default:
        return { label: 'Unknown', color: '#757575', icon: <FlagIcon fontSize="small" /> };
    }
  };
  
  const filteredTasksByStatus = (status: number) => {
    return tasks.filter(task => 
      task.status === status && 
      task.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) &&
      !isTaskLinked(task.id)
    );
  };
  
  const isTaskLinked = (taskId: number) => {
    return linkedTasks.some(task => task.id === taskId);
  };
  
  const handleAddTaskToMeeting = (task: Task) => {
    setLinkedTasks([...linkedTasks, task]);
  };
  
  const handleRemoveTaskFromMeeting = (taskId: number) => {
    setLinkedTasks(linkedTasks.filter(task => task.id !== taskId));
  };
  
  const handleSaveLinkedTasks = async () => {
    try {
      setSaving(true);
      const taskIds = linkedTasks.map(task => task.id);
      
      await axios.post(`http://0.0.0.0:8001/meetings/${meetingId}/add_task/`, {
        task_ids: taskIds
      });
      
      onTasksLinked();
      setError(null);
    } catch (err) {
      console.error('Error linking tasks:', err);
      setError('Failed to link tasks to meeting');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          Select tasks you want to associate with this meeting. Linked tasks will be displayed in the meeting notes.
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Currently Linked Tasks ({linkedTasks.length})
        </Typography>
        
        {linkedTasks.length === 0 ? (
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              color: 'text.secondary',
              backgroundColor: '#f5f5f5'
            }}
          >
            <Typography variant="body2">No tasks linked to this meeting</Typography>
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <List disablePadding>
              {linkedTasks.map((task, index) => {
                const priorityDetails = getTaskPriorityDetails(task.priority);
                const statusDetails = getTaskStatusDetails(task.status);
                
                return (
                  <React.Fragment key={task.id}>
                    {index > 0 && <Divider />}
                    <ListItem 
                      secondaryAction={
                        <Chip 
                          label="Remove"
                          size="small"
                          color="default"
                          onClick={() => handleRemoveTaskFromMeeting(task.id)}
                          sx={{ cursor: 'pointer' }}
                        />
                      }
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography component="span" fontWeight="medium">
                              {task.title}
                            </Typography>
                            <Chip
                              size="small"
                              label={priorityDetails.label}
                              icon={priorityDetails.icon}
                              sx={{
                                backgroundColor: `${priorityDetails.color}15`,
                                color: priorityDetails.color,
                                fontWeight: 'medium',
                                ml: 1
                              }}
                            />
                            <Chip
                              size="small"
                              label={statusDetails.label}
                              icon={statusDetails.icon}
                              sx={{
                                backgroundColor: `${statusDetails.color}15`,
                                color: statusDetails.color,
                                fontWeight: 'medium'
                              }}
                            />
                          </Box>
                        }
                        secondary={task.project_title || task.project_name || 'No project'}
                      />
                    </ListItem>
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        )}
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Add Tasks
        </Typography>
        
        <TextField
          placeholder="Search tasks..."
          fullWidth
          value={taskSearchQuery}
          onChange={(e) => setTaskSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={taskTabValue} 
            onChange={handleTaskTabChange}
            aria-label="task status tabs"
            sx={{ mb: 2 }}
            variant="fullWidth"
          >
            <Tab 
              label="To Do" 
              icon={<ScheduleIcon fontSize="small" />} 
              iconPosition="start"
            />
            <Tab 
              label="In Progress" 
              icon={<HourglassTopIcon fontSize="small" />} 
              iconPosition="start"
            />
            <Tab 
              label="Completed" 
              icon={<CheckCircleIcon fontSize="small" />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        {taskTabValue === 0 && (
          <TaskList 
            tasks={filteredTasksByStatus(0)} 
            onTaskClick={handleAddTaskToMeeting}
          />
        )}
        
        {taskTabValue === 1 && (
          <TaskList 
            tasks={filteredTasksByStatus(1)} 
            onTaskClick={handleAddTaskToMeeting}
          />
        )}
        
        {taskTabValue === 2 && (
          <TaskList 
            tasks={filteredTasksByStatus(2)} 
            onTaskClick={handleAddTaskToMeeting}
          />
        )}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button 
          variant="contained" 
          onClick={handleSaveLinkedTasks}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
}

// Helper component for task list
function TaskList({ tasks, onTaskClick }: { tasks: Task[], onTaskClick: (task: Task) => void }) {
  if (tasks.length === 0) {
    return (
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          textAlign: 'center', 
          color: 'text.secondary',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Typography variant="body2">No tasks available</Typography>
      </Paper>
    );
  }
  
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <List disablePadding>
        {tasks.map((task, index) => {
          const priorityDetails = getPriorityColor(task.priority);
          
          return (
            <React.Fragment key={task.id}>
              {index > 0 && <Divider />}
              <ListItem 
                onClick={() => onTaskClick(task)}
                sx={{ 
                  borderLeft: `4px solid ${priorityDetails}`,
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  cursor: 'pointer'
                }}
              >
                <ListItemText
                  primary={task.title}
                  secondary={task.project_title || task.project_name || 'No project'}
                />
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
}

// Helper function to get priority color
function getPriorityColor(priority: number): string {
  switch (priority) {
    case 0: return '#d32f2f'; // High - red
    case 1: return '#ed6c02'; // Medium - orange
    case 2: return '#2e7d32'; // Low - green
    default: return '#757575'; // Default - gray
  }
}

export default LinkTasksForm; 
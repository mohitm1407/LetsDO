import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  CircularProgress,
  Paper,
  Divider,
  Tooltip
} from '@mui/material';
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
}

interface LinkedTasksListProps {
  meetingId: number;
}

const LinkedTasksList: React.FC<LinkedTasksListProps> = ({ meetingId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinkedTasks();
  }, [meetingId]);

  const fetchLinkedTasks = async () => {
    try {
      setLoading(true);
      // First get the meeting to get the task IDs
      const meetingResponse = await axios.get(`http://0.0.0.0:8001/meetings/${meetingId}`);
      
      if (meetingResponse.data && meetingResponse.data.tasks && meetingResponse.data.tasks.length > 0) {
        // If there are linked tasks, fetch their details
        const taskPromises = meetingResponse.data.tasks.map((taskId: number) => 
          axios.get(`http://0.0.0.0:8001/tasks/details/${taskId}/`)
        );
        
        const taskResponses = await Promise.all(taskPromises);
        const linkedTasksList = taskResponses.map(resp => resp.data);
        setTasks(linkedTasksList);
      } else {
        setTasks([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching linked tasks:', err);
      setError('Failed to load linked tasks');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for task status and priority
  const getStatusDetails = (status: number) => {
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

  const getPriorityDetails = (priority: number) => {
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography variant="body2">{error}</Typography>
      </Box>
    );
  }

  return (
    <div className="linked-tasks-container">
      <div className="linked-tasks-header">
        <h3>Linked Tasks ({tasks.length})</h3>
      </div>
      
      {tasks.length === 0 ? (
        <div className="linked-tasks-empty">
          No tasks linked to this meeting yet.
        </div>
      ) : (
        <ul className="linked-tasks-list">
          {tasks.map(task => {
            const priorityDetails = getPriorityDetails(task.priority);
            const statusDetails = getStatusDetails(task.status);
            
            return (
              <li key={task.id} className="linked-task-item">
                <div className="linked-task-header">
                  <div className="linked-task-title">{task.title}</div>
                  <div className="linked-task-badges">
                    <span className="priority-badge" style={{ backgroundColor: `${priorityDetails.color}15`, color: priorityDetails.color }}>
                      {priorityDetails.label}
                    </span>
                    <span className="status-badge" style={{ backgroundColor: `${statusDetails.color}15`, color: statusDetails.color }}>
                      {statusDetails.label}
                    </span>
                  </div>
                </div>
                <div className="linked-task-description">
                  {task.description}
                </div>
                <div className="linked-task-project">
                  {task.project_title || 'No Project'}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LinkedTasksList; 
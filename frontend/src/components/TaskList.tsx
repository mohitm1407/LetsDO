import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import FlagIcon from '@mui/icons-material/Flag';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
    Box,
    Chip,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Tooltip,
    Typography,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: number;
  status: number;
  project_name: string;
  project_id: number;
  created_at: string;
}

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask, onDeleteTask }) => {
  const navigate = useNavigate();

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

  const statusColumns = [
    { status: 0, label: 'To Do' },
    { status: 1, label: 'In Progress' },
    { status: 2, label: 'Completed' },
    { status: 3, label: 'Dropped' },
  ];

  const handleOpenNotes = (task: Task) => {
    navigate(`/task-notes/${task.id}`, {
      state: {
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          created_at: task.created_at
        }
      }
    });
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: 2, 
        height: 'calc(100vh - 200px)', 
        overflow: 'hidden',
        p: 1,
        backgroundColor: '#f8fafc',
        minHeight: 0,
      }}
    >
      {statusColumns.map((column) => {
        const columnTasks = tasks.filter(task => task.status === column.status);
        const statusDetails = getStatusDetails(column.status);

        return (
          <Paper
            key={column.status}
            elevation={0}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 300,
              backgroundColor: 'white',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid',
              borderColor: 'divider',
              minHeight: 0,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                position: 'sticky',
                top: 0,
                zIndex: 1,
                backdropFilter: 'blur(8px)',
                background: 'rgba(255, 255, 255, 0.9)',
                flexShrink: 0,
              }}
            >
              {statusDetails.icon}
              <Typography variant="h6" sx={{ flex: 1, fontWeight: 600, color: statusDetails.color }}>
                {column.label}
              </Typography>
              <Chip
                label={columnTasks.length}
                size="small"
                sx={{ 
                  backgroundColor: `${statusDetails.color}15`, 
                  color: statusDetails.color,
                  fontWeight: 600,
                  border: `1px solid ${statusDetails.color}30`,
                }}
              />
            </Box>

            <List
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 1.5,
                minHeight: 0,
                '& > *:not(:last-child)': {
                  mb: 1.5,
                },
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#e0e0e0',
                  borderRadius: '3px',
                  '&:hover': {
                    background: '#bdbdbd',
                  },
                },
              }}
            >
              {columnTasks.map((task) => {
                const priorityDetails = getPriorityDetails(task.priority);
                return (
                  <Paper
                    key={task.id}
                    elevation={0}
                    sx={{
                      backgroundColor: 'white',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <ListItem
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        p: 1.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1, width: '100%' }}>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                color: 'text.primary',
                                mb: 0.5,
                              }}
                            >
                              {task.title}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                display: 'block',
                                fontSize: '0.75rem',
                              }}
                            >
                              {task.project_name}
                            </Typography>
                          }
                          sx={{ flex: 1, mr: 1 }}
                        />
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Notes">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenNotes(task)}
                              sx={{ 
                                color: 'info.main',
                                '&:hover': {
                                  backgroundColor: 'info.light',
                                  color: 'info.dark',
                                },
                                minWidth: '32px',
                                minHeight: '32px',
                                padding: '4px',
                              }}
                            >
                              <DescriptionIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => onEditTask(task)}
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                  color: 'primary.dark',
                                },
                                minWidth: '32px',
                                minHeight: '32px',
                                padding: '4px',
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => onDeleteTask(task.id)}
                              sx={{ 
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'error.light',
                                  color: 'error.dark',
                                },
                                minWidth: '32px',
                                minHeight: '32px',
                                padding: '4px',
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            size="small"
                            label={priorityDetails.label}
                            icon={priorityDetails.icon}
                            sx={{
                              backgroundColor: `${priorityDetails.color}15`,
                              color: priorityDetails.color,
                              height: 24,
                              fontWeight: 600,
                              border: `1px solid ${priorityDetails.color}30`,
                              '& .MuiChip-icon': {
                                color: priorityDetails.color,
                              },
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            fontSize: '0.8rem',
                            lineHeight: 1.4,
                          }}
                        >
                          {task.description}
                        </Typography>
                      </Box>
                    </ListItem>
                  </Paper>
                );
              })}
            </List>
          </Paper>
        );
      })}
    </Box>
  );
};

export default TaskList; 
import { 
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useEffect, useState } from 'react';

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

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onTaskUpdated: () => void;
}

function EditTaskModal({ open, onClose, task, onTaskUpdated }: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 1, // Default to medium
    status: 0 // Default to todo
  });
  const [errors, setErrors] = useState({
    title: '',
    description: ''
  });

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status
      });
    }
  }, [task]);

  const handleTextChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const handleSelectChange = (field: string) => (event: SelectChangeEvent<number>) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const validateForm = () => {
    const newErrors = {
      title: '',
      description: ''
    };
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async () => {
    if (!validateForm() || !task) return;
    
    try {
      await axios.put(`http://0.0.0.0:8001/update_task/${task.id}/`, {
        ...formData,
        project_id: task.project_id // Keep the original project
      });
      
      onTaskUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`http://0.0.0.0:8001/delete_task/${task.id}/`);
        onTaskUpdated();
        onClose();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  if (!task) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          Edit Task
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                Project:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                {task.project_name}
              </Typography>
            </Box>
            
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={handleTextChange('title')}
              error={!!errors.title}
              helperText={errors.title}
              variant="outlined"
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={handleTextChange('description')}
              error={!!errors.description}
              helperText={errors.description}
              variant="outlined"
            />

            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                label="Priority"
                value={formData.priority}
                onChange={handleSelectChange('priority')}
              >
                <MenuItem value={0}>High</MenuItem>
                <MenuItem value={1}>Medium</MenuItem>
                <MenuItem value={2}>Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                label="Status"
                value={formData.status}
                onChange={handleSelectChange('status')}
              >
                <MenuItem value={0}>To Do</MenuItem>
                <MenuItem value={1}>In Progress</MenuItem>
                <MenuItem value={2}>Completed</MenuItem>
                <MenuItem value={3}>Dropped</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleDelete}
                sx={{ width: '30%' }}
              >
                Delete
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button 
                variant="outlined" 
                onClick={onClose}
                sx={{ width: '30%' }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                sx={{ width: '30%' }}
              >
                Save
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default EditTaskModal; 
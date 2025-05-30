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
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Project {
  id: number;
  name: string;
}

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
}

function AddTaskModal({ open, onClose, onTaskAdded }: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 1, // Default to medium
    status: 0, // Default to todo
    is_daily_task: false
  });
  
  const [errors, setErrors] = useState({
    title: '',
    description: ''
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projectError, setProjectError] = useState('');

  // Fetch projects when modal opens
  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  const fetchProjects = async () => {
    try {
      // Get user ID from localStorage
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : null;
      
      if (!userId) {
        console.error('User ID not found');
        return;
      }
      
      const response = await axios.get(`http://0.0.0.0:8001/projects/${userId}`);
      if (response.data && response.data.project_list) {
        setProjects(response.data.project_list.map((project: any) => ({
          id: project.id,
          name: project.display_name
        })));
        
        // Set first project as default if available
        if (response.data.project_list.length > 0) {
          setSelectedProject(response.data.project_list[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

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

  const handleProjectChange = (event: SelectChangeEvent<number>) => {
    setSelectedProject(event.target.value as number);
    setProjectError('');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 1,
      status: 0,
      is_daily_task: false
    });
    setErrors({
      title: '',
      description: ''
    });
    setProjectError('');
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
    
    if (selectedProject === null) {
      setProjectError('Please select a project');
      return false;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      await axios.post(`http://0.0.0.0:8001/projects/${selectedProject}/add_task/`, formData);
      
      onTaskAdded();
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

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
          Add New Task
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Stack spacing={3}>
            <FormControl fullWidth error={!!projectError}>
              <InputLabel id="project-select-label">Project</InputLabel>
              <Select
                labelId="project-select-label"
                value={selectedProject || ''}
                label="Project"
                onChange={handleProjectChange}
              >
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
              {projectError && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {projectError}
                </Typography>
              )}
            </FormControl>
            
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
                onClick={onClose}
                sx={{ width: '50%' }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                sx={{ width: '50%' }}
              >
                Add Task
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default AddTaskModal; 
import CloseIcon from '@mui/icons-material/Close';
import { Button, Card, Dialog, IconButton, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface AddProjectProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onProjectAdded?: () => void;
}

function AddProject({ open, setOpen, onProjectAdded }: AddProjectProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    user_id: null as number | null
  });
  
  const [errors, setErrors] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    // Get user_id from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setFormData(prev => ({
        ...prev,
        user_id: user.id
      }));
    }
  }, []);

  const handleTextChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    if (errors[field as keyof typeof errors]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
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
    if (!formData.user_id) {
      console.error('No user ID found');
      return false;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = () => {
    console.log('Submitting form data:', formData);
    
    if (!validateForm()) return;

    if (!formData.user_id) {
      console.error('No user ID found');
      return;
    }

    axios.post('http://localhost:8001/projects/create/', formData)
      .then((response) => {
        console.log('Project created:', response.data);
        setOpen(false);
        setFormData({
          title: '',
          description: '',
          user_id: formData.user_id
        });
        if (onProjectAdded) {
          onProjectAdded();
        }
      })
      .catch((error) => {
        console.log('Error creating project:', error);
        if (error.response?.data) {
          // Log the actual error response structure
          console.log('Backend error response:', error.response.data);
          
          // Handle different error response structures
          if (Array.isArray(error.response.data.details)) {
            // Handle array of validation errors
            const newErrors = { ...errors };
            error.response.data.details.forEach((err: any) => {
              if (err.loc[1] === 'title') {
                newErrors.title = err.msg;
              }
              if (err.loc[1] === 'description') {
                newErrors.description = err.msg;
              }
            });
            setErrors(newErrors);
          } else if (typeof error.response.data.error === 'string') {
            // Handle single error message
            setErrors({
              title: error.response.data.error,
              description: error.response.data.error
            });
          } else if (error.response.data.details && typeof error.response.data.details === 'object') {
            // Handle object with field-specific errors
            const newErrors = { ...errors };
            Object.entries(error.response.data.details).forEach(([field, message]) => {
              if (field in newErrors) {
                newErrors[field as keyof typeof newErrors] = message as string;
              }
            });
            setErrors(newErrors);
          }
        } else {
          // Handle network or other errors
          setErrors({
            title: 'An error occurred while creating the project',
            description: 'An error occurred while creating the project'
          });
        }
      });
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => setOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <Card sx={{
        p: 3,
        backgroundColor: '#f8f9fa',
        position: 'relative'
      }}>
        <IconButton
          sx={{
            position: 'absolute',
            right: 8,
            top: 8
          }}
          onClick={() => setOpen(false)}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Create New Project
        </Typography>

        <Stack spacing={3}>
          <TextField
            label="Project Title"
            fullWidth
            value={formData.title}
            onChange={handleTextChange('title')}
            error={!!errors.title}
            helperText={errors.title}
            variant="outlined"
          />

          <TextField
            label="Project Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={handleTextChange('description')}
            error={!!errors.description}
            helperText={errors.description}
            variant="outlined"
          />

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setOpen(false)}
              fullWidth
              sx={{
                color: '#666',
                borderColor: '#666',
                '&:hover': {
                  borderColor: '#444',
                  backgroundColor: 'rgba(0,0,0,0.05)'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              fullWidth
              disabled={!formData.user_id}
              sx={{
                backgroundColor: '#1c7ed6',
                '&:hover': {
                  backgroundColor: '#1976d2'
                }
              }}
            >
              Create Project
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Dialog>
  );
}

export default AddProject; 
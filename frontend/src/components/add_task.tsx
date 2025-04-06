import CloseIcon from '@mui/icons-material/Close';
import { Button, Card, Dialog, FormControl, IconButton, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import axios from 'axios';
import { useState } from 'react';

interface AddTaskProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface FormData {
  title: string;
  description: string;
  priority: number;
  status: number;
}

function AddTask({ open, setOpen }: AddTaskProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 1, // MEDIUM
    status: 0 // TODO
  });
  const [errors, setErrors] = useState({
    title: '',
    description: ''
  });

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

  const handleSubmit = () => {
    if (!validateForm()) return;

    axios.post('http://localhost:8001/projects//add_task/', formData)
      .then((response) => {
        console.log(response);
        setOpen(false);
        // Reset form
        setFormData({
          title: '',
          description: '',
          priority: 1,
          status: 0
        });
      })
      .catch((error) => {
        console.log(error);
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
          Add New Task
        </Typography>

        <Stack spacing={3}>
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
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Priority
            </Typography>
            <Select
              value={formData.priority}
              onChange={handleSelectChange('priority')}
              sx={{
                backgroundColor: 'white'
              }}
            >
              <MenuItem value={2}>Low</MenuItem>
              <MenuItem value={1}>Medium</MenuItem>
              <MenuItem value={0}>High</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Status
            </Typography>
            <Select
              value={formData.status}
              onChange={handleSelectChange('status')}
              sx={{
                backgroundColor: 'white'
              }}
            >
              <MenuItem value={0}>To Do</MenuItem>
              <MenuItem value={1}>In Progress</MenuItem>
              <MenuItem value={2}>Completed</MenuItem>
              <MenuItem value={3}>Dropped</MenuItem>
            </Select>
          </FormControl>

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
              sx={{
                backgroundColor: '#1c7ed6',
                '&:hover': {
                  backgroundColor: '#1976d2'
                }
              }}
            >
              Add Task
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Dialog>
  );
}

export default AddTask;

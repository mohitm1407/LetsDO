import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import NoteIcon from '@mui/icons-material/Note';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

interface Project {
  id: number;
  display_name: string;
  description: string;
  tasks: {
    id: number;
    title: string;
    description: string;
    due_date: string;
    status: string;
  }[];
}

function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : '1';
      
      const response = await axios.get(`http://0.0.0.0:8001/projects/${userId}`);
      setProjects(response.data.project_list || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = async () => {
    if (!selectedProject) return;
    
    try {
      await axios.put(`http://0.0.0.0:8001/projects/${selectedProject.id}`, {
        name: selectedProject.display_name,
        description: selectedProject.description
      });
      
      setEditModalOpen(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await axios.delete(`http://0.0.0.0:8001/projects/${projectId}`);
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#2e7d32';
      case 'in_progress':
        return '#9c27b0';
      case 'todo':
        return '#0288d1';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'in_progress':
        return <HourglassTopIcon />;
      case 'todo':
        return <ScheduleIcon />;
      default:
        return <CancelIcon />;
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-wrapper">
        <Box sx={{ backgroundColor: '#f5f7fa', p: 3, minHeight: '100vh' }}>
          <Container maxWidth="xl">
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 4 
            }}>
              <div>
                <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
                  Projects
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage your projects and track their progress
                </Typography>
              </div>
            </Box>

            {loading ? (
              <Typography>Loading projects...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : projects.length === 0 ? (
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
                  No projects found
                </Typography>
                <Typography color="text.secondary">
                  Create a new project to get started
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {projects.map((project) => (
                  <Grid item xs={12} md={6} lg={4} key={project.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                            {project.display_name}
                          </Typography>
                          <Box>
                            <Tooltip title="Edit Project">
                              <IconButton 
                                size="small"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setEditModalOpen(true);
                                }}
                                sx={{ 
                                  color: '#1976d2',
                                  '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Project">
                              <IconButton 
                                size="small"
                                onClick={() => handleDeleteProject(project.id)}
                                sx={{ 
                                  color: '#d32f2f',
                                  '&:hover': {
                                    backgroundColor: 'rgba(211, 47, 47, 0.08)'
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          {project.description}
                        </Typography>


                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Total Tasks: {project.tasks.length}
                          </Typography>
                          <Tooltip title="View Project Details">
                            <IconButton 
                              size="small"
                              onClick={() => navigate(`/projects/${project.id}`)}
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
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Edit Project Modal */}
            <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Project Name"
                  fullWidth
                  value={selectedProject?.display_name || ''}
                  onChange={(e) => setSelectedProject(prev => prev ? { ...prev, name: e.target.value } : null)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={selectedProject?.description || ''}
                  onChange={(e) => setSelectedProject(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleEditProject}
                  variant="contained"
                  disabled={!selectedProject?.display_name.trim()}
                >
                  Save Changes
                </Button>
              </DialogActions>
            </Dialog>
          </Container>
        </Box>
      </div>
    </div>
  );
}

export default ProjectsPage; 
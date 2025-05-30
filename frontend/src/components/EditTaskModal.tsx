import CloseIcon from '@mui/icons-material/Close';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
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
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: number;
  status: number;
  created_at: string;
  project_name: string;
  project_id: number;
  notes?: string;
  linked_meetings?: Array<{
    id: number;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  }>;
}

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onTaskUpdated: () => void;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

function EditTaskModal({ open, onClose, task, onTaskUpdated }: EditTaskModalProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 1, // Default to medium
    status: 0, // Default to todo
    notes: ''
  });
  const [errors, setErrors] = useState({
    title: '',
    description: ''
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projectError, setProjectError] = useState('');
  const [linkedMeetings, setLinkedMeetings] = useState<Array<{
    id: number;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  }>>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch projects when modal opens
  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        notes: task.notes || ''
      });
      setSelectedProject(task.project_id);
      setLinkedMeetings(task.linked_meetings || []);
    }
  }, [task]);

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
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchLinkedMeetings = async (taskId: number) => {
    try {
      const response = await axios.get(`http://0.0.0.0:8001/tasks/${taskId}/meetings/`);
      if (response.data) {
        setLinkedMeetings(response.data.map((meeting: any) => ({
          id: meeting.id,
          title: meeting.title,
          date: meeting.start_time.split('T')[0],
          startTime: meeting.start_time.split('T')[1].slice(0, 5),
          endTime: meeting.end_time.split('T')[1].slice(0, 5)
        })));
      }
    } catch (error) {
      console.error('Error fetching linked meetings:', error);
    }
  };

  // Fetch projects and linked meetings when modal opens
  useEffect(() => {
    if (open && task) {
      fetchProjects();
      fetchLinkedMeetings(task.id);
    }
  }, [open, task]);

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
    if (!validateForm() || !task) return;
    
    try {
      await axios.post(`http://0.0.0.0:8001/tasks/${task.id}/edit/`, {
        ...formData,
        project_id: selectedProject,
        notes: formData.notes
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab at cursor or at the beginning of each selected line
      if (start === end) {
        const newValue = formData.notes.substring(0, start) + '  ' + formData.notes.substring(end);
        setFormData({ ...formData, notes: newValue });
        // Set cursor position after the inserted tab
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      } else {
        // For selections, add tabs at the beginning of each line
        const selectedText = formData.notes.substring(start, end);
        const lines = selectedText.split('\n');
        const indentedText = lines.map(line => '  ' + line).join('\n');
        const newValue = formData.notes.substring(0, start) + indentedText + formData.notes.substring(end);
        setFormData({ ...formData, notes: newValue });
        
        // Adjust selection to include the new indentation
        setTimeout(() => {
          textarea.selectionStart = start;
          textarea.selectionEnd = start + indentedText.length;
        }, 0);
      }
    }
  };

  const formatText = (type: 'bold' | 'italic' | 'heading') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.notes.substring(start, end);
    
    let formattedText = '';
    let selectionStart = 0;
    let selectionEnd = 0;
    
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        selectionStart = selectedText ? start + 2 : start + 2;
        selectionEnd = selectedText ? end + 2 : start + 10;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        selectionStart = selectedText ? start + 1 : start + 1;
        selectionEnd = selectedText ? end + 1 : start + 11;
        break;
      case 'heading':
        formattedText = `\n## ${selectedText || 'Heading'}\n`;
        selectionStart = selectedText ? start + 4 : start + 4;
        selectionEnd = selectedText ? end + 4 : start + 10;
        break;
    }
    
    const newValue = formData.notes.substring(0, start) + formattedText + formData.notes.substring(end);
    setFormData({ ...formData, notes: newValue });
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = selectionStart;
      textarea.selectionEnd = selectionEnd;
    }, 0);
  };

  const insertCodeBlock = () => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.notes.substring(start, end);
    
    const codeBlock = `\`\`\`js\n${selectedText || 'Your code here'}\n\`\`\``;
    const newValue = formData.notes.substring(0, start) + codeBlock + formData.notes.substring(end);
    
    setFormData({ ...formData, notes: newValue });
    setTimeout(() => {
      textarea.focus();
      if (!selectedText) {
        textarea.selectionStart = start + 5;
        textarea.selectionEnd = start + 19;
      } else {
        textarea.selectionStart = start + codeBlock.length;
        textarea.selectionEnd = start + codeBlock.length;
      }
    }, 0);
  };

  const insertList = (type: 'ordered' | 'unordered') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.notes.substring(start, end);
    const lines = selectedText.split('\n');
    
    let formattedText = '';
    if (type === 'unordered') {
      formattedText = lines.map((line, idx) => `- ${line}`).join('\n');
    } else {
      formattedText = lines.map((line, idx) => `${idx + 1}. ${line}`).join('\n');
    }
    
    // If nothing was selected, insert placeholder
    if (!selectedText) {
      formattedText = type === 'unordered' ? 
        "- Item 1\n- Item 2\n- Item 3" : 
        "1. Item 1\n2. Item 2\n3. Item 3";
    }
    
    const newValue = formData.notes.substring(0, start) + formattedText + formData.notes.substring(end);
    setFormData({ ...formData, notes: newValue });
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
    }, 0);
  };

  const openNotesInNewWindow = () => {
    if (!task) return;
    
    const notesWindow = window.open('', '_blank');
    if (notesWindow) {
      notesWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Notes for ${task.title}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
              }
              pre {
                background-color: #f6f8fa;
                padding: 16px;
                border-radius: 6px;
                overflow-x: auto;
              }
              code {
                font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
                background-color: rgba(27, 31, 35, 0.05);
                padding: 0.2em 0.4em;
                border-radius: 3px;
              }
              h1, h2, h3, h4, h5, h6 {
                margin-top: 24px;
                margin-bottom: 16px;
                font-weight: 600;
                line-height: 1.25;
              }
              h1 { font-size: 2em; }
              h2 { font-size: 1.5em; }
              h3 { font-size: 1.25em; }
              ul, ol {
                padding-left: 2em;
              }
              blockquote {
                margin: 0;
                padding: 0 1em;
                color: #6a737d;
                border-left: 0.25em solid #dfe2e5;
              }
            </style>
          </head>
          <body>
            <h1>Notes for ${task.title}</h1>
            <div id="content"></div>
            <script src="https://unpkg.com/react-markdown@8.0.7/dist/index.umd.js"></script>
            <script src="https://unpkg.com/remark-gfm@3.0.1/dist/index.umd.js"></script>
            <script>
              const content = ${JSON.stringify(formData.notes)};
              const ReactMarkdown = window.ReactMarkdown;
              const remarkGfm = window.remarkGfm;
              
              const root = ReactDOM.createRoot(document.getElementById('content'));
              root.render(
                React.createElement(ReactMarkdown, {
                  remarkPlugins: [remarkGfm],
                  children: content
                })
              );
            </script>
          </body>
        </html>
      `);
    }
  };

  const handleOpenNotes = () => {
    if (!task) return;
    
    // Navigate to the notes page with task data
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Details" />
            <Tab label="Linked Meetings" />
          </Tabs>
        </Box>

        <Box sx={{ mt: 1 }}>
          {activeTab === 0 && (
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

              <Button
                variant="outlined"
                startIcon={<NoteAddIcon />}
                onClick={handleOpenNotes}
                sx={{ mt: 2 }}
              >
                Open Notes
              </Button>
            </Stack>
          )}

          {activeTab === 1 && (
            <Box>
              {linkedMeetings.length > 0 ? (
                <Stack spacing={2}>
                  {linkedMeetings.map((meeting) => (
                    <Box
                      key={meeting.id}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {meeting.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(meeting.date).toLocaleDateString()} • {meeting.startTime} - {meeting.endTime}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No meetings linked to this task
                </Typography>
              )}
            </Box>
          )}

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
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default EditTaskModal; 
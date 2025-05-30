import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
    Alert,
    Box,
    CircularProgress,
    Container,
    IconButton,
    Paper,
    Tooltip,
    Typography
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

interface Note {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

function TaskNotes() {
  const { taskId } = useParams<{ taskId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState('');

  useEffect(() => {
    const fetchTaskAndNotes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get task data from location state or fetch it
        const taskData = location.state?.task;
        if (taskData) {
          setTask(taskData);
        } else if (taskId) {
          const response = await axios.get(`http://0.0.0.0:8001/tasks/${taskId}`);
          setTask(response.data);
        }

        // Fetch notes
        if (taskId) {
          const notesResponse = await axios.get(`http://0.0.0.0:8001/tasks/${taskId}/notes/`);
          setNotes(notesResponse.data);
        }
      } catch (err) {
        setError('Failed to load task and notes');
        console.error('Error fetching task and notes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskAndNotes();
  }, [taskId, location.state]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Task not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Back">
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {task.title}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {task.description}
        </Typography>
      </Paper>

      {notes.map((note) => (
        <Paper key={note.id} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {new Date(note.created_at).toLocaleString()}
            </Typography>
            {note.updated_at !== note.created_at && (
              <Typography variant="caption" color="text.secondary">
                Edited {new Date(note.updated_at).toLocaleString()}
              </Typography>
            )}
          </Box>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({node, inline, className, children, ...props}: CodeProps) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {note.content}
          </ReactMarkdown>
        </Paper>
      ))}

      {notes.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No notes available for this task
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default TaskNotes; 
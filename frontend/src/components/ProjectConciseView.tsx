import AddIcon from '@mui/icons-material/Add';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Fab from '@mui/material/Fab';
import Typography from '@mui/material/Typography';
import { useState } from "react";
import AddTask from "./add_task";

interface ProjectListProps {
  project: {
    display_name: string;
    owner_username: string;
    id: number;
    description: string;
    tasks: {
        id: number;
        title: string;
        description: string;
        due_date: string;
        status: string;
    }[];
  };
}

function ProjectConciseView({project}: ProjectListProps) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ 
            position: 'relative',
            display: 'inline-block'
        }}>
        <Card sx={{ 
            maxWidth: 280,
            minWidth: 280,
            minHeight: 300,
            maxHeight: 300,
            margin: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'visible',
            '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
                '& .MuiTypography-h5': {
                    color: '#0284c7'
                },
                '&::before': {
                    opacity: 1,
                    transform: 'scale(1.05)'
                }
            },
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.05) 0%, rgba(2, 132, 199, 0.1) 100%)',
                opacity: 0,
                transition: 'all 0.3s ease-in-out',
                transform: 'scale(0.98)',
                zIndex: -1
            },
            '& .MuiTypography-h5': {
                fontSize: '1.3rem',
                fontWeight: 600,
                color: '#0f172a',
                marginBottom: 2,
                transition: 'color 0.3s ease-in-out'
            },
            '& .MuiTypography-body2': {
                fontSize: '0.875rem',
                color: '#334155',
                marginBottom: 1.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1
            }
        }} onClick={() => {
            console.log(project);
        }}>
      <CardContent sx={{ 
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        borderRadius: '24px'
      }}>
          <Typography gutterBottom variant="h5" component="div">
            {project.display_name}
          </Typography>
          <Typography variant="body2" sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            '& strong': { 
              color: '#0284c7',
              fontWeight: 600,
              marginBottom: '0.25rem',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }
          }}>
            <strong>Description</strong> 
            {project.description}
          </Typography>
          <Typography variant="body2" sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            '& strong': { 
              color: '#0284c7',
              fontWeight: 600,
              marginBottom: '0.25rem',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }
          }}>
            <strong>Owner</strong>
            {project.owner_username}
          </Typography>
          <Typography variant="body2" sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            marginBottom: 0,
            '& strong': { 
              color: '#0284c7',
              fontWeight: 600,
              marginBottom: '0.25rem',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }
          }}>
            <strong>Tasks</strong>
            {project.tasks.length}
          </Typography>
      </CardContent>
    </Card>
    <Fab 
        color="primary" 
        aria-label="add" 
        onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
        }}
        sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: '#0284c7',
            width: 48,
            height: 48,
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
            '&:hover': {
                backgroundColor: '#0369a1',
                transform: 'scale(1.05)',
                boxShadow: '0 6px 16px rgba(2, 132, 199, 0.4)'
            },
            transition: 'all 0.2s ease-in-out',
            zIndex: 1
        }}
    >
        <AddIcon />
    </Fab>
    <AddTask open={open} setOpen={setOpen} />
    </div>
    )
}   

export default ProjectConciseView;
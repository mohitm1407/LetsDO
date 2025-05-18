import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Calendar.css';
import { 
  Autocomplete, 
  Box, 
  Chip, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  Tab, 
  Tabs, 
  TextField, 
  Typography 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CancelIcon from '@mui/icons-material/Cancel';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import FlagIcon from '@mui/icons-material/Flag';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LinkTasksForm from './LinkTasksForm';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: number;
  status: number;
  project_name: string;
}

interface Meeting {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface CalendarProps {
  userId: number;
  onDrop?: (date: string, time: string) => void;
}

type CalendarView = 'month' | 'week' | 'year';

function Calendar({ userId, onDrop }: CalendarProps) {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>('week');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [taskTabValue, setTaskTabValue] = useState(0); // 0: Todo, 1: In Progress, 2: Completed
  const [showLinkTasks, setShowLinkTasks] = useState(false);
  const [meetingDetailTab, setMeetingDetailTab] = useState(0); // 0: Details, 1: Tasks
  
  // Initialize with today's date
  const today = new Date().toISOString().split('T')[0];
  
  const [newMeeting, setNewMeeting] = useState<Omit<Meeting, 'id'>>({
    title: '',
    date: today,
    startTime: '09:00',
    endTime: '10:00',
    description: ''
  });

  useEffect(() => {
    fetchMeetings();
    fetchTasks();
  }, [currentDate]);

  const fetchTasks = async () => {
    try {
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : '1';
      
      const response = await axios.get(`http://0.0.0.0:8001/tasks/${userId}`);
      const taskList = response.data.task_list || [];
      
      // Don't filter out completed and dropped tasks anymore
      setTasks(taskList);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchMeetings = () => {
    // Mock API call - replace with actual endpoint when available
    // Using mock data for now
    axios.get('http://0.0.0.0:8001/meetings/')
      .then(response => {
        // Convert API response format to frontend Meeting format
        console.log("MEETINGS" ,response.data)
        const formattedMeetings = response.data.map((meeting: any) => {
          // meeting.start_time and meeting.end_time are already in ISO format
          // so we can use them directly without converting
          const startDateTime = meeting.start_time;
          const endDateTime = meeting.end_time;
          
          return {
            id: meeting.id,
            title: meeting.title,
            date: startDateTime.split('T')[0],
            startTime: startDateTime.split('T')[1].slice(0,5),
            endTime: endDateTime.split('T')[1].slice(0,5),
            description: meeting.description
          };
        });
        setMeetings(formattedMeetings);
        console.log(formattedMeetings)
      })
      .catch(error => {
        console.error('Error fetching meetings:', error);
        setErrorMessage('Failed to fetch meetings');
      });
  };

  const handleAddMeeting = () => {
    // Clear any previous error messages
    setErrorMessage('');
    
    // Prepare the data for API call
    const meetingData = {
      title: newMeeting.title,
      description: newMeeting.description,
      // Format date and time strings for backend in ISO 8601 format
      start_time: `${newMeeting.date}T${newMeeting.startTime}:00Z`,
      end_time: `${newMeeting.date}T${newMeeting.endTime}:00Z`,
      tasks: selectedTasks.map(task => task.id), // Include the selected task IDs
    };
    
    // Make API call to create meeting with credentials
    axios.post('http://0.0.0.0:8001/meetings/create/', meetingData)
      .then(response => {
        console.log('Meeting created:', response.data);
        
        // Check if status code is 201 (Created)
        if (response.status === 201) {
          // Convert API response to frontend Meeting format
          const startDateTime = new Date(response.data.start_time);
          const endDateTime = new Date(response.data.end_time);
          
          const createdMeeting: Meeting = {
            id: response.data.id,
            title: response.data.title,
            date: startDateTime.toISOString().split('T')[0],
            startTime: startDateTime.toTimeString().substring(0, 5),
            endTime: endDateTime.toTimeString().substring(0, 5),
            description: response.data.description
          };
          
          // Add the new meeting to the meetings list
          setMeetings([...meetings, createdMeeting]);
          
          // Reset form and close modal
          setShowAddMeeting(false);
          setNewMeeting({
            title: '',
            date: today,
            startTime: '09:00',
            endTime: '10:00',
            description: ''
          });
          setSelectedTasks([]);
        } else {
          // Handle unexpected success status codes
          setErrorMessage(`Unexpected response: ${response.status}`);
        }
      })
      .catch(error => {
        console.error('Error creating meeting:', error);
        
        // Handle different error responses
        if (error.response) {
          // The server responded with an error status code
          if (error.response.status === 401) {
            setErrorMessage('Authentication failed. Please log in again.');
          } else if (error.response.data && error.response.data.error) {
            setErrorMessage(error.response.data.error);
          } else {
            setErrorMessage(`Error (${error.response.status}): Unable to create meeting.`);
          }
        } else if (error.request) {
          // The request was made but no response was received
          setErrorMessage('Server did not respond. Please try again later.');
        } else {
          // Something happened in setting up the request
          setErrorMessage(`Error: ${error.message}`);
        }
      });
  };

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingDetails(true);
  };

  const navigateToNotes = () => {
    if (selectedMeeting) {
      // Get user data from localStorage for authentication
      // Make API call to get meeting notes
      console.log(selectedMeeting)
      axios.get(`http://0.0.0.0:8001/meetings/${selectedMeeting.id}/note/`)
        .then(response => {
          console.log('Meeting note data:', response.data);
          
          // Navigate to meeting notes page with both meeting and note data
          navigate(`/meeting-notes/${selectedMeeting.id}`, { 
            state: { 
              meeting: selectedMeeting,
              noteData: {
                content: response.data.content,
                lastUpdated: response.data.updated_at
              }
            } 
          });
        })
        .catch(error => {
          console.error('Error fetching meeting notes:', error);
          
          // Even if there's an error, still navigate to the notes page
          // The notes page can handle creating a new note if none exists
          navigate(`/meeting-notes/${selectedMeeting.id}`, { 
            state: { 
              meeting: selectedMeeting
            } 
          });
        });
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Add drag feedback handlers
  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    // Add visual feedback
    e.currentTarget.classList.add('drag-over');
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>, dateString: string, hour?: number) => {
    e.preventDefault();
    
    // Remove the visual feedback
    e.currentTarget.classList.remove('drag-over');
    
    // Default to 9 AM if no hour is provided
    const timeString = hour !== undefined 
      ? `${hour.toString().padStart(2, '0')}:00` 
      : '09:00';
    
    if (onDrop) {
      onDrop(dateString, timeString);
    }
  };

  const generateMonthlyCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const calendar = [];
    let day = 1;
    
    // Create weeks
    for (let i = 0; i < 6; i++) {
      const week = [];
      
      // Create days in a week
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < firstDayOfMonth) || day > daysInMonth) {
          week.push(<td key={`empty-${i}-${j}`} className="empty-day"></td>);
        } else {
          const currentDay = day;
          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
          const dayMeetings = meetings.filter(meeting => meeting.date === dateString);
          
          week.push(
            <td 
              key={`day-${day}`} 
              className="calendar-day"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, dateString)}
            >
              <div className="day-number">{day}</div>
              <div className="day-meetings">
                {dayMeetings.map(meeting => (
                  <div 
                    key={meeting.id} 
                    className="meeting-item"
                    onClick={() => handleMeetingClick(meeting)}
                  >
                    <div className="meeting-time">{meeting.startTime} - {meeting.endTime}</div>
                    <div className="meeting-title">{meeting.title}</div>
                  </div>
                ))}
              </div>
            </td>
          );
          day++;
        }
      }
      
      calendar.push(<tr key={`week-${i}`}>{week}</tr>);
      
      if (day > daysInMonth) {
        break;
      }
    }
    
    return calendar;
  };

  const generateWeeklyCalendar = () => {
    const now = new Date(currentDate);
    const day = now.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Set to the first day of the week (Sunday)
    now.setDate(now.getDate() - day);
    
    const week = [];
    
    // Create 7 days (1 week)
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(now);
      currentDay.setDate(now.getDate() + i);
      
      const dateString = currentDay.toISOString().split('T')[0];
      const dayMeetings = meetings.filter(meeting => meeting.date === dateString);
      const isToday = dateString === new Date().toISOString().split('T')[0];
      
      // Create hourly slots for better drag and drop support
      const hourlySlots = [];
      for (let hour = 7; hour < 20; hour++) {
        const hourStr = hour.toString().padStart(2, '0');
        const timeStr = `${hourStr}:00`;
        const meetingsAtHour = dayMeetings.filter(m => m.startTime.startsWith(hourStr));
        
        hourlySlots.push(
          <div 
            key={`hour-${hour}`} 
            className="hourly-slot"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, dateString, hour)}
          >
            <div className="hour-label">{hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}</div>
            {meetingsAtHour.map(meeting => (
              <div 
                key={meeting.id} 
                className="meeting-item weekly-meeting-item"
                onClick={() => handleMeetingClick(meeting)}
              >
                <div className="meeting-time">{meeting.startTime} - {meeting.endTime}</div>
                <div className="meeting-title">{meeting.title}</div>
              </div>
            ))}
          </div>
        );
      }

      week.push(
        <div 
          key={`day-${i}`} 
          className={`weekly-day ${isToday ? 'today' : ''}`}
        >
          <div className="weekly-day-header">
            <div className="weekly-day-name">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</div>
            <div className="weekly-day-number">{currentDay.getDate()}</div>
          </div>
          <div className="weekly-meetings">
            {hourlySlots}
          </div>
        </div>
      );
    }
    
    return <div className="weekly-calendar">{week}</div>;
  };

  const generateYearlyCalendar = () => {
    const year = currentDate.getFullYear();
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const monthName = monthNames[month].substring(0, 3);
      const daysInMonth = getDaysInMonth(year, month);
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      
      // Create a table for each month
      const monthTable = (
        <div key={`month-${month}`} className="yearly-month">
          <div className="yearly-month-name">{monthName}</div>
          <table className="yearly-month-table">
            <thead>
              <tr>
                <th>S</th>
                <th>M</th>
                <th>T</th>
                <th>W</th>
                <th>T</th>
                <th>F</th>
                <th>S</th>
              </tr>
            </thead>
            <tbody>
              {generateMonthTable(year, month, daysInMonth, firstDayOfMonth)}
            </tbody>
          </table>
        </div>
      );
      
      months.push(monthTable);
    }
    
    return <div className="yearly-calendar">{months}</div>;
  };
  
  const generateMonthTable = (year: number, month: number, daysInMonth: number, firstDayOfMonth: number) => {
    const days = [];
    let day = 1;
    
    // Create mini calendar for each month
    for (let i = 0; i < 6; i++) {
      const week = [];
      
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < firstDayOfMonth) || day > daysInMonth) {
          week.push(<td key={`empty-${month}-${i}-${j}`} className="yearly-empty-day"></td>);
        } else {
          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasMeetings = meetings.some(meeting => meeting.date === dateString);
          const isToday = dateString === new Date().toISOString().split('T')[0];
          
          week.push(
            <td 
              key={`day-${month}-${day}`} 
              className={`yearly-day ${hasMeetings ? 'has-meetings' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => handleYearlyDayClick(dateString)}
            >
              {day}
            </td>
          );
          day++;
        }
      }
      
      days.push(<tr key={`week-${month}-${i}`}>{week}</tr>);
      
      if (day > daysInMonth && i < 5) {
        // Add empty row to maintain consistent height
        days.push(<tr key={`empty-week-${month}-${i}`} className="empty-week"><td colSpan={7}></td></tr>);
        break;
      }
    }
    
    return days;
  };
  
  const handleYearlyDayClick = (dateString: string) => {
    // Set the current date to the clicked date and switch to month view
    setCurrentDate(new Date(dateString));
    setCalendarView('month');
  };

  const handleViewChange = (view: CalendarView) => {
    setCalendarView(view);
  };

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (7 * direction));
    } else if (calendarView === 'year') {
      newDate.setFullYear(newDate.getFullYear() + direction);
    }
    
    setCurrentDate(newDate);
  };

  const getHeaderText = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (calendarView === 'month') {
      return `${monthNames[month]} ${year}`;
    } else if (calendarView === 'week') {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - day);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      const startMonth = startOfWeek.getMonth();
      const endMonth = endOfWeek.getMonth();
      const startYear = startOfWeek.getFullYear();
      const endYear = endOfWeek.getFullYear();
      
      if (startMonth === endMonth && startYear === endYear) {
        return `${monthNames[startMonth]} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${startYear}`;
      } else if (startYear === endYear) {
        return `${monthNames[startMonth]} ${startOfWeek.getDate()} - ${monthNames[endMonth]} ${endOfWeek.getDate()}, ${startYear}`;
      } else {
        return `${monthNames[startMonth]} ${startOfWeek.getDate()}, ${startYear} - ${monthNames[endMonth]} ${endOfWeek.getDate()}, ${endYear}`;
      }
    } else {
      return `${year}`;
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderCalendarContent = () => {
    switch (calendarView) {
      case 'month':
        return (
          <table className="calendar-table">
            <thead>
              <tr>
                <th>Sun</th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
                <th>Thu</th>
                <th>Fri</th>
                <th>Sat</th>
              </tr>
            </thead>
            <tbody>
              {generateMonthlyCalendar()}
            </tbody>
          </table>
        );
      case 'week':
        return generateWeeklyCalendar();
      case 'year':
        return generateYearlyCalendar();
      default:
        return null;
    }
  };

  const handleTaskTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTaskTabValue(newValue);
  };

  const getTaskStatusDetails = (status: number) => {
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

  const getTaskPriorityDetails = (priority: number) => {
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

  const filteredTasksByStatus = (status: number) => {
    return tasks.filter(task => 
      task.status === status && 
      (task.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) || 
       task.description.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
       task.project_name.toLowerCase().includes(taskSearchQuery.toLowerCase()))
    );
  };

  const isTaskSelected = (taskId: number) => {
    return selectedTasks.some(task => task.id === taskId);
  };

  const handleAddTaskToMeeting = (task: Task) => {
    if (isTaskSelected(task.id)) {
      setSelectedTasks(selectedTasks.filter(t => t.id !== task.id));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const renderTaskSelector = () => {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search tasks..."
            value={taskSearchQuery}
            onChange={(e) => setTaskSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
          <Tabs value={taskTabValue} onChange={handleTaskTabChange} aria-label="task status tabs">
            <Tab 
              label="To Do" 
              icon={<ScheduleIcon fontSize="small" />} 
              iconPosition="start"
              sx={{ minHeight: '48px', textTransform: 'none' }}
            />
            <Tab 
              label="In Progress" 
              icon={<HourglassTopIcon fontSize="small" />} 
              iconPosition="start"
              sx={{ minHeight: '48px', textTransform: 'none' }}
            />
            <Tab 
              label="Completed" 
              icon={<CheckCircleIcon fontSize="small" />} 
              iconPosition="start"
              sx={{ minHeight: '48px', textTransform: 'none' }}
            />
          </Tabs>
        </Box>
        
        {taskTabValue === 0 && (
          <TaskList 
            tasks={filteredTasksByStatus(0)} 
            onTaskClick={handleAddTaskToMeeting}
            selectedTaskIds={selectedTasks.map(t => t.id)}
          />
        )}
        
        {taskTabValue === 1 && (
          <TaskList 
            tasks={filteredTasksByStatus(1)} 
            onTaskClick={handleAddTaskToMeeting}
            selectedTaskIds={selectedTasks.map(t => t.id)}
          />
        )}
        
        {taskTabValue === 2 && (
          <TaskList 
            tasks={filteredTasksByStatus(2)} 
            onTaskClick={handleAddTaskToMeeting}
            selectedTaskIds={selectedTasks.map(t => t.id)}
          />
        )}
      </Box>
    );
  };

  const renderSelectedTasks = () => {
    if (selectedTasks.length === 0) {
      return (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mt: 2, 
            backgroundColor: '#f5f5f5',
            borderStyle: 'dashed',
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          <Typography variant="body2">No tasks linked to this meeting</Typography>
        </Paper>
      );
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Linked Tasks ({selectedTasks.length})
        </Typography>
        <Paper variant="outlined" sx={{ p: 1 }}>
          <List dense disablePadding>
            {selectedTasks.map(task => {
              const priorityDetails = getTaskPriorityDetails(task.priority);
              return (
                <ListItem 
                  key={task.id}
                  secondaryAction={
                    <Chip 
                      label="Remove"
                      size="small"
                      color="default"
                      onClick={() => setSelectedTasks(selectedTasks.filter(t => t.id !== task.id))}
                      sx={{ cursor: 'pointer' }}
                    />
                  }
                  sx={{ 
                    borderLeft: `4px solid ${priorityDetails.color}`,
                    mb: 1,
                    backgroundColor: 'white',
                    borderRadius: 1,
                  }}
                >
                  <ListItemText 
                    primary={task.title}
                    secondary={task.project_name}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Box>
    );
  };

  const handleLinkTasksSuccess = () => {
    // Don't close the modal, just refresh meeting data and switch back to details tab
    fetchMeetings();
  };

  // Add a handler for meeting detail tab changes
  const handleMeetingDetailTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setMeetingDetailTab(newValue);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Calendar</h2>
        
        <div className="calendar-controls">
          <button className="control-btn" onClick={() => navigateDate(-1)}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <h3>{getHeaderText()}</h3>
          <button className="control-btn" onClick={() => navigateDate(1)}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <button 
          className="add-meeting-btn"
          onClick={() => setShowAddMeeting(true)}
        >
          <i className="fas fa-plus mr-2"></i> New Meeting
        </button>
      </div>

      <div className="view-selector">
        <button 
          className={`view-btn ${calendarView === 'month' ? 'active' : ''}`}
          onClick={() => handleViewChange('month')}
        >
          Month
        </button>
        <button 
          className={`view-btn ${calendarView === 'week' ? 'active' : ''}`}
          onClick={() => handleViewChange('week')}
        >
          Week
        </button>
        <button 
          className={`view-btn ${calendarView === 'year' ? 'active' : ''}`}
          onClick={() => handleViewChange('year')}
        >
          Year
        </button>
      </div>

      <div className="calendar-body">
        {renderCalendarContent()}
      </div>

      {showAddMeeting && (
        <div className="modal-overlay" onClick={() => setShowAddMeeting(false)}>
          <div className="add-meeting-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Meeting</h3>
            
            {/* Add error message display at the top of the form */}
            {errorMessage && (
              <div className="error-message" style={{
                backgroundColor: '#ffebee',
                color: '#d32f2f',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '15px',
                fontSize: '14px',
                fontWeight: 500
              }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddMeeting(); }}>
              <div className="form-group">
                <label htmlFor="meeting-title">Title</label>
                <input 
                  id="meeting-title"
                  type="text" 
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                  placeholder="Meeting title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="meeting-date">Date</label>
                <input 
                  id="meeting-date"
                  type="date" 
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start-time">Start Time</label>
                  <input 
                    id="start-time"
                    type="time" 
                    value={newMeeting.startTime}
                    onChange={(e) => setNewMeeting({...newMeeting, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="end-time">End Time</label>
                  <input 
                    id="end-time"
                    type="time" 
                    value={newMeeting.endTime}
                    onChange={(e) => setNewMeeting({...newMeeting, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="meeting-description">Description</label>
                <textarea 
                  id="meeting-description"
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                  placeholder="Meeting details (optional)"
                ></textarea>
              </div>
              
              {/* Task selection */}
              <div className="form-group task-selection-container">
                <label>Link Tasks</label>
                {renderTaskSelector()}
                {renderSelectedTasks()}
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddMeeting(false)}>Cancel</button>
                <button type="submit">Save Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMeetingDetails && selectedMeeting && (
        <div className="modal-overlay" onClick={() => setShowMeetingDetails(false)}>
          <div className="meeting-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedMeeting.title}</h3>
              <button className="close-icon" onClick={() => setShowMeetingDetails(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="meeting-tabs">
              <Tabs 
                value={meetingDetailTab} 
                onChange={handleMeetingDetailTabChange}
                variant="fullWidth"
                className="meeting-detail-tabs"
              >
                <Tab icon={<InfoIcon />} label="Details" />
                <Tab icon={<AssignmentIcon />} label="Tasks" />
              </Tabs>
            </div>
            
            {meetingDetailTab === 0 && (
              <div className="meeting-details-content">
                <div className="meeting-detail-item">
                  <i className="fas fa-calendar-day detail-icon"></i>
                  <span>{formatDate(selectedMeeting.date)}</span>
                </div>
                
                <div className="meeting-detail-item">
                  <i className="fas fa-clock detail-icon"></i>
                  <span>{selectedMeeting.startTime} - {selectedMeeting.endTime}</span>
                </div>
                
                {selectedMeeting.description && (
                  <div className="meeting-description-box">
                    <h4>Description</h4>
                    <p>{selectedMeeting.description}</p>
                  </div>
                )}
                
                <div className="meeting-actions">
                  <button className="take-notes-btn" onClick={navigateToNotes}>
                    <i className="fas fa-edit mr-2"></i> Take Notes
                  </button>
                  <button className="close-btn" onClick={() => setShowMeetingDetails(false)}>
                    Close
                  </button>
                </div>
              </div>
            )}
            
            {meetingDetailTab === 1 && (
              <div className="meeting-tasks-content">
                <LinkTasksForm 
                  meetingId={selectedMeeting.id} 
                  onTasksLinked={handleLinkTasksSuccess} 
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get priority color
function getPriorityColor(priority: number): string {
  switch (priority) {
    case 0: return '#d32f2f'; // High - red
    case 1: return '#ed6c02'; // Medium - orange
    case 2: return '#2e7d32'; // Low - green
    default: return '#757575'; // Default - gray
  }
}

// TaskList component for showing tasks
interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  selectedTaskIds: number[];
}

function TaskList({ tasks, onTaskClick, selectedTaskIds }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary" variant="body2">
          No tasks found
        </Typography>
      </Box>
    );
  }
  
  // Group tasks by project
  const tasksByProject: { [key: string]: Task[] } = {};
  tasks.forEach(task => {
    if (!tasksByProject[task.project_name]) {
      tasksByProject[task.project_name] = [];
    }
    tasksByProject[task.project_name].push(task);
  });
  
  return (
    <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
      {Object.entries(tasksByProject).map(([projectName, projectTasks]) => (
        <Box key={projectName} sx={{ mb: 2 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              bgcolor: '#f5f5f5', 
              py: 0.5, 
              px: 1, 
              borderRadius: 1,
              mb: 1
            }}
          >
            {projectName}
          </Typography>
          
          <List dense disablePadding>
            {projectTasks.map(task => {
              const isSelected = selectedTaskIds.includes(task.id);
              const priorityDetails = getPriorityColor(task.priority);
              
              return (
                <ListItem 
                  key={task.id}
                  sx={{ 
                    cursor: 'pointer',
                    borderLeft: `4px solid ${priorityDetails}`,
                    borderRadius: 1,
                    mb: 0.5,
                    backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'white',
                    '&:hover': {
                      backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                    },
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => onTaskClick(task)}
                >
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {task.title}
                        {isSelected && (
                          <CheckCircleIcon 
                            fontSize="small" 
                            color="primary" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={task.description.substring(0, 60) + (task.description.length > 60 ? '...' : '')}
                    primaryTypographyProps={{ fontWeight: isSelected ? 'bold' : 'medium' }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      ))}
    </Box>
  );
}

export default Calendar; 
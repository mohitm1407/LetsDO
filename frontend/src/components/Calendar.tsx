import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Calendar.css';

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
}

type CalendarView = 'month' | 'week' | 'year';

function Calendar({ userId }: CalendarProps) {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  
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
  }, [currentDate]);

  const fetchMeetings = () => {
    // Mock API call - replace with actual endpoint when available
    // Using mock data for now
    setMeetings([
      {
        id: 1,
        title: 'Team Standup',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '09:30',
        description: 'Daily team standup meeting'
      },
      {
        id: 2,
        title: 'Project Review',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:00',
        description: 'Quarterly project review with stakeholders'
      }
    ]);
  };

  const handleAddMeeting = () => {
    // Mock implementation for now
    const mockMeeting = {
      id: meetings.length + 1,
      ...newMeeting
    };
    
    setMeetings([...meetings, mockMeeting]);
    setShowAddMeeting(false);
    setNewMeeting({
      title: '',
      date: today,
      startTime: '09:00',
      endTime: '10:00',
      description: ''
    });
  };

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingDetails(true);
  };

  const navigateToNotes = () => {
    if (selectedMeeting) {
      // Navigate to the notes page with meeting details as state/params
      navigate(`/meeting-notes/${selectedMeeting.id}`, { 
        state: { 
          meeting: selectedMeeting 
        } 
      });
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
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
            <td key={`day-${day}`} className="calendar-day">
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
      
      week.push(
        <div key={`day-${i}`} className={`weekly-day ${isToday ? 'today' : ''}`}>
          <div className="weekly-day-header">
            <div className="weekly-day-name">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</div>
            <div className="weekly-day-number">{currentDay.getDate()}</div>
          </div>
          <div className="weekly-meetings">
            {dayMeetings.length === 0 ? (
              <div className="no-meetings">No meetings</div>
            ) : (
              dayMeetings.map(meeting => (
                <div 
                  key={meeting.id} 
                  className="meeting-item weekly-meeting-item"
                  onClick={() => handleMeetingClick(meeting)}
                >
                  <div className="meeting-time">{meeting.startTime} - {meeting.endTime}</div>
                  <div className="meeting-title">{meeting.title}</div>
                </div>
              ))
            )}
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
            <h3>{selectedMeeting.title}</h3>
            
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
        </div>
      )}
    </div>
  );
}

export default Calendar; 
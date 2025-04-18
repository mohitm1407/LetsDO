import '@fortawesome/fontawesome-free/css/all.min.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import './calendar.css';

function CalendarPage() {
  const navigate = useNavigate();
  const [isMinimized, setIsMinimized] = useState(false);
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="layout">
      <nav className={`sidebar ${isMinimized ? 'minimized' : ''}`}>
        <div className="sidebar-header">
          <h2>{!isMinimized && 'Menu'}</h2>
          <button 
            className="toggle-btn"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <i className={`fas ${isMinimized ? 'fa-angle-right' : 'fa-angle-left'} fa-lg`}></i>
          </button>
        </div>
        <ul className="nav-links">
          <li className="nav-item" onClick={() => handleNavigation('/')}>
            <i className="fas fa-home"></i>
            {!isMinimized && <span>Dashboard</span>}
          </li>
          <li className="nav-item">
            <i className="fas fa-tasks"></i>
            {!isMinimized && <span>Projects</span>}
          </li>
          <li className="nav-item active">
            <i className="fas fa-calendar"></i>
            {!isMinimized && <span>Calendar</span>}
          </li>
          <li className="nav-item">
            <i className="fas fa-chart-bar"></i>
            {!isMinimized && <span>Analytics</span>}
          </li>
          <li className="nav-item">
            <i className="fas fa-cog"></i>
            {!isMinimized && <span>Settings</span>}
          </li>
        </ul>
      </nav>

      <div className="main-wrapper">
        <header className="calendar-page-header">
          <h1>My Calendar</h1>
        </header>

        <main className="main-content">
          <Calendar userId={1} />
        </main>
      </div>
    </div>
  );
}

export default CalendarPage; 
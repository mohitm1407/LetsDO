import '@fortawesome/fontawesome-free/css/all.min.css';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  className?: string;
}

function Sidebar({ className = '' }: SidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Determine active route based on current location
  const isActive = (path: string) => {
    if (path === '/home' && location.pathname === '/home') {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <nav className={`sidebar ${isMinimized ? 'minimized' : ''} ${className}`}>
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
        <li 
          className={`nav-item ${isActive('/home') ? 'active' : ''}`}
          onClick={() => handleNavigation('/home')}
        >
          <i className="fas fa-home"></i>
          {!isMinimized && <span>Dashboard</span>}
        </li>
        <li
          className={`nav-item ${isActive('/projects') ? 'active' : ''}`}
          onClick={() => handleNavigation('/home')}
        >
          <i className="fas fa-tasks"></i>
          {!isMinimized && <span>Projects</span>}
        </li>
        <li 
          className={`nav-item ${isActive('/tasks') ? 'active' : ''}`}
          onClick={() => handleNavigation('/tasks')}
        >
          <i className="fas fa-check-circle"></i>
          {!isMinimized && <span>Tasks</span>}
        </li>
        <li 
          className={`nav-item ${isActive('/calendar') ? 'active' : ''}`}
          onClick={() => handleNavigation('/calendar')}
        >
          <i className="fas fa-calendar"></i>
          {!isMinimized && <span>Calendar</span>}
        </li>
        {/* <li 
          className={`nav-item ${isActive('/analytics') ? 'active' : ''}`}
          onClick={() => handleNavigation('/analytics')}
        >
          <i className="fas fa-chart-bar"></i>
          {!isMinimized && <span>Analytics</span>}
        </li>
        <li 
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
          onClick={() => handleNavigation('/settings')}
        >
          <i className="fas fa-cog"></i>
          {!isMinimized && <span>Settings</span>}
        </li> */}
      </ul>
    </nav>
  );
}

export default Sidebar; 
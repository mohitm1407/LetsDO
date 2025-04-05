import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import AddProject from "../components/AddProject";
import ProjectList from "../components/projectList";
import './home.css'; // We'll create this file separately

function HomePage() {
  const [projectList, setProjectList] = useState([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  
  const fetchProjects = () => {
    axios
      .get('http://0.0.0.0:8001/projects/1')
      .then(response => {
        console.log(response.data)
        setProjectList(response.data.project_list)
      })
      .catch(error => {
        if (error.response) {
          console.error('Error response:', error.response)
        } else if (error.request) {
          console.error('Error request:', error.request)
        } else {
          console.error('Error message:', error.message)
        }
      })
  }

  useEffect(() => {
    fetchProjects()
  }, [])

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
          <li className="nav-item active">
            <i className="fas fa-home"></i>
            {!isMinimized && <span>Dashboard</span>}
          </li>
          <li className="nav-item">
            <i className="fas fa-tasks"></i>
            {!isMinimized && <span>Projects</span>}
          </li>
          <li className="nav-item">
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
        <header className="home-header">
          <h1>My Projects</h1>
          <button 
            className="add-project-btn"
            onClick={() => setIsAddProjectOpen(true)}
          >
            + New Project
          </button>
        </header>

        <main className="main-content">
          <ProjectList projectList={projectList} />
        </main>
      </div>

      <AddProject 
        open={isAddProjectOpen}
        setOpen={setIsAddProjectOpen}
        onProjectAdded={fetchProjects}
      />
    </div>
  )
}

export default HomePage

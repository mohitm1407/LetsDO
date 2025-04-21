import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import AddProject from "../components/AddProject";
import Sidebar from '../components/Sidebar';
import ProjectList from "../components/projectList";
import './home.css'; // We'll create this file separately

function HomePage() {
  const [projectList, setProjectList] = useState([])
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
      <Sidebar />
      
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

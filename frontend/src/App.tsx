import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import CalendarPage from './pages/calendar';
import DashboardPage from './pages/dashboard';
import Login from './pages/login';
import MeetingNotes from './pages/MeetingNotes';
import ProjectsPage from './pages/projects';
import TaskNotes from './pages/TaskNotes';
import TasksPage from './pages/tasks';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/home' element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path='/calendar' element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          } />
          <Route path='/projects' element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          } />
          <Route path='/meeting-notes/:meetingId' element={
            <ProtectedRoute>
              <MeetingNotes />
            </ProtectedRoute>
          } />
          <Route path='/task-notes/:taskId' element={
            <ProtectedRoute>
              <TaskNotes />
            </ProtectedRoute>
          } />
          <Route path='/tasks' element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App;

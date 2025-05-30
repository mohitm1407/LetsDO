import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import CalendarPage from './pages/calendar';
import HomePage from './pages/home';
import Login from './pages/login';
import MeetingNotes from './pages/MeetingNotes';
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
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path='/calendar' element={
            <ProtectedRoute>
              <CalendarPage />
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

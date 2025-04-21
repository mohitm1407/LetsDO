import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/home';
import Login from './pages/login';
import CalendarPage from './pages/calendar';
import MeetingNotes from './pages/MeetingNotes';
import TasksPage from './pages/tasks';

function App() {
  return (
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/home' element={<HomePage />} />
          <Route path='/calendar' element={<CalendarPage />} />
          <Route path='/meeting-notes/:meetingId' element={<MeetingNotes />} />
          <Route path='/tasks' element={<TasksPage />} />
        </Routes>
      </Router>
  )
}

export default App

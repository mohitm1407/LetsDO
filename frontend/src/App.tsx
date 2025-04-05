import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/home';
import Login from './pages/login';

function App() {
  return (
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<HomePage />} />
        </Routes>
      </Router>
  )
}

export default App

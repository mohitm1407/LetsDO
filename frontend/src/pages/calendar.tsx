import '@fortawesome/fontawesome-free/css/all.min.css';
import Calendar from '../components/Calendar';
import Sidebar from '../components/Sidebar';
import './calendar.css';
import './home.css';

function CalendarPage() {
  return (
    <div className="layout">
      <Sidebar />

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
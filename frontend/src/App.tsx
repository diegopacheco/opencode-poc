import { useState } from 'react';
import { AppProvider } from './context';
import AddTeamMember from './pages/AddTeamMember';
import CreateTeam from './pages/CreateTeam';
import AssignToTeam from './pages/AssignToTeam';
import GiveFeedback from './pages/GiveFeedback';
import ListFeedback from './pages/ListFeedback';
import './App.css';

type Page = 'add-member' | 'create-team' | 'assign-team' | 'give-feedback' | 'list-feedback';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('add-member');

  const renderPage = () => {
    switch (currentPage) {
      case 'add-member':
        return <AddTeamMember />;
      case 'create-team':
        return <CreateTeam />;
      case 'assign-team':
        return <AssignToTeam />;
      case 'give-feedback':
        return <GiveFeedback />;
      case 'list-feedback':
        return <ListFeedback />;
      default:
        return <AddTeamMember />;
    }
  };

  return (
    <AppProvider>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <img src="/logo-app.png" alt="Coaching App Logo" className="app-logo" />
            <h1 className="app-title">Coaching App</h1>
          </div>
          <div className="nav-links">
            <button
              className={`nav-button ${currentPage === 'add-member' ? 'active' : ''}`}
              onClick={() => setCurrentPage('add-member')}
            >
              Add Team Member
            </button>
            <button
              className={`nav-button ${currentPage === 'create-team' ? 'active' : ''}`}
              onClick={() => setCurrentPage('create-team')}
            >
              Create Team
            </button>
            <button
              className={`nav-button ${currentPage === 'assign-team' ? 'active' : ''}`}
              onClick={() => setCurrentPage('assign-team')}
            >
              Assign to Team
            </button>
            <button
              className={`nav-button ${currentPage === 'give-feedback' ? 'active' : ''}`}
              onClick={() => setCurrentPage('give-feedback')}
            >
              Give Feedback
            </button>
            <button
              className={`nav-button ${currentPage === 'list-feedback' ? 'active' : ''}`}
              onClick={() => setCurrentPage('list-feedback')}
            >
              List Feedback
            </button>
          </div>
        </nav>
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </AppProvider>
  );
}

export default App;

import React, { useState } from 'react';
import ProjectsGrid from './components/ProjectsGrid';
import ReadMe from './components/ReadMe';
import Dashboard from './components/Dashboard';
import './App.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'readme' | 'dashboard'>('projects');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">MetriCode</h1>
        <nav className="app-nav">
          <button
            className={`nav-button ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projekty
          </button>
          <button
            className={`nav-button ${activeTab === 'readme' ? 'active' : ''}`}
            onClick={() => setActiveTab('readme')}
          >
            Instrukcja
          </button>
          <button
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'projects' && <ProjectsGrid />}
        {activeTab === 'readme' && <ReadMe />}
        {activeTab === 'dashboard' && <Dashboard />}
      </main>
    </div>
  );
};

export default App;
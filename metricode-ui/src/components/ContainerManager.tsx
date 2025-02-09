import React, { useState } from 'react';
import './ContainerManager.css';

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

interface ContainerManagerProps {
  id: string;
  projectName: string;
  runtime: string;
  onProjectDeleted: (id: string) => void;

  // Blokada testów
  isAnyRunning: boolean;
  onTestStart: (projectId: string) => void;
  onTestEnd: (projectId: string) => void;
}

const ContainerManager: React.FC<ContainerManagerProps> = ({
  id,
  projectName,
  runtime,
  onProjectDeleted,
  isAnyRunning,
  onTestStart,
  onTestEnd
}) => {
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTest = async () => {
    // Blokujemy, jeśli inny test trwa
    if (isAnyRunning && !isRunning) return;

    setIsRunning(true);
    onTestStart(id);

    try {
      const response = await fetch(`${apiBaseUrl}/api/containermanager/run-container`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        alert(`Błąd podczas uruchamiania testu. "${response.statusText}"`);
        throw new Error('Błąd podczas uruchamiania testu.');
      }

      alert('Test zakończony pomyślnie!');
    } catch (error) {
      alert('Błąd podczas uruchamiania testu.');
      console.error(error);
    } finally {
      setIsRunning(false);
      onTestEnd(id);
    }
  };

  const handleDeleteProject = async () => {
    const confirmDelete = window.confirm(`Czy na pewno chcesz usunąć projekt "${projectName}"?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/filemanager/delete/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onProjectDeleted(id);
        alert(`Projekt "${projectName}" został usunięty.`);
      } else {
        alert(`Błąd podczas usuwania projektu. "${response.statusText}"`);
      }
    } catch (error) {
      alert('Wystąpił błąd podczas usuwania projektu.');
      console.error(error);
    }
  };

  const runButtonLabel = isRunning ? 'Test w trakcie...' : 'Uruchom test';

  // Przyciski są zablokowane, jeśli inny test trwa i to nie jest TEN projekt
  const runDisabled = isAnyRunning && !isRunning;

  return (
    <div className="container-manager-container">
      <div className="info-section">
        <h2 className="project-name">{projectName}</h2>
        <p><strong>Runtime:</strong> {runtime}</p>
      </div>
      <div className="button-group">
        <button
          className="primary-button"
          onClick={handleRunTest}
          disabled={runDisabled}
        >
          {runButtonLabel}
        </button>
        <button className="delete-button" onClick={handleDeleteProject}>
          Usuń projekt
        </button>
      </div>
    </div>
  );
};

export default ContainerManager;
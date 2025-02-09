import React, { useEffect, useState } from 'react';
import FileUpload from './FileUpload';
import ContainerManager from './ContainerManager';
import './ProjectsGrid.css';

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

interface Project {
  id: string;
  projectName: string;
  runtime: string;
}

const ProjectsGrid: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  // Id projektu, który ma test w trakcie
  const [runningProjectId, setRunningProjectId] = useState<string | null>(null);

  // Ładujemy projekty z backendu
  const fetchProjects = async () => {
    try {
      const resp = await fetch(`${apiBaseUrl}/api/filemanager/projects`);
      if (resp.ok) {
        const data = await resp.json();
        setProjects(data);
      } else {
        console.error('Błąd podczas pobierania projektów:', resp.status, resp.statusText);
      }
    } catch (err) {
      console.error('Błąd sieci', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Po wgraniu pliku - odświeżamy listę
  const handleFileUploaded = async (id: string, projectName: string, runtime: string) => {
    await fetchProjects();
    alert(`Dodano projekt: ${projectName} (runtime: ${runtime})`);
  };

  // Po usunięciu projektu usuwamy go lokalnie
  const handleProjectDeleted = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Start/koniec testu - do blokady
  const handleTestStart = (projectId: string) => {
    setRunningProjectId(projectId);
  };
  const handleTestEnd = (projectId: string) => {
    setRunningProjectId((prev) => (prev === projectId ? null : prev));
  };

  const isAnyRunning = runningProjectId !== null;

  return (
    <div className="projects-grid-container">
      <div className="add-project-tile">
        <h2>Dodaj projekt</h2>
        <FileUpload onFileUploaded={handleFileUploaded} />
      </div>

      {projects.map((proj) => (
        <div className="project-tile" key={proj.id}>
          <ContainerManager
            id={proj.id}
            projectName={proj.projectName}
            runtime={proj.runtime}
            isAnyRunning={isAnyRunning}
            onTestStart={handleTestStart}
            onTestEnd={handleTestEnd}
            onProjectDeleted={handleProjectDeleted}
          />
        </div>
      ))}
    </div>
  );
};

export default ProjectsGrid;
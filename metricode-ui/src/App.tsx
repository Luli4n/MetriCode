import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import ContainerManager from './components/ContainerManager';
import './App.css';

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

interface Project {
    id: string;
    projectName: string;
    runtime: string;
}

const App: React.FC = () => {
    const [uploadedProjects, setUploadedProjects] = useState<Project[]>([]);

    // Funkcja pobierająca projekty z backendu
    const fetchProjects = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/api/filemanager/projects`);
            if (response.ok) {
                const projects: Project[] = await response.json();
                setUploadedProjects(projects);
            } else {
                console.error('Błąd podczas ładowania projektów:', response.statusText);
            }
        } catch (error) {
            console.error('Błąd podczas ładowania projektów:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleFileUpload = async (id: string, projectName: string, runtime: string) => {
        // Po przesłaniu pliku odśwież listę projektów
        await fetchProjects();
    };

    const handleProjectDelete = async (id: string) => {
        setUploadedProjects((prevProjects) =>
            prevProjects.filter((project) => project.id !== id)
        );
    };

    return (
        <div className="app-container">
            <h1>MetriCode</h1>
            <FileUpload onFileUploaded={handleFileUpload} />
            {uploadedProjects.map((project) => (
                <ContainerManager
                    key={project.id}
                    id={project.id}
                    projectName={project.projectName}
                    runtime={project.runtime}
                    onProjectDeleted={handleProjectDelete}
                />
            ))}
        </div>
    );
};

export default App;
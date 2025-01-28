import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import ContainerManager from './components/ContainerManager';
import './App.css';

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

interface Project {
    fileName: string;
    runtime: string;
}

const App: React.FC = () => {
    const [uploadedProjects, setUploadedProjects] = useState<Project[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/filemanager/projects`);
                if (response.ok) {
                    const projects: Project[] = await response.json();
                    setUploadedProjects(projects);
                }
            } catch (error) {
                console.error('Błąd podczas ładowania projektów:', error);
            }
        };
        fetchProjects();
    }, []);

    const handleFileUpload = (fileName: string, runtime: string) => {
        setUploadedProjects((prevProjects) => [...prevProjects, { fileName, runtime }]);
    };

    const handleProjectDelete = (projectName: string) => {
        setUploadedProjects((prevProjects) =>
            prevProjects.filter((project) => project.fileName !== projectName)
        );
    };

    return (
        <div className="app-container">
            <h1>MetriCode</h1>
            <FileUpload onFileUploaded={handleFileUpload} />
            {uploadedProjects.map((project, index) => (
                <ContainerManager
                    key={index}
                    uploadedFileName={project.fileName}
                    runtime={project.runtime}
                    onProjectDeleted={handleProjectDelete}
                />
            ))}
        </div>
    );
};

export default App;
import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import ContainerManager from './components/ContainerManager';
import ReadMe from './components/ReadMe';
import Dashboard from './components/Dashboard';
import './App.css';

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

interface Project {
    id: string;
    projectName: string;
    runtime: string;
}

const App: React.FC = () => {
    const [uploadedProjects, setUploadedProjects] = useState<Project[]>([]);
    const [activeTab, setActiveTab] = useState<'projects' | 'readme' | 'dashboard'>('projects');

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
        await fetchProjects();
    };

    const handleProjectDelete = async (id: string) => {
        setUploadedProjects((prevProjects) =>
            prevProjects.filter((project) => project.id !== id)
        );
    };

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
            <main>
                {activeTab === 'projects' ? (
                    <>
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
                    </>
                ) : activeTab === 'readme' ? (
                    <ReadMe />
                ) : (
                    <Dashboard />
                )}
            </main>
        </div>
    );
};

export default App;

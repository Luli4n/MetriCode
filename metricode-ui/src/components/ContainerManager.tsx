import React, { useState } from 'react';
import './ContainerManager.css';

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

interface ContainerManagerProps {
    id: string;
    projectName: string;
    runtime: string;
    onProjectDeleted: (id: string) => void;
}

const ContainerManager: React.FC<ContainerManagerProps> = ({ id, projectName, runtime, onProjectDeleted }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState<{ cpu: number; ram: number; duration: number } | null>(null);

    const handleRunTest = async () => {
        setIsRunning(true);
        try {
            const response = await fetch(`${apiBaseUrl}/api/containermanager/run-container`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, runtime })
            });

            if (!response.ok) {
                throw new Error('Błąd podczas uruchamiania testu.');
            }

            const results = await response.json();
            setTestResults(results.results);
            alert('Test zakończony pomyślnie!');
        } catch (error) {
            alert('Błąd podczas uruchamiania testu.');
            console.error(error);
        } finally {
            setIsRunning(false);
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
                alert('Błąd podczas usuwania projektu.');
            }
        } catch (error) {
            alert('Wystąpił błąd podczas usuwania projektu.');
            console.error(error);
        }
    };

    return (
        <div className="container-manager-container">
            <h2 className="project-name">{projectName}</h2>
            <p><strong>Runtime:</strong> {runtime}</p>
            <div className="button-group">
                <button onClick={handleRunTest} disabled={isRunning} className="primary-button">
                    {isRunning ? 'Test w trakcie...' : 'Uruchom test'}
                </button>
                <button onClick={handleDeleteProject} className="delete-button">
                    Usuń projekt
                </button>
            </div>
            {testResults && (
                <div className="test-results">
                    <p><strong>CPU:</strong> {testResults.cpu}%</p>
                    <p><strong>RAM:</strong> {testResults.ram} MB</p>
                    <p><strong>Czas wykonania:</strong> {testResults.duration} ms</p>
                </div>
            )}
        </div>
    );
};

export default ContainerManager;
import React, { useState } from 'react';
import './ContainerManager.css';

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

interface ContainerManagerProps {
    uploadedFileName: string;
    runtime: string; // Dodano runtime jako prop
    onProjectDeleted: (projectName: string) => void;
}

const formatProjectName = (uploadedFileName: string) => {
    if (!uploadedFileName) return 'Brak nazwy projektu';
    const parts = uploadedFileName.split('-');
    if (parts.length > 1) {
        const timestampPart = parts[parts.length - 1].split('.')[0];
        const timestamp = new Date(parseInt(timestampPart, 10));
        return `${parts.slice(0, parts.length - 1).join('-')} (Dodano: ${timestamp.toLocaleString()})`;
    }
    return uploadedFileName;
};

const ContainerManager: React.FC<ContainerManagerProps> = ({ uploadedFileName, runtime, onProjectDeleted }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState<{ cpu: number; ram: number; duration: number } | null>(null);

    const handleRunTest = async () => {
        setIsRunning(true);
        try {
            const response = await fetch(`${apiBaseUrl}/api/containermanager/run-container`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectName: uploadedFileName, runtime })
            });

            if (!response.ok) {
                throw new Error('Błąd podczas uruchamiania testu.');
            }

            const results = await response.json();
            setTestResults(results.results); // Zakładamy, że results zawiera wyniki w `results`
            alert('Test zakończony pomyślnie!');
        } catch (error) {
            alert('Błąd podczas uruchamiania testu.');
            console.error(error);
        } finally {
            setIsRunning(false);
        }
    };

    const handleDeleteProject = async () => {
        const confirmDelete = window.confirm(`Czy na pewno chcesz usunąć projekt "${uploadedFileName}"?`);
        if (!confirmDelete) return;

        try {
            const response = await fetch(`${apiBaseUrl}/api/filemanager/delete/${uploadedFileName}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                onProjectDeleted(uploadedFileName);
                alert(`Projekt "${uploadedFileName}" został usunięty.`);
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
            <h2 className="project-name">{formatProjectName(uploadedFileName)}</h2>
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
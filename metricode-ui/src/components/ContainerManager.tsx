import React, { useState } from 'react';
import './ContainerManager.css';

interface ContainerManagerProps {
    uploadedFileName: string;
}

const ContainerManager: React.FC<ContainerManagerProps> = ({ uploadedFileName }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState<{ cpu: number; ram: number; duration: number } | null>(null);

    const handleRunTest = async () => {
        setIsRunning(true);
        try {
            const response = await fetch('http://localhost:5000/run-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectName: uploadedFileName })
            });
            const results = await response.json();
            setTestResults(results);
            alert('Test zakończony pomyślnie!');
        } catch (error) {
            alert('Błąd podczas uruchamiania testu.');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="container-manager-container">
            <h2>Projekt: {uploadedFileName}</h2>
            <button onClick={handleRunTest} disabled={isRunning}>
                {isRunning ? 'Test w trakcie...' : 'Uruchom test'}
            </button>
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

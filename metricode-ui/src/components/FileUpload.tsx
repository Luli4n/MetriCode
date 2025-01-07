import React, { useState } from 'react';
import './FileUpload.css';

interface FileUploadProps {
    onFileUploaded: (fileName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [projectName, setProjectName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            if (!file.name.endsWith('.zip')) {
                setError('Nieprawidłowy format pliku. Wspierane są tylko pliki .zip.');
                setSelectedFile(null);
            } else {
                setError(null);
                setSelectedFile(file);
            }
        }
    };

    const handleProjectNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(event.target.value);
    };

    const handleUpload = async () => {
        if (!selectedFile || !projectName.trim()) {
            alert('Proszę wybrać plik i podać nazwę projektu przed przesłaniem.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('projectName', projectName);

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                onFileUploaded(projectName);  // Wywołanie przekazanej funkcji
                alert(`Projekt ${projectName} został przesłany pomyślnie!`);
            } else {
                alert('Błąd podczas przesyłania pliku.');
            }
        } catch (error) {
            alert('Wystąpił błąd podczas przesyłania pliku.');
        }
    };

    return (
        <div className="file-upload-container">
            <h2>Upload pliku ZIP</h2>
            <input
                type="text"
                placeholder="Nazwa projektu"
                value={projectName}
                onChange={handleProjectNameChange}
            />
            <input type="file" accept=".zip" onChange={handleFileChange} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={handleUpload}>Prześlij plik</button>
        </div>
    );
};

export default FileUpload;

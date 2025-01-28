import React, { useState } from 'react';
import './FileUpload.css';

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

interface FileUploadProps {
    onFileUploaded: (fileName: string, runtime: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [projectName, setProjectName] = useState<string>('');
    const [runtime, setRuntime] = useState<string>('dotnet8');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !projectName.trim()) {
            alert('Podaj nazwę projektu, wybierz plik i runtime.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(
                `${apiBaseUrl}/api/filemanager/upload?projectName=${encodeURIComponent(projectName)}&runtime=${encodeURIComponent(runtime)}`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (response.ok) {
                const data = await response.json();
                onFileUploaded(data.fileName, runtime);
                alert('Plik został pomyślnie przesłany!');
            } else {
                alert('Błąd podczas przesyłania pliku.');
            }
        } catch (error) {
            alert('Wystąpił błąd podczas łączenia z serwerem.');
        }
    };

    return (
        <div className="file-upload-container">
            <input
                type="text"
                placeholder="Nazwa projektu"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
            />
            <input type="file" accept=".zip" onChange={handleFileChange} />
            <select value={runtime} onChange={(e) => setRuntime(e.target.value)}>
                <option value="dotnet8">.NET 8</option>
                <option value="python3.12">Python 3.12</option>
                <option value="node20">Node.js 20</option>
            </select>
            <button onClick={handleUpload}>Wyślij plik</button>
        </div>
    );
};

export default FileUpload;
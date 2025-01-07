import React, { useState } from 'react';
import './FileUpload.css';

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

interface FileUploadProps {
    onFileUploaded: (fileName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [projectName, setProjectName] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !projectName.trim()) {
            alert('Podaj nazwę projektu i wybierz plik.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(
                `${apiBaseUrl}/api/filemanager/upload?projectName=${encodeURIComponent(projectName)}`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (response.ok) {
                const data = await response.json();
                onFileUploaded(data.fileName);
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
            <button onClick={handleUpload}>Wyślij plik</button>
        </div>
    );
};

export default FileUpload;
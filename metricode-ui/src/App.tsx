import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ContainerManager from './components/ContainerManager';
import './App.css';

const App: React.FC = () => {
    const [uploadedProjects, setUploadedProjects] = useState<string[]>([]);

    const handleFileUpload = (fileName: string) => {
        setUploadedProjects((prevProjects) => [...prevProjects, fileName]);
    };

    return (
        <div className="app-container">
            <h1>MetriCode</h1>
            <FileUpload onFileUploaded={handleFileUpload} />
            {uploadedProjects.map((project, index) => (
                <ContainerManager key={index} uploadedFileName={project} />
            ))}
        </div>
    );
};

export default App;

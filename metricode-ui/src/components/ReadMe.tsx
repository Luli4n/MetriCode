// React Component: Instruction View for MetriCode
import React, { useState } from 'react';
import './ReadMe.css';

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

const LANGUAGES = [
    { id: 'python', name: 'Python 3.12', file: 'metricode-python-lib.zip' },
    { id: 'nodejs', name: 'Node.js 20', file: 'metricode-node-lib.zip' },
    { id: 'dotnet', name: '.NET 8', file: 'metricode-dotnet-lib.zip' }
];

const ReadMe: React.FC = () => {
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].id);

    const handleDownload = async (lang: string) => {
        const link = document.createElement('a');
        link.href = `${apiBaseUrl}/api/filemanager/download-library?lang=${lang}`;
        link.download = LANGUAGES.find(l => l.id === lang)?.file || 'library.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="readme-container">
            <h1>Instrukcja integracji z MetriCode</h1>

            <div className="language-selector">
                <label htmlFor="language">Wybierz język:</label>
                <select
                    id="language"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                    {LANGUAGES.map(lang => (
                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                    ))}
                </select>
            </div>

            <div className="instructions">
                {selectedLanguage === 'python' && (
                    <div>
                        <h2>Instrukcja dla Python 3.12</h2>
                        <p>1. Pobierz bibliotekę MetriCode dla Pythona.</p>
                        <p>2. Zainstaluj ją w swoim projekcie:</p>
                        <pre><code>pip install metricode-python-lib.zip</code></pre>
                        <p>3. Użyj poniższego kodu w swoim projekcie:</p>
                        <pre><code>
from metricode import Benchmark

benchmark = Benchmark("<projectId>", "<runtime>")
benchmark.record(cpu_usage=50.5, ram_usage=1024, custom_fields=[
    {"name": "TestName", "value": "Value1", "unit": "ms"}
])
                        </code></pre>
                    </div>
                )}

                {selectedLanguage === 'nodejs' && (
                    <div>
                        <h2>Instrukcja dla Node.js 20</h2>
                        <p>1. Pobierz bibliotekę MetriCode dla Node.js.</p>
                        <p>2. Zainstaluj ją w swoim projekcie:</p>
                        <pre><code>npm install ./metricode-node-lib.zip</code></pre>
                        <p>3. Użyj poniższego kodu w swoim projekcie:</p>
                        <pre><code>
const { Benchmark } = require('metricode');

const benchmark = new Benchmark('<projectId>', '<runtime>');
benchmark.record({
    cpuUsage: 50.5,
    ramUsage: 1024,
    customFields: [
        { name: 'TestName', value: 'Value1', unit: 'ms' }
    ]
});
                        </code></pre>
                    </div>
                )}

                {selectedLanguage === 'dotnet' && (
                    <div>
                        <h2>Instrukcja dla .NET 8</h2>
                        <p>1. Pobierz bibliotekę MetriCode dla .NET.</p>
                        <p>2. Dodaj ją do swojego projektu:</p>
                        <pre><code>dotnet add package metricode-dotnet-lib.zip</code></pre>
                        <p>3. Użyj poniższego kodu w swoim projekcie:</p>
                        <pre><code>
using MetriCode;

var benchmark = new Benchmark("<projectId>", "<runtime>");
benchmark.Record(new BenchmarkResult {
    CpuUsage = 50.5,
    RamUsage = 1024,
    CustomFields = new List<CustomField> {
        new CustomField { Name = "TestName", Value = "Value1", Unit = "ms" }
    }
});
                        </code></pre>
                    </div>
                )}
            </div>

            <button onClick={() => handleDownload(selectedLanguage)}>Pobierz bibliotekę</button>
        </div>
    );
};

export default ReadMe;

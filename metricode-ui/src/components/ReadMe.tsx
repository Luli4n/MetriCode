import React from 'react';
import './ReadMe.css';

const ReadMe: React.FC = () => {
    const languages = [
        {
            name: 'Python 3.12',
            description: 'Pobierz bibliotekę i załącz ją do projektu. Użyj funkcji `save_results` w swoim kodzie, aby przesłać dane do bazy.',
            link: '/libs/python/metricode.py',
            linkLabel: 'Pobierz bibliotekę Python',
        },
        {
            name: 'Node.js 20',
            description: 'Pobierz bibliotekę i załącz ją do projektu. Skorzystaj z metody `saveResults()` do przesyłania wyników.',
            link: '/libs/node/metrics-uploader-1.0.0.tgz',
            linkLabel: 'Pobierz bibliotekę Node.js',
        },
        {
            name: '.NET 8',
            description: 'Dodaj bibliotekę do swojego projektu. Użyj klasy `MetricsUploader` do przesyłania wyników testów.',
            link: '/libs/dotnet/MetricsUploader.1.0.0.nupkg',
            linkLabel: 'Pobierz bibliotekę .NET',
        },
    ];

    return (
        <div className="readme-container">
            <h1 className="readme-title">Instrukcja przygotowania projektów</h1>
            <p className="readme-intro">
                Aby Twój projekt mógł poprawnie przesyłać dane do systemu MetriCode, upewnij się, że dodałeś odpowiednią bibliotekę i zaimplementowałeś właściwe metody. Wybierz język, w którym pracujesz:
            </p>
            <div className="language-grid">
                {languages.map((lang, index) => (
                    <div key={index} className="language-card">
                        <h2 className="language-title">{lang.name}</h2>
                        <p className="language-description">{lang.description}</p>
                        <a href={lang.link} download className="download-link">
                            {lang.linkLabel}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReadMe;
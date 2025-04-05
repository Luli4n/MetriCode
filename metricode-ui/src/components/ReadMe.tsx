import React from 'react';
import './ReadMe.css';

const ReadMe: React.FC = () => {
    const languages = [
        {
            name: 'Python 3.12',
            description: 'Pobierz moduł i zaimportuj go w swoim projekcie. Korzystaj z klasy `MetricsUploader` do operacji na metrykach. Używaj funkcji `add_field()` i `add_timeseries_field()` do zapisywania metryk lokalnie. Na koniec wyślij metryki do systemu wykorzystując metodę `save_results()`.',
            link: '/libs/python/metrics_uploader-1.0.0.tar.gz',
            linkLabel: 'Pobierz bibliotekę Python',
        },
        {
            name: 'Node.js 20',
            description: 'Pobierz paczkę NPM i zainstaluj ją w swoim środowisku. Wykorzystaj klasę `MetricsUploader`. Zapisuj metryki lokalnie za pomocą metod `addField()` i `addTimeseriesField()`. Na koniec skorzystaj z metody `saveResults()` aby przesłać wyniki do systemu.',
            link: '/libs/node/metrics-uploader-1.0.0.tgz',
            linkLabel: 'Pobierz bibliotekę Node.js',
        },
        {
            name: '.NET 8',
            description: 'Pobierz paczkę Nuget i dołącz ją do do swojego projektu. Użyj klasy `MetricsUploader` do przesyłania wyników testów. Metody `AddField()` i `AddTimeseriesField()` służą do zapisywania wyników lokalnie. Metoda `SaveResultsAsync()` umożliwia ich zapisanie w systemie.',
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
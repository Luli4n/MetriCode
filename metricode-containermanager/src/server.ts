import express from 'express';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import { Extract } from 'unzipper'; // Do obsługi ZIP

const app = express();
const PORT = 5002;
const UPLOADS_PATH = '/app/dist/uploads';
const DB_URL = process.env.MONGO_URL || 'mongodb://mongodb:27017';
const DB_NAME = 'metricode';
const COLLECTION_NAME = 'benchmarkResults';

app.use(bodyParser.json());
app.use(cors());

const client = new MongoClient(DB_URL);
let db: any;
let isContainerRunning = false;

client.connect()
    .then(() => {
        db = client.db(DB_NAME);
        console.log('Połączono z bazą MongoDB');
    })
    .catch(err => {
        console.error('Błąd połączenia z MongoDB:', err);
        process.exit(1);
    });

// Funkcja do rozpakowywania ZIP
const unpackProject = async (zipFilePath: string, extractToPath: string) => {
    return new Promise<void>((resolve, reject) => {
        fs.createReadStream(zipFilePath)
            .pipe(Extract({ path: extractToPath }))
            .on('close', resolve)
            .on('error', reject);
    });
};

// Endpoint do uruchamiania kontenerów
app.post('/api/containermanager/run-container', async (req, res) => {
    const { projectName, runtime } = req.body;

    if (isContainerRunning) {
        return res.status(429).send('Kontener już działa. Poczekaj na zakończenie poprzedniego testu.');
    }

    if (!projectName || !runtime) {
        return res.status(400).send('Brak wymaganych danych: projectName lub runtime');
    }

    const projectZipPath = path.join(UPLOADS_PATH, projectName);
    const projectExtractPath = path.join(UPLOADS_PATH, projectName.replace('.zip', ''));

    if (!fs.existsSync(projectZipPath)) {
        return res.status(404).send('Projekt ZIP nie istnieje.');
    }

    try {
        if (!fs.existsSync(projectExtractPath)) {
            await unpackProject(projectZipPath, projectExtractPath);
            console.log(`Projekt ${projectName} rozpakowany do ${projectExtractPath}`);
        }
    } catch (err) {
        console.error(`Błąd podczas rozpakowywania projektu: ${err}`);
        return res.status(500).send('Błąd podczas rozpakowywania projektu.');
    }

    const imageMap: Record<string, string> = {
        'dotnet8': 'metricode-dotnet8-base',
        'python3.12': 'metricode-python3.12-base',
        'node20': 'metricode-node20-base'
    };

    const imageName = imageMap[runtime];
    if (!imageName) {
        return res.status(400).send('Nieobsługiwany runtime.');
    }

    isContainerRunning = true;  
    const containerName = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_container`;

    const command = `
        docker run --rm \
        --name ${containerName} \
        --network host \
        -v metricode_uploads_volume:/app/dist/uploads \
        ${imageName} \
        /bin/sh -c "cd /app/dist/uploads/${projectName.replace('.zip', '')} && chmod +x run.sh && ./run.sh"
    `;

    exec(command, async (error, stdout, stderr) => {
        isContainerRunning = false;
    
        // Usuń pliki projektu na koniec
        const cleanupProjectFiles = () => {
            try {
                fs.rmSync(projectExtractPath, { recursive: true, force: true });
                console.log(`Usunięto rozpakowane pliki projektu: ${projectExtractPath}`);
            } catch (cleanupError) {
                console.error(`Błąd podczas usuwania plików projektu: ${cleanupError}`);
            }
        };
    
        if (error) {
            console.error(`Błąd uruchamiania kontenera: ${stderr}`);
            cleanupProjectFiles(); // Usuwanie nawet w przypadku błędu
            return res.status(500).send(`Błąd uruchamiania kontenera: ${stderr}`);
        }
    
        try {
            const benchmarkResult = {
                projectName,
                runtime,
                cpuUsage: Math.random() * 100,
                ramUsage: Math.random() * 500,
                custom_fields: [],
                custom_timeseries_fields: []
            };
    
            await db.collection(COLLECTION_NAME).insertOne(benchmarkResult);
            res.status(200).json({ message: `Test zakończony dla ${projectName}`, results: benchmarkResult });
        } catch (dbError) {
            console.error('Błąd podczas zapisu wyników w bazie:', dbError);
            res.status(500).send('Błąd podczas zapisu wyników w bazie.');
        } finally {
            cleanupProjectFiles(); // Usuwanie plików projektu po przetworzeniu
        }
    });
});

// Endpoint zdrowotności
app.get('/api/containermanager/health', (req, res) => {
    res.status(200).send('Containermanager działa poprawnie.');
});

// Uruchomienie serwera
app.listen(PORT, () => {
    console.log(`MetriCode Container Manager działa na http://localhost:${PORT}`);
});
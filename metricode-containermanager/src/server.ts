import express from 'express';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import { Extract } from 'unzipper'; // Do obsługi ZIP

const app = express();
const PORT = 5002;
const UPLOADS_PATH = '/app/dist/uploads'; // Współdzielony wolumen na pliki
const DB_URL = process.env.MONGO_URL || 'mongodb://mongodb:27017';
const DB_NAME = 'metricode';
const COLLECTION_NAME = 'projects';
const BENCHMARK_COLLECTION = 'benchmarkResults';

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
    const { id } = req.body;

    if (!id) {
        return res.status(400).send('Brak wymaganych danych: id projektu');
    }

    if (isContainerRunning) {
        return res.status(429).send('Kontener już działa. Poczekaj na zakończenie poprzedniego testu.');
    }

    try {
        // Pobieramy szczegóły projektu z bazy danych
        const project = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
        console.log(`[DEBUG] Szczegóły projektu: ${JSON.stringify(project)}`);
        if (!project) {
            return res.status(404).send('Projekt nie istnieje.');
        }

        const projectZipPath = project.filePath;
        const projectExtractPath = path.join(UPLOADS_PATH, project._id.toString());

        console.log(`[DEBUG] Ścieżka do pliku ZIP: ${projectZipPath}`);
        console.log(`[DEBUG] Ścieżka do rozpakowania projektu: ${projectExtractPath}`);

        if (!fs.existsSync(projectZipPath)) {
            console.error(`[DEBUG] Plik ZIP nie istnieje pod ścieżką: ${projectZipPath}`);
            return res.status(404).send('Plik projektu nie istnieje.');
        }

        if (!fs.existsSync(projectExtractPath)) {
            await unpackProject(projectZipPath, projectExtractPath);
            console.log(`[DEBUG] Projekt ${project._id} rozpakowany do ${projectExtractPath}`);
        }

        const imageMap: Record<string, string> = {
            'dotnet8': 'metricode-dotnet8-base',
            'python3.12': 'metricode-python3.12-base',
            'node20': 'metricode-node20-base'
        };

        const imageName = imageMap[project.runtime];
        if (!imageName) {
            return res.status(400).send('Nieobsługiwany runtime.');
        }

        isContainerRunning = true;
        const containerName = `project_${project._id}`;

        const command = `
            docker run \
            --name "${containerName}" \
            --network host \
            -v metricode_uploads_volume:/app/dist/uploads \
            -e PROJECT_ID=${project._id} \
            -e RUNTIME=${project.runtime} \
            --cpus="4" \
            --memory="8g" \
            ${imageName} \
            /bin/sh -c "cd /app/dist/uploads/${project._id} && /app/run.sh"
        `;

        console.log(`[DEBUG] Polecenie Docker: ${command}`);

        exec(command, async (error, stdout, stderr) => {
            isContainerRunning = false;
        
            const cleanupProjectFiles = () => {
                if (fs.existsSync(projectExtractPath)) {
                    fs.rmSync(projectExtractPath, { recursive: true, force: true });
                    console.log(`[DEBUG] Usunięto pliki projektu: ${projectExtractPath}`);
                }
            };
        
            if (error) {
                console.error(`[DEBUG] Błąd uruchamiania kontenera: ${stderr}`);
                cleanupProjectFiles();
                return res.status(500).send(`Błąd uruchamiania kontenera: ${stderr}`);
            }
        
            console.log(`[DEBUG] Test zakończony pomyślnie dla projektu ${project._id}`);
            cleanupProjectFiles();
            res.status(200).json({ message: `Test zakończony dla projektu ${project._id}` });
        });
    } catch (error) {
        console.error('[DEBUG] Błąd podczas uruchamiania kontenera:', error);
        res.status(500).send('Błąd podczas uruchamiania kontenera.');
    }
});

// Endpoint zdrowotności
app.get('/api/containermanager/health', (req, res) => {
    res.status(200).send('Containermanager działa poprawnie.');
});

// Uruchomienie serwera
app.listen(PORT, () => {
    console.log(`MetriCode Container Manager działa na http://localhost:${PORT}`);
});
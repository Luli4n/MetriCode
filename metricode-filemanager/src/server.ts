import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const PORT = 5001;
const DB_URL = process.env.MONGO_URL || 'mongodb://mongodb:27017';
const DB_NAME = 'metricode';
const COLLECTION_NAME = 'projects';

app.use(cors());
app.use(express.json());

const client = new MongoClient(DB_URL);
let db: any;

client.connect()
    .then(() => {
        db = client.db(DB_NAME);
        console.log('Połączono z bazą MongoDB');
    })
    .catch(err => {
        console.error('Błąd połączenia z MongoDB:', err);
        process.exit(1);
    });

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: async (req, file, cb) => {
        try {
            // Generujemy nowe ID projektu
            const id = new ObjectId();
            const fileName = `${id.toString()}.zip`;

            // Dane projektu do zapisania w bazie danych
            const { projectName, runtime } = req.query;
            const projectData = {
                _id: id,
                projectName: projectName ? String(projectName) : 'Unnamed Project',
                runtime: runtime ? String(runtime) : 'python3.12',
                filePath: path.join(uploadDir, fileName),
                timestamp: Date.now(),
            };

            // Zapis projektu do bazy danych
            await db.collection(COLLECTION_NAME).insertOne(projectData);

            console.log(`[DEBUG] Projekt zapisany w bazie danych: ${JSON.stringify(projectData)}`);
            cb(null, fileName);
        } catch (err) {
            console.error(`[DEBUG] Błąd podczas generowania nazwy pliku: ${err}`);
            cb(err as Error, ''); // Rzutujemy błąd na typ `Error`
        }
    }
});
const upload = multer({ storage });

// Upload pliku
app.post('/api/filemanager/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nie przesłano pliku.');
    }
    res.status(200).json({ message: 'Plik został przesłany.' });
});

// Pobieranie listy projektów
app.get('/api/filemanager/projects', async (req, res) => {
    try {
        const projects = await db.collection(COLLECTION_NAME).find({}).toArray();
        res.status(200).json(
            projects.map(({ _id, projectName, runtime }: { _id: ObjectId; projectName: string; runtime: string }) => ({
                id: _id.toString(),
                projectName,
                runtime,
            }))
        );
    } catch (err) {
        console.error('Błąd pobierania projektów z bazy:', err);
        res.status(500).send('Błąd podczas pobierania projektów.');
    }
});

// Usuwanie projektu
app.delete('/api/filemanager/delete/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const project = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
        if (!project) {
            return res.status(404).send('Projekt nie istnieje.');
        }

        if (fs.existsSync(project.filePath)) {
            fs.unlinkSync(project.filePath);
        }

        await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('Projekt został usunięty.');
    } catch (err) {
        console.error('Błąd usuwania projektu:', err);
        res.status(500).send('Błąd podczas usuwania projektu.');
    }
});

// Start serwera
app.listen(PORT, () => {
    console.log(`MetriCode File Manager działa na http://localhost:${PORT}`);
});
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const projectName = req.query.projectName || 'unnamed_project';
        const fileName = `${projectName}-${timestamp}.zip`;
        cb(null, fileName);
    }
});
const upload = multer({ storage });

app.post('/api/filemanager/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nie przesłano pliku.');
    }
    res.status(200).json({ fileName: req.file.filename });
});

app.get('/api/filemanager/projects', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).send('Błąd podczas odczytu plików.');
        }
        res.status(200).json(files);
    });
});

app.delete('/api/filemanager/delete/:projectName', (req, res) => {
    const projectName = req.params.projectName;
    const filePath = path.join(uploadDir, projectName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return res.status(200).send('Plik został usunięty.');
    } else {
        return res.status(404).send('Plik nie istnieje.');
    }
});

app.listen(PORT, () => {
    console.log(`MetriCode File Manager działa na http://localhost:${PORT}`);
});
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware dla połączeń między domenami
app.use(cors());

// Folder na pliki
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Konfiguracja Multer do obsługi plików
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const projectName = req.body.projectName || 'unnamed_project';
        cb(null, `${projectName}-${Date.now()}.zip`);
    }
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nie przesłano pliku.');
    }
    res.status(200).json({ message: `Plik ${req.file.filename} przesłany pomyślnie!` });
});

app.listen(PORT, () => {
    console.log(`MetriCode File Manager działa na http://localhost:${PORT}`);
});

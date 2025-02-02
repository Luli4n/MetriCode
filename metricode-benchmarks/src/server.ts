import express, { Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv"; // Zmieniony import dotenv
import { MongoClient, ObjectId } from "mongodb";
import { getBenchmarks } from "./controllers";

dotenv.config();

const app = express();
const PORT = 5003;
const MONGO_URL = process.env.MONGO_URL || "mongodb://mongodb:27017";
const DB_NAME = process.env.MONGO_DB_NAME || "metricode";

app.use(cors());
app.use(express.json());

const client = new MongoClient(MONGO_URL);
let db: any;

client.connect()
    .then(() => {
        db = client.db(DB_NAME);
        console.log("✅ Połączono z bazą MongoDB");
    })
    .catch(err => {
        console.error("❌ Błąd połączenia z MongoDB:", err);
        process.exit(1);
    });

// Endpointy API
app.get("/api/benchmarks/:projectId", async (req: Request, res: Response) => {
    await getBenchmarks(req, res, db);
});

app.get("/api/benchmarks", async (req: Request, res: Response) => {
    await getBenchmarks(req, res, db);
});

// Endpoint zdrowotności
app.get("/api/benchmarks/health", (req: Request, res: Response) => {
    res.status(200).send("✅ metricode-benchmarks działa poprawnie.");
});

app.listen(PORT, () => {
    console.log(`🚀 MetriCode Benchmarks API działa na http://localhost:${PORT}`);
});
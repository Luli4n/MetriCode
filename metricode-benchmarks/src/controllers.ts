import { Request, Response } from "express";

export const getBenchmarks = async (req: Request, res: Response, db: any) => {
    try {
        const { projectId } = req.params;
        let query = {};

        if (projectId) {
            query = { projectId };
        }

        const benchmarks = await db.collection("benchmarkResults").find(query).toArray();

        res.status(200).json(benchmarks);
    } catch (error) {
        console.error("❌ Błąd pobierania wyników benchmarków:", error);
        res.status(500).send("Błąd pobierania wyników.");
    }
};

export const postBenchmark = async (req: Request, res: Response, db: any) => {
    try {
        const metricData = req.body;

        if (!metricData.projectId) {
            return res.status(400).send("Błąd: 'projectId' jest wymagany.");
        }

        if (!metricData.timestamp) {
            metricData.timestamp = Date.now();
        }

        await db.collection("benchmarkResults").insertOne(metricData);
        res.status(201).send("Benchmark zapisany pomyślnie.");
    } catch (error) {
        console.error("❌ Błąd zapisu benchmarku:", error);
        res.status(500).send("Błąd zapisu benchmarku.");
    }
};
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
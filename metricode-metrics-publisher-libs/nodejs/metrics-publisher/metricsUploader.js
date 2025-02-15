const { MongoClient } = require("mongodb");

class MetricsUploader {
    constructor() {
        this.projectId = process.env.PROJECT_ID;
        this.mongoUrl = process.env.MONGO_URL;
        this.mongoDbName = process.env.MONGO_DB_NAME;
        this.runtime = process.env.RUNTIME || "unknown";

        if (!this.projectId || !this.mongoUrl || !this.mongoDbName) {
            throw new Error("Missing required environment variables: PROJECT_ID, MONGO_URL, MONGO_DB_NAME.");
        }

        this.client = new MongoClient(this.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        this.db = this.client.db(this.mongoDbName);
        this.collection = this.db.collection("benchmarkResults");

        this.fields = {};
        this.timeseriesFields = {};
        this.timestamp = Date.now(); // 🕒 Store timestamp at object creation
    }

    addField(name, value, unit = "") {
        this.fields[name] = { value, unit };
    }

    addTimeseriesField(name, values, timestamps, unit = "") {
        if (values.length !== timestamps.length) {
            throw new Error("Number of values and timestamps must match.");
        }
        this.timeseriesFields[name] = { values, timestamps, unit };
    }

    async saveResults() {
        try {
            const result = {
                projectId: this.projectId,
                runtime: this.runtime,
                fields: this.fields,
                timeseriesFields: this.timeseriesFields,
                timestamp: this.timestamp
            };

            await this.collection.insertOne(result);
            console.log(`✅ Results saved for project ${this.projectId} at ${this.timestamp}.`);
        } catch (error) {
            console.error("❌ Error saving metrics:", error);
        } finally {
            await this.client.close(); 
            console.log("🔴 MongoDB connection closed. Exiting process.");
            process.exit(0);
        }
    }
}

module.exports = MetricsUploader;
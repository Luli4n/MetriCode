const axios = require("axios");

class MetricsUploader {
    constructor() {
        this.projectId = process.env.PROJECT_ID;
        // Endpoint API do zapisu metryk; można nadpisać przez zmienną środowiskową METRICS_API_URL
        this.metricsApiUrl = process.env.METRICS_API_URL || "http://localhost:5003/api/benchmarks";
        this.runtime = process.env.RUNTIME || "unknown";

        if (!this.projectId) {
            throw new Error("Missing required environment variable: PROJECT_ID.");
        }

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

            const response = await axios.post(this.metricsApiUrl, result);

            if (response.status === 201) {
                console.log(`✅ Results saved for project ${this.projectId} at ${this.timestamp}.`);
            } else {
                console.error("❌ Error saving metrics:", response.data);
            }
        } catch (error) {
            console.error("❌ Error saving metrics:", error.message);
        }
    }
}

module.exports = MetricsUploader;
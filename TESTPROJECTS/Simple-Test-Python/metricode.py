import os
import time
from pymongo import MongoClient
from typing import List, Any

class MetricsUploader:
    def __init__(self):
        """
        Initializes connection to the database and loads environment variables.
        """
        self.project_id = os.getenv("PROJECT_ID")
        self.mongo_url = os.getenv("MONGO_URL")
        self.mongo_db_name = os.getenv("MONGO_DB_NAME")
        self.runtime = os.getenv("RUNTIME")

        if not self.project_id or not self.mongo_url or not self.mongo_db_name:
            raise EnvironmentError("Missing required environment variables: PROJECT_ID, MONGO_URL, MONGO_DB_NAME.")

        self.client = MongoClient(self.mongo_url)
        self.db = self.client[self.mongo_db_name]
        self.fields = {}
        self.timeseries_fields = {}
        self.timestamp = int(time.time() * 1000)  # 🕒 Store timestamp at object creation

    def add_field(self, name: str, value: Any, unit: str = ""):
        """
        Adds a single field with a value.
        """
        self.fields[name] = {"value": value, "unit": unit}

    def add_timeseries_field(self, name: str, values: List[float], timestamps: List[int], unit: str = ""):
        """
        Adds a timeseries field.
        """
        if len(values) != len(timestamps):
            raise ValueError("Number of values and timestamps must match.")
        self.timeseries_fields[name] = {"values": values, "timestamps": timestamps, "unit": unit}

    def save_results(self):
        """
        Saves the results to MongoDB.
        """
        result = {
            "projectId": self.project_id,
            "runtime": self.runtime,
            "fields": self.fields,
            "timeseriesFields": self.timeseries_fields,
            "timestamp": self.timestamp  # 🕒 Include timestamp in saved results
        }
        self.db.benchmarkResults.insert_one(result)
        print(f"Results saved for project {self.project_id} at {self.timestamp}.")
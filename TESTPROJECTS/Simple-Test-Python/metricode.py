import os
from pymongo import MongoClient
from typing import List, Dict, Any

class MetricsUploader:
    def __init__(self):
        """
        Inicjalizuje połączenie z bazą danych i wczytuje zmienne środowiskowe.
        """
        self.project_id = os.getenv("PROJECT_ID")
        self.mongo_url = os.getenv("MONGO_URL")
        self.mongo_db_name = os.getenv("MONGO_DB_NAME")
        self.runtime = os.getenv("RUNTIME")

        if not self.project_id or not self.mongo_url or not self.mongo_db_name:
            raise EnvironmentError("Brak wymaganych zmiennych środowiskowych: PROJECT_ID, MONGO_URL, MONGO_DB_NAME.")

        self.client = MongoClient(self.mongo_url)
        self.db = self.client[self.mongo_db_name]
        self.fields = {}
        self.timeseries_fields = {}

    def add_field(self, name: str, value: Any, unit: str = ""):
        """
        Dodaje pojedyncze pole z wartością.
        """
        self.fields[name] = {"value": value, "unit": unit}

    def add_timeseries_field(self, name: str, values: List[float], timestamps: List[int], unit: str = ""):
        """
        Dodaje pole szeregów czasowych.
        """
        if len(values) != len(timestamps):
            raise ValueError("Ilość wartości i timestampów musi być równa.")
        self.timeseries_fields[name] = {"values": values, "timestamps": timestamps, "unit": unit}

    def save_results(self):
        """
        Zapisuje dane do bazy MongoDB.
        """
        result = {
            "projectId": self.project_id,
            "runtime": self.runtime,
            "fields": self.fields,
            "timeseriesFields": self.timeseries_fields,
        }
        self.db.benchmarkResults.insert_one(result)
        print(f"Wyniki zostały zapisane dla projektu {self.project_id}.")
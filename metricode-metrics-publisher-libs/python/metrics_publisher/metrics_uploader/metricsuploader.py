import os
import time
import requests
from typing import List, Any

class MetricsUploader:
    def __init__(self):
        """
        Inicjalizuje MetricsUploader, pobierając niezbędne zmienne środowiskowe.
        Teraz używa endpointu HTTP do zapisu metryk.
        """
        self.project_id = os.getenv("PROJECT_ID")
        self.runtime = os.getenv("RUNTIME", "unknown")
        # Ustawiamy URL endpointu do zapisu metryk – możesz go nadpisać zmienną środowiskową METRICS_API_URL
        self.metrics_api_url = os.getenv("METRICS_API_URL", "http://localhost:5003/api/benchmarks")

        if not self.project_id:
            raise EnvironmentError("Brak wymaganego zmiennego środowiskowego: PROJECT_ID.")

        self.fields = {}
        self.timeseries_fields = {}
        self.timestamp = int(time.time() * 1000)  # 🕒 Przechowujemy timestamp przy tworzeniu obiektu

    def add_field(self, name: str, value: Any, unit: str = ""):
        """
        Dodaje pojedyncze pole z wartością.
        """
        self.fields[name] = {"value": value, "unit": unit}

    def add_timeseries_field(self, name: str, values: List[float], timestamps: List[int], unit: str = ""):
        """
        Dodaje pole typu timeseries.
        """
        if len(values) != len(timestamps):
            raise ValueError("Liczba wartości i timestampów musi być taka sama.")
        self.timeseries_fields[name] = {"values": values, "timestamps": timestamps, "unit": unit}

    def save_results(self):
        """
        Zapisuje wyniki, wysyłając je do skonfigurowanego endpointu API.
        """
        result = {
            "projectId": self.project_id,
            "runtime": self.runtime,
            "fields": self.fields,
            "timeseriesFields": self.timeseries_fields,
            "timestamp": self.timestamp  # 🕒 Uwzględniamy timestamp w zapisywanych wynikach
        }
        try:
            response = requests.post(self.metrics_api_url, json=result)
            if response.status_code == 201:
                print(f"Wyniki zapisane dla projektu {self.project_id} o {self.timestamp}.")
            else:
                print(f"Błąd zapisu benchmarku: {response.text}")
        except Exception as e:
            print(f"❌ Wystąpił błąd podczas wysyłania danych: {e}")
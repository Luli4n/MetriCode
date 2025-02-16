import time
from metrics_uploader import MetricsUploader

# Inicjalizacja uploader'a
uploader = MetricsUploader()

# Dodanie przykładowego pola przed rozpoczęciem testu
uploader.add_field("test_status", "in_progress", unit="")

# Symulacja dłuższego zadania
start = time.time()
time.sleep(2)  # Dłuższy czas wykonania (2 sekundy)
end = time.time()

# Obliczanie czasu wykonania
execution_time = end - start
print("Wynik testu:")
print(f"Czas wykonania: {execution_time:.2f} sekundy")

# Dodanie wyniku testu do pól uploader'a
uploader.add_field("execution_time", execution_time, unit="seconds")

# Symulacja danych szeregów czasowych (np. zmieniającego się obciążenia CPU)
timestamps = [int(start * 1000), int((start + 0.7) * 1000), int((start + 1.4) * 1000), int(end * 1000)]
cpu_usages = [40.0, 50.0, 30.0, 45.0]  # Inne wartości CPU niż w pierwszym benchmarku
uploader.add_timeseries_field("cpu_usage", cpu_usages, timestamps, unit="%")

# Zapisanie wyników do bazy
uploader.save_results()
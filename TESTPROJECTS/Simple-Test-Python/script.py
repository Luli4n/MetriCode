import time
from metricode import MetricsUploader

# Inicjalizacja uploader'a
uploader = MetricsUploader()

# Dodanie przykładowego pola przed rozpoczęciem testu
uploader.add_field("test_status", "started", unit="")

# Symulacja długiego zadania
start = time.time()
time.sleep(1)  # Symulacja zadania trwającego 1 sekundę
end = time.time()

# Obliczanie czasu wykonania
execution_time = end - start
print("Wynik testu:")
print(f"Czas wykonania: {execution_time:.2f} sekundy")

# Dodanie wyniku testu do pól uploader'a
uploader.add_field("execution_time", execution_time, unit="seconds")

# Symulacja danych szeregów czasowych (np. zmieniającego się obciążenia CPU)
timestamps = [int(start * 1000), int((start + 0.5) * 1000), int(end * 1000)]
cpu_usages = [25.0, 35.0, 20.0]  # Przykładowe dane
uploader.add_timeseries_field("cpu_usage", cpu_usages, timestamps, unit="%")

# Zapisanie wyników do bazy
uploader.save_results()
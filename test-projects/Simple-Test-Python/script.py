import json
import simplejson
import ujson
import time
import statistics
import os
from metrics_uploader import MetricsUploader

# Konfiguracja testu
FILES = ["simple_small.json", "simple_medium.json", "simple_large.json"]
ITERATIONS = 1000

# Inicjalizacja MetricsUploader
uploader = MetricsUploader()

class SimpleModel:
    """ Model zgodny z danymi JSON """
    def __init__(self, Id, Name, Email, Age, Active):
        self.Id = Id
        self.Name = Name
        self.Email = Email
        self.Age = Age
        self.Active = Active

    def to_dict(self):
        """ Konwersja obiektu do słownika (dla serializacji) """
        return self.__dict__

# Pomiar czasu w mikrosekundach (µs)
def measure_time(func, *args, iterations=ITERATIONS):
    times = []
    for _ in range(iterations):
        start = time.perf_counter()
        func(*args)
        end = time.perf_counter()
        times.append((end - start) * 1_000_000)  # Mikrosekundy
    return statistics.mean(times)

# Testy dla każdej biblioteki JSON
def run_tests():
    for file in FILES:
        if not os.path.exists(file):
            print(f"❌ Plik {file} nie istnieje, pomijam test.")
            continue

        # 1️⃣ Wczytaj JSON do pamięci
        with open(file, "r", encoding="utf-8") as f:
            json_string = f.read()

        # 2️⃣ Jednorazowa deserializacja do listy obiektów
        data_json = json.loads(json_string)
        data_simplejson = simplejson.loads(json_string)
        data_ujson = ujson.loads(json_string)

        # 3️⃣ Testy deserializacji
        json_deser_time = measure_time(json.loads, json_string)
        simplejson_deser_time = measure_time(simplejson.loads, json_string)
        ujson_deser_time = measure_time(ujson.loads, json_string)

        # 4️⃣ Testy serializacji
        json_ser_time = measure_time(json.dumps, data_json)
        simplejson_ser_time = measure_time(simplejson.dumps, data_simplejson)
        ujson_ser_time = measure_time(ujson.dumps, data_ujson)

        # 5️⃣ Wyświetl wyniki
        print(f"=== Wyniki dla pliku: {file} ===")
        print(f"[json]         Deserializacja: {json_deser_time:.2f} µs,  Serializacja: {json_ser_time:.2f} µs")
        print(f"[simplejson]   Deserializacja: {simplejson_deser_time:.2f} µs,  Serializacja: {simplejson_ser_time:.2f} µs")
        print(f"[ujson]        Deserializacja: {ujson_deser_time:.2f} µs,  Serializacja: {ujson_ser_time:.2f} µs")
        print()

        # 6️⃣ Zapis wyników do MetricsUploader
        uploader.add_field(f"json_deser_{file}", json_deser_time, unit="µs")
        uploader.add_field(f"json_ser_{file}", json_ser_time, unit="µs")

        uploader.add_field(f"simplejson_deser_{file}", simplejson_deser_time, unit="µs")
        uploader.add_field(f"simplejson_ser_{file}", simplejson_ser_time, unit="µs")

        uploader.add_field(f"ujson_deser_{file}", ujson_deser_time, unit="µs")
        uploader.add_field(f"ujson_ser_{file}", ujson_ser_time, unit="µs")

# Uruchom testy
run_tests()

# Zapis wyników do bazy
uploader.save_results()

print("✅ Wyniki zapisane do bazy.")
import time

start = time.time()
time.sleep(1)  # Symulacja długiego zadania
end = time.time()

print("Wynik testu:")
print(f"Czas wykonania: {end - start:.2f} sekundy")
#!/bin/bash

echo "Rozpoczynam proces uruchamiania projektu Node.js 20 w bieżącym katalogu: $(pwd)"

# Sprawdzamy, czy istnieje plik package.json
if [ ! -f "package.json" ]; then
    echo "Brak pliku package.json. Upewnij się, że uruchamiasz skrypt w katalogu projektu Node.js."
    exit 1
fi

echo "Instaluję zależności projektu..."
npm install --silent

# Instalacja lokalnej paczki MetricsUploader
echo "Instaluję lokalną paczkę MetricsUploader..."
npm install /app/npm-packages/metrics-uploader-1.0.0.tgz --silent

# Sprawdzamy, czy istnieje plik główny (np. index.js lub app.js)
if [ -f "index.js" ]; then
    MAIN_FILE="index.js"
elif [ -f "app.js" ]; then
    MAIN_FILE="app.js"
else
    echo "Nie znaleziono pliku startowego (index.js lub app.js). Upewnij się, że projekt ma główny plik wejściowy."
    exit 1
fi

echo "Uruchamiam aplikację: $MAIN_FILE"
node "$MAIN_FILE"

if [ $? -ne 0 ]; then
    echo "Błąd podczas uruchamiania aplikacji. Sprawdź logi aplikacji."
    exit 1
fi

echo "Proces zakończony pomyślnie."
#!/bin/bash

echo "Rozpoczynam proces uruchamiania projektu .NET 8 w bieżącym katalogu: $(pwd)"

# Sprawdzamy, czy plik projektu .csproj istnieje w bieżącym katalogu
CSPROJ_FILE=$(find . -maxdepth 1 -name "*.csproj" | head -n 1)
if [ -z "$CSPROJ_FILE" ]; then
    echo "Brak pliku projektu .csproj w bieżącym katalogu. Upewnij się, że uruchamiasz skrypt w katalogu projektu."
    exit 1
fi

echo "Znaleziono plik projektu: $CSPROJ_FILE. Rozpoczynam kompilację..."
dotnet add package MetricsUploader --version 1.0.0 --source "/app/nuget-packages"
dotnet restore
# Budujemy projekt
dotnet build -c Release
if [ $? -ne 0 ]; then
    echo "Błąd kompilacji projektu. Sprawdź logi kompilacji."
    exit 1
fi

# Wyodrębnij nazwę projektu (bez ścieżki i rozszerzenia)
PROJECT_NAME=$(basename "$CSPROJ_FILE" .csproj)

# Szukamy pliku DLL głównej aplikacji
DLL_FILE="./bin/Release/net8.0/${PROJECT_NAME}.dll"
if [ ! -f "$DLL_FILE" ]; then
    echo "Nie znaleziono głównego pliku DLL: $DLL_FILE. Upewnij się, że kompilacja zakończyła się poprawnie."
    exit 1
fi

echo "Uruchamiam aplikację z pliku DLL: $DLL_FILE"
dotnet "$DLL_FILE"
if [ $? -ne 0 ]; then
    echo "Błąd podczas uruchamiania aplikacji. Sprawdź logi aplikacji."
    exit 1
fi

echo "Proces zakończony pomyślnie."
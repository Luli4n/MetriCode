#!/bin/bash

echo "Sprawdzam, czy istnieje plik requirements.txt..."

if [ -f "requirements.txt" ]; then
    echo "Znaleziono requirements.txt. Instaluję zależności..."
    pip install --no-cache-dir -r requirements.txt
else
    echo "Plik requirements.txt nie istnieje. Pomijam instalację zależności."
fi

echo "Uruchamiam benchmark projektu w Pythonie..."
python3 script.py
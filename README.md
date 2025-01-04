# Projekt Analizy Wydajności API w Kontenerach z Użyciem JSON

## 📦 Opis projektu
Ten projekt to aplikacja webowa oparta na **React + TypeScript**, umożliwiająca:
- **Wgrywanie plików projektowych** w językach JavaScript, Python i C#.
- **Uruchamianie kontenerów** na podstawie wgranych plików.
- **Konfigurację endpointów API** poprzez interfejs graficzny.
- **Profilowanie zasobów** (CPU, RAM) uruchomionych kontenerów.
- **Wizualizację wyników** w formie wykresów liniowych i tabel.

## 🎯 Cele
- Prosta i intuicyjna obsługa przez użytkownika.
- Dynamiczne zarządzanie kontenerami przy użyciu **Docker + Traefik**.
- Możliwość profilowania i porównywania wydajności różnych technologii.

## 🛠️ Stos technologiczny
- **Frontend:** React + TypeScript
- **Backend:** Node.js (wstępnie, może być Python/FastAPI)
- **Zarządzanie kontenerami:** Docker, Traefik
- **Monitoring:** Prometheus, cAdvisor
- **Baza danych:** PostgreSQL lub MongoDB (do ustalenia)

## 📦 Uruchomienie projektu lokalnie
1. **Sklonuj repozytorium:**
   ```bash
   git clone <URL_REPOZYTORIUM>
   cd <NAZWA_REPOZYTORIUM>
   ```
2. **Uruchom Docker Compose:**
   ```bash
   docker-compose up --build
   ```
3. **Frontend dostępny pod:** http://localhost:3000

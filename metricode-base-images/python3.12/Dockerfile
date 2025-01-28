FROM python:3.12-slim

WORKDIR /app

# Instalacja dodatkowych zależności, jeśli potrzebne
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Ustaw skrypt uruchamiający projekt
COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh

CMD ["/bin/bash", "/app/run.sh"]
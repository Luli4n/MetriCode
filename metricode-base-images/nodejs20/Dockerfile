FROM node:20-slim

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj lokalną paczkę npm do katalogu w kontenerze
COPY metrics-uploader-1.0.0.tgz /app/npm-packages/

# Skopiuj skrypt uruchamiający
COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh

# Ustawienie domyślnego polecenia
CMD ["/bin/bash", "/app/run.sh"]
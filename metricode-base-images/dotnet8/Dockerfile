# Użyj obrazu .NET 8 jako bazowego
FROM mcr.microsoft.com/dotnet/sdk:8.0

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj lokalną paczkę NuGet do katalogu w kontenerze
COPY MetricsUploader.1.0.0.nupkg /app/nuget-packages/

# Skopiuj skrypt uruchamiający
COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh



# Ustawienie domyślnego polecenia
CMD ["/bin/bash", "/app/run.sh"]
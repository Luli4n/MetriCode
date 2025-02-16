using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using MetricsPublisher;

class Program
{
        static async Task Main()
    {
        var uploader = new MetricsUploader();

        // Dodajemy metrykę statusu testu
        uploader.AddField("test_status", "in_progress", unit: "");

        // Symulacja dłuższego zadania
        long start = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        Thread.Sleep(2000); // Symulacja długiego zadania (2 sekundy)
        long end = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        // Obliczanie czasu wykonania
        double executionTime = (end - start) / 1000.0;
        Console.WriteLine("Wynik testu:");
        Console.WriteLine($"Czas wykonania: {executionTime:F2} sekundy");

        // Dodanie metryki czasu wykonania
        uploader.AddField("execution_time", executionTime, unit: "seconds");

        // Symulacja danych szeregów czasowych (np. zmieniającego się obciążenia CPU)
        long[] timestamps = { start, start + 700, start + 1400, end };
        double[] cpuUsages = { 40.0, 50.0, 30.0, 45.0 };

        // Dodanie szeregów czasowych
        uploader.AddTimeseriesField("cpu_usage", cpuUsages, timestamps, unit: "%");

        // Zapis wyników do bazy
        await uploader.SaveResultsAsync();
    }
}
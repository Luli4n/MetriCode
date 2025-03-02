using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using MetricsPublisher;
using Newtonsoft.Json;
using System.Text.Json;

namespace JsonPerformanceTest
{
    public class SimpleModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public int Age { get; set; }
        public bool Active { get; set; }
    }

    class Program
    {
        static async Task Main()
        {
            var uploader = new MetricsUploader();

            // Pliki do przetestowania
            var files = new[] { "simple_small.json", "simple_medium.json", "simple_large.json" };
            // Liczba powtórzeń, żeby uśrednić wpływ GC, JIT itp.
            int iterations = 1000;

            foreach (var file in files)
            {
                // 1. Wczytanie pliku do pamięci
                string jsonString = File.ReadAllText(file);

                // 2. Jednorazowa deserializacja, aby uzyskać obiekty do testów serializacji
                var tempListSTJ = System.Text.Json.JsonSerializer.Deserialize<List<SimpleModel>>(jsonString);
                var tempListNewtonsoft = JsonConvert.DeserializeObject<List<SimpleModel>>(jsonString);

                // 3. Pomiar czasów zebranych w formie timeseries – zwracamy krotkę (czasy, sztuczne timestampy)
                var (timesDeserSTJ, tsDeserSTJ) = MeasureDeserializationTime_STJ_Timeseries(jsonString, iterations);
                var (timesSerSTJ, tsSerSTJ) = MeasureSerializationTime_STJ_Timeseries(tempListSTJ, iterations);
                var (timesDeserNewtonsoft, tsDeserNewtonsoft) = MeasureDeserializationTime_Newtonsoft_Timeseries(jsonString, iterations);
                var (timesSerNewtonsoft, tsSerNewtonsoft) = MeasureSerializationTime_Newtonsoft_Timeseries(tempListNewtonsoft, iterations);

                // Obliczenie średnich czasów (µs)
                double avgDeserSTJ = timesDeserSTJ.Average();
                double avgSerSTJ = timesSerSTJ.Average();
                double avgDeserNewtonsoft = timesDeserNewtonsoft.Average();
                double avgSerNewtonsoft = timesSerNewtonsoft.Average();

                // 4. Prezentacja wyników
                Console.WriteLine($"=== Wyniki dla pliku: {file} ===");
                Console.WriteLine($"[System.Text.Json]   Deserializacja: {avgDeserSTJ:F2} µs,  Serializacja: {avgSerSTJ:F2} µs");
                Console.WriteLine($"[Newtonsoft.Json]    Deserializacja: {avgDeserNewtonsoft:F2} µs,  Serializacja: {avgSerNewtonsoft:F2} µs");
                Console.WriteLine();

                // 5. Zapisywanie do metryk – średnie wartości
                uploader.AddField($"stjson_deser_{file}", avgDeserSTJ, unit: "µs");
                uploader.AddField($"stjson_ser_{file}", avgSerSTJ, unit: "µs");
                uploader.AddField($"newtonsoft_deser_{file}", avgDeserNewtonsoft, unit: "µs");
                uploader.AddField($"newtonsoft_ser_{file}", avgSerNewtonsoft, unit: "µs");

                // Zapisywanie metryk timeseries – używamy sztucznych timestampów
                uploader.AddTimeseriesField($"stjson_deser_timeseries_{file}", timesDeserSTJ.ToArray(), tsDeserSTJ.ToArray(), unit: "µs");
                uploader.AddTimeseriesField($"stjson_ser_timeseries_{file}", timesSerSTJ.ToArray(), tsSerSTJ.ToArray(), unit: "µs");
                uploader.AddTimeseriesField($"newtonsoft_deser_timeseries_{file}", timesDeserNewtonsoft.ToArray(), tsDeserNewtonsoft.ToArray(), unit: "µs");
                uploader.AddTimeseriesField($"newtonsoft_ser_timeseries_{file}", timesSerNewtonsoft.ToArray(), tsSerNewtonsoft.ToArray(), unit: "µs");
            }

            // 6. Zapis wyników
            await uploader.SaveResultsAsync();
        }

        /// <summary>
        /// Mierzy czasy deserializacji za pomocą System.Text.Json – zwraca krotkę (czasy, sztuczne timestampy) dla każdej iteracji (µs).
        /// </summary>
        static (List<double> times, List<long> timestamps) MeasureDeserializationTime_STJ_Timeseries(string json, int iterations)
        {
            var iterationTimes = new List<double>(iterations);
            var iterationTimestamps = new List<long>(iterations);

            // Pobieramy jeden bazowy timestamp
            long baseTimestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            for (int i = 0; i < iterations; i++)
            {
                long ts = baseTimestamp + i; // każdy kolejny o 1 ms później
                var sw = Stopwatch.StartNew();
                var list = System.Text.Json.JsonSerializer.Deserialize<List<SimpleModel>>(json);
                sw.Stop();

                double timeUs = (sw.ElapsedTicks / (double)Stopwatch.Frequency) * 1_000_000.0;
                iterationTimes.Add(timeUs);
                iterationTimestamps.Add(ts);
            }

            return (iterationTimes, iterationTimestamps);
        }

        /// <summary>
        /// Mierzy czasy serializacji za pomocą System.Text.Json – zwraca krotkę (czasy, sztuczne timestampy) dla każdej iteracji (µs).
        /// </summary>
        static (List<double> times, List<long> timestamps) MeasureSerializationTime_STJ_Timeseries(List<SimpleModel> data, int iterations)
        {
            var iterationTimes = new List<double>(iterations);
            var iterationTimestamps = new List<long>(iterations);

            long baseTimestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            for (int i = 0; i < iterations; i++)
            {
                long ts = baseTimestamp + i;
                var sw = Stopwatch.StartNew();
                var json = System.Text.Json.JsonSerializer.Serialize(data);
                sw.Stop();

                double timeUs = (sw.ElapsedTicks / (double)Stopwatch.Frequency) * 1_000_000.0;
                iterationTimes.Add(timeUs);
                iterationTimestamps.Add(ts);
            }

            return (iterationTimes, iterationTimestamps);
        }

        /// <summary>
        /// Mierzy czasy deserializacji za pomocą Newtonsoft.Json – zwraca krotkę (czasy, sztuczne timestampy) dla każdej iteracji (µs).
        /// </summary>
        static (List<double> times, List<long> timestamps) MeasureDeserializationTime_Newtonsoft_Timeseries(string json, int iterations)
        {
            var iterationTimes = new List<double>(iterations);
            var iterationTimestamps = new List<long>(iterations);

            long baseTimestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            for (int i = 0; i < iterations; i++)
            {
                long ts = baseTimestamp + i;
                var sw = Stopwatch.StartNew();
                var list = JsonConvert.DeserializeObject<List<SimpleModel>>(json);
                sw.Stop();

                double timeUs = (sw.ElapsedTicks / (double)Stopwatch.Frequency) * 1_000_000.0;
                iterationTimes.Add(timeUs);
                iterationTimestamps.Add(ts);
            }

            return (iterationTimes, iterationTimestamps);
        }

        /// <summary>
        /// Mierzy czasy serializacji za pomocą Newtonsoft.Json – zwraca krotkę (czasy, sztuczne timestampy) dla każdej iteracji (µs).
        /// </summary>
        static (List<double> times, List<long> timestamps) MeasureSerializationTime_Newtonsoft_Timeseries(List<SimpleModel> data, int iterations)
        {
            var iterationTimes = new List<double>(iterations);
            var iterationTimestamps = new List<long>(iterations);

            long baseTimestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            for (int i = 0; i < iterations; i++)
            {
                long ts = baseTimestamp + i;
                var sw = Stopwatch.StartNew();
                var json = JsonConvert.SerializeObject(data);
                sw.Stop();

                double timeUs = (sw.ElapsedTicks / (double)Stopwatch.Frequency) * 1_000_000.0;
                iterationTimes.Add(timeUs);
                iterationTimestamps.Add(ts);
            }

            return (iterationTimes, iterationTimestamps);
        }
    }
}
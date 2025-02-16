using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MetricsPublisher
{
    public class MetricsUploader
    {
        private readonly string _projectId;
        private readonly string _metricsApiUrl;
        private readonly string _runtime;
        private readonly Dictionary<string, Dictionary<string, object>> _fields;
        private readonly Dictionary<string, object> _timeseriesFields;
        private readonly long _timestamp; // 🕒 Timestamp for when results are saved

        public MetricsUploader()
        {
            _projectId = Environment.GetEnvironmentVariable("PROJECT_ID")
                         ?? throw new Exception("Missing environment variable: PROJECT_ID");

            // Używamy METRICS_API_URL, a jeśli nie jest ustawiony, domyślnie ustawiamy adres lokalny
            _metricsApiUrl = Environment.GetEnvironmentVariable("METRICS_API_URL")
                             ?? "http://localhost:5003/api/benchmarks";

            _runtime = Environment.GetEnvironmentVariable("RUNTIME") ?? "unknown";

            _fields = new Dictionary<string, Dictionary<string, object>>();
            _timeseriesFields = new Dictionary<string, object>();

            _timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(); // 🕒 Store timestamp at object creation
        }

        public void AddField(string name, object value, string unit = "")
        {
            _fields[name] = new Dictionary<string, object>
            {
                { "value", value },
                { "unit", unit }
            };
        }

        public void AddTimeseriesField(string name, double[] values, long[] timestamps, string unit = "")
        {
            if (values.Length != timestamps.Length)
                throw new ArgumentException("Number of values and timestamps must match.");

            var tsField = new Dictionary<string, object>
            {
                { "values", values },
                { "timestamps", timestamps },
                { "unit", unit }
            };

            _timeseriesFields[name] = tsField;
        }

        public async Task SaveResultsAsync()
        {
            var result = new Dictionary<string, object>
            {
                { "projectId", _projectId },
                { "runtime", _runtime },
                { "fields", _fields },
                { "timeseriesFields", _timeseriesFields },
                { "timestamp", _timestamp }
            };

            using (var client = new HttpClient())
            {
                var json = JsonSerializer.Serialize(result);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync(_metricsApiUrl, content);

                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Results saved for project {_projectId} at {_timestamp}.");
                }
                else
                {
                    var responseText = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Error saving metrics: {response.StatusCode} - {responseText}");
                }
            }
        }
    }
}
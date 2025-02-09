using MongoDB.Bson;
using MongoDB.Driver;

namespace MetricsPublisher;

public class MetricsUploader
{
    private readonly string _projectId;
    private readonly string _mongoUrl;
    private readonly string _mongoDbName;
    private readonly string _runtime;
    private readonly IMongoCollection<BsonDocument> _collection;

    private readonly Dictionary<string, Dictionary<string, object>> _fields;
    private readonly Dictionary<string, BsonDocument> _timeseriesFields;

    public MetricsUploader()
    {
        _projectId = Environment.GetEnvironmentVariable("PROJECT_ID") 
                     ?? throw new Exception("Brak zmiennej środowiskowej: PROJECT_ID");

        _mongoUrl = Environment.GetEnvironmentVariable("MONGO_URL") 
                    ?? throw new Exception("Brak zmiennej środowiskowej: MONGO_URL");

        _mongoDbName = Environment.GetEnvironmentVariable("MONGO_DB_NAME") 
                       ?? throw new Exception("Brak zmiennej środowiskowej: MONGO_DB_NAME");

        _runtime = Environment.GetEnvironmentVariable("RUNTIME") ?? "unknown";

        var client = new MongoClient(_mongoUrl);
        var database = client.GetDatabase(_mongoDbName);
        _collection = database.GetCollection<BsonDocument>("benchmarkResults");

        _fields = new Dictionary<string, Dictionary<string, object>>();
        _timeseriesFields = new Dictionary<string, BsonDocument>();
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
            throw new ArgumentException("Ilość wartości i timestampów musi być równa.");

        _timeseriesFields[name] = new BsonDocument
        {
            { "values", new BsonArray(values) },        // ✅ Konwersja na BsonArray
            { "timestamps", new BsonArray(timestamps) }, // ✅ Konwersja na BsonArray
            { "unit", unit }
        };
    }

    public void SaveResults()
    {
        var document = new BsonDocument
        {
            { "projectId", _projectId },
            { "runtime", _runtime },
            { "fields", _fields.ToBsonDocument() },
            { "timeseriesFields", new BsonDocument(_timeseriesFields) } // ✅ Właściwa serializacja
        };

        _collection.InsertOne(document);
        Console.WriteLine($"Wyniki zostały zapisane dla projektu {_projectId}.");
    }
}
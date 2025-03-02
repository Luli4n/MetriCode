const fs = require('fs');
const { performance } = require('perf_hooks');
const fastJson = require('fast-json-stringify');
const MetricsUploader = require('metrics-uploader');

const FILES = ["simple_small.json", "simple_medium.json", "simple_large.json"];
const ITERATIONS = 1000;

const uploader = new MetricsUploader();


function measureTime(func, arg, iterations = ITERATIONS) {
  let times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    func(arg);
    const end = performance.now();
    times.push((end - start) * 1000); // przeliczamy z ms na µs
  }
  const total = times.reduce((acc, t) => acc + t, 0);
  return total / iterations;
}

const schema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      email: { type: 'string' },
      age: { type: 'number' },
      active: { type: 'boolean' }
    },
    required: ['id', 'name', 'email', 'age', 'active']
  }
};

const fastStringify = fastJson(schema);

function runTests() {
  FILES.forEach(file => {
    if (!fs.existsSync(file)) {
      console.log(`❌ Plik ${file} nie istnieje, pomijam test.`);
      return;
    }

    // 1️⃣ Wczytaj zawartość pliku
    const jsonString = fs.readFileSync(file, 'utf8');

    // 2️⃣ Jednorazowa deserializacja do uzyskania danych
    const data = JSON.parse(jsonString);

    // 3️⃣ Testy deserializacji z użyciem JSON.parse
    const jsonParseTime = measureTime(JSON.parse, jsonString);

    // 4️⃣ Testy serializacji z użyciem JSON.stringify
    const jsonStringifyTime = measureTime(JSON.stringify, data);

    // 5️⃣ Testy serializacji z użyciem fast-json-stringify
    const fastStringifyTime = measureTime(fastStringify, data);

    // 6️⃣ Wyświetlenie wyników
    console.log(`=== Wyniki dla pliku: ${file} ===`);
    console.log(`[JSON.parse]           Deserializacja: ${jsonParseTime.toFixed(2)} µs`);
    console.log(`[JSON.stringify]       Serializacja:   ${jsonStringifyTime.toFixed(2)} µs`);
    console.log(`[fast-json-stringify]  Serializacja:   ${fastStringifyTime.toFixed(2)} µs`);
    console.log('');

    // 7️⃣ Zapis wyników do MetricsUploader
    uploader.addField(`json_parse_${file}`, jsonParseTime, "µs");
    uploader.addField(`json_stringify_${file}`, jsonStringifyTime, "µs");
    uploader.addField(`fast_stringify_${file}`, fastStringifyTime, "µs");
  });
}

runTests();

// Zapis wyników do bazy danych
uploader.saveResults();

console.log("✅ Wyniki zapisane do bazy.");
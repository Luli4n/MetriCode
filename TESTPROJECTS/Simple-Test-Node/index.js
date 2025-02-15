const MetricsUploader = require("metrics-uploader");

// Initialize
const uploader = new MetricsUploader();

// Add a static metric
uploader.addField("execution_time", 2.001, "seconds");

// Add a time series metric
const timestamps = [Date.now(), Date.now() + 500, Date.now() + 1000];
const cpuUsages = [25, 35, 20];
uploader.addTimeseriesField("cpu_usage", cpuUsages, timestamps, "%");

// Save results
uploader.saveResults();
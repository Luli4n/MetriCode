import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import TreeView from 'react-treeview';
import 'react-treeview/react-treeview.css';
import { format } from 'date-fns';
import './Dashboard.css';

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

interface Project {
  id: string;
  projectName: string;
}

interface BenchmarkResult {
  _id: string;
  projectId: string;
  timestamp: number; // w ms
  fields: Record<string, { value: any; unit: string }>;
  timeseriesFields: Record<string, { values: number[]; timestamps: number[]; unit: string }>;
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [results, setResults] = useState<BenchmarkResult[]>([]);

  const [selectedStaticMetrics, setSelectedStaticMetrics] = useState<Set<string>>(new Set());
  const [selectedTimeseriesMetrics, setSelectedTimeseriesMetrics] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/filemanager/projects`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Błąd pobierania projektów:', error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/benchmarks`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Błąd pobierania wyników:', error);
      }
    };
    fetchResults();
  }, []);

  // Pobiera nazwę projektu
  const getProjectName = (projectId: string) => {
    const p = projects.find((pr) => pr.id === projectId);
    return p ? p.projectName : `Nieznany projekt (${projectId})`;
  };

  // Grupowanie wyników wg projectId
  const resultsByProject = results.reduce<Record<string, BenchmarkResult[]>>((acc, res) => {
    if (!acc[res.projectId]) {
      acc[res.projectId] = [];
    }
    acc[res.projectId].push(res);
    return acc;
  }, {});

  // Kliknięcie w checkbox
  const handleMetricToggle = (metricKey: string, isTimeseries: boolean) => {
    if (isTimeseries) {
      setSelectedTimeseriesMetrics((prev) => {
        const newSet = new Set(prev);
        newSet.has(metricKey) ? newSet.delete(metricKey) : newSet.add(metricKey);
        return newSet;
      });
    } else {
      setSelectedStaticMetrics((prev) => {
        const newSet = new Set(prev);
        newSet.has(metricKey) ? newSet.delete(metricKey) : newSet.add(metricKey);
        return newSet;
      });
    }
  };

  /**
   * Wykres liniowy:
   * Klucz metryki ma postać: "ProjectName - <timestamp> - <tsField>"
   */
  const getLineChartData = () => {
    const datasets = Array.from(selectedTimeseriesMetrics).map((metricKey) => {
      const parts = metricKey.split(' - ');
      if (parts.length < 3) {
        // nieprawidłowy format
        return {
          label: metricKey,
          data: [],
          borderColor: 'rgba(54,162,235,1)',
          backgroundColor: 'rgba(0,0,0,0)',
        };
      }

      const [projName, rawTs, tsFieldName] = parts;
      const runTimestamp = Number(rawTs);

      // Znajdź BenchmarkResult
      const found = results.find(
        (r) => getProjectName(r.projectId) === projName && r.timestamp === runTimestamp
      );
      if (!found) {
        return {
          label: metricKey,
          data: [],
          borderColor: 'rgba(54,162,235,1)',
          backgroundColor: 'rgba(0,0,0,0)',
        };
      }

      const timeseries = found.timeseriesFields[tsFieldName];
      if (!timeseries || !timeseries.timestamps.length) {
        return {
          label: metricKey,
          data: [],
          borderColor: 'rgba(54,162,235,1)',
          backgroundColor: 'rgba(0,0,0,0)',
        };
      }

      // Budujemy dataset
      const { timestamps, values } = timeseries;
      const startTime = timestamps[0];
      const dataPoints = timestamps.map((ts, i) => ({
        x: ts - startTime,
        y: values[i] || 0,
      }));

      // Ładna etykieta: "ProjectName - CPUUsage (2025-02-09 12:54:39)"
      const dateLabel = format(new Date(runTimestamp), 'yyyy-MM-dd HH:mm:ss');
      const datasetLabel = `${projName} - ${tsFieldName} (${dateLabel})`;

      return {
        label: datasetLabel,
        data: dataPoints,
        borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        backgroundColor: 'rgba(0,0,0,0)',
      };
    });

    return { datasets };
  };

  /**
   * Wykres słupkowy:
   * Klucz metryki ma postać: "ProjectName - <timestamp> - <fieldName>"
   */
  const getBarChartData = () => {
    // etykiety w osi X
    const barLabels = Array.from(selectedStaticMetrics).map((metricKey) => {
      const parts = metricKey.split(' - ');
      if (parts.length < 3) return metricKey;

      const [projName, rawTs, fieldName] = parts;
      const runTs = Number(rawTs);
      const runDateStr = format(new Date(runTs), 'yyyy-MM-dd HH:mm:ss');

      // Podpis w osi X: "ProjectName - fieldName (2025-02-09 12:54:39)"
      return `${projName} - ${fieldName} (${runDateStr})`;
    });

    // wartości:
    const barValues = Array.from(selectedStaticMetrics).map((metricKey) => {
      const parts = metricKey.split(' - ');
      if (parts.length < 3) return 0;

      const [projName, rawTs, fieldName] = parts;
      const runTs = Number(rawTs);

      const found = results.find(
        (r) => getProjectName(r.projectId) === projName && r.timestamp === runTs
      );
      if (!found) return 0;

      return found.fields[fieldName]?.value || 0;
    });

    return {
      labels: barLabels,
      datasets: [
        {
          label: 'Wartości',
          data: barValues,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
      ],
    };
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>

      <div className="dashboard-content">
        {/* PANEL WYBORU METRYK */}
        <div className="metrics-container">
          <h3>Wybierz metryki</h3>
          {Object.entries(resultsByProject).map(([projectId, projectResults]) => {
            const projectName = getProjectName(projectId);
            return (
              <TreeView
                key={projectId}
                nodeLabel={projectName}
                defaultCollapsed={false}
              >
                {projectResults.map((result) => {
                  const dateStr = format(new Date(result.timestamp), 'yyyy-MM-dd HH:mm:ss');

                  return (
                    <TreeView
                      key={result.timestamp}
                      nodeLabel={`📅 ${dateStr}`}
                      defaultCollapsed
                    >
                      {/* Metryki statyczne */}
                      <TreeView nodeLabel="📊 Metryki statyczne" defaultCollapsed>
                        {Object.keys(result.fields).map((fieldName) => {
                          // Klucz np. "MyProject - 1675946072000 - CPUUsage"
                          const metricKey = `${projectName} - ${result.timestamp} - ${fieldName}`;
                          return (
                            <div key={metricKey} className="tree-item">
                              <input
                                type="checkbox"
                                checked={selectedStaticMetrics.has(metricKey)}
                                onChange={() => handleMetricToggle(metricKey, false)}
                              />
                              {fieldName}
                            </div>
                          );
                        })}
                      </TreeView>

                      {/* Szeregi czasowe */}
                      <TreeView nodeLabel="📈 Szeregi czasowe" defaultCollapsed>
                        {Object.keys(result.timeseriesFields).map((tsField) => {
                          const metricKey = `${projectName} - ${result.timestamp} - ${tsField}`;
                          return (
                            <div key={metricKey} className="tree-item">
                              <input
                                type="checkbox"
                                checked={selectedTimeseriesMetrics.has(metricKey)}
                                onChange={() => handleMetricToggle(metricKey, true)}
                              />
                              {tsField}
                            </div>
                          );
                        })}
                      </TreeView>
                    </TreeView>
                  );
                })}
              </TreeView>
            );
          })}
        </div>

        {/* WYKRESY */}
        <div className="charts-container">
          {/* WYKRES SŁUPKOWY (metryki statyczne) */}
          <div className="chart-container">
            <h3>Metryki statyczne</h3>
            <Bar
              data={getBarChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                  padding: {
                    bottom: 20,
                  },
                },
              }}
            />
          </div>

          {/* WYKRES LINIOWY (szeregi czasowe) */}
          <div className="chart-container">
            <h3>Szeregi czasowe</h3>
            <Line
              data={getLineChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    type: 'linear' as const,
                    title: { display: true, text: 'Czas (ms od startu)' },
                  },
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Wartość' },
                  },
                },
                layout: {
                  padding: {
                    bottom: 20,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
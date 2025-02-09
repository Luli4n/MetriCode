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
  timestamp: number;
  fields: Record<string, { value: any; unit: string }>;
  timeseriesFields: Record<string, { values: number[]; timestamps: number[]; unit: string }>;
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  
  // Zbiory wybranych metryk (checkboxów)
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

  // Pobiera nazwę projektu dla projectId
  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.projectName : `Nieznany projekt (${projectId})`;
  };

  // Grupowanie wyników wg projectId (by ładnie je wyświetlić w TreeView)
  const resultsByProject = results.reduce<Record<string, BenchmarkResult[]>>((acc, res) => {
    if (!acc[res.projectId]) {
      acc[res.projectId] = [];
    }
    acc[res.projectId].push(res);
    return acc;
  }, {});

  // Obsługa kliknięcia w checkbox
  const handleMetricToggle = (metric: string, isTimeseries: boolean) => {
    if (isTimeseries) {
      setSelectedTimeseriesMetrics((prev) => {
        const newSet = new Set(prev);
        newSet.has(metric) ? newSet.delete(metric) : newSet.add(metric);
        return newSet;
      });
    } else {
      setSelectedStaticMetrics((prev) => {
        const newSet = new Set(prev);
        newSet.has(metric) ? newSet.delete(metric) : newSet.add(metric);
        return newSet;
      });
    }
  };

  /**
   * Wykres liniowy: budujemy dataset dla każdej wybranej metryki
   * Format labela w checkboxach: "ProjectName - <timestamp> - <tsField>"
   */
  const getLineChartData = () => {
    const datasets = Array.from(selectedTimeseriesMetrics).map((metric) => {
      // Rozbijamy klucz: "NazwaProjektu - 1675946072000 - CPUUsage"
      const parts = metric.split(' - ');
      if (parts.length < 3) {
        // Jeśli format jest niewłaściwy, zwracamy pusty dataset
        return {
          label: metric,
          data: [],
          borderColor: 'rgba(54,162,235,1)',
          backgroundColor: 'rgba(0,0,0,0)',
        };
      }

      const [projectName, rawTimestamp, tsFieldName] = parts;
      const runTimestamp = Number(rawTimestamp); // np. 1675946072000

      // Znajdź właściwy BenchmarkResult
      const found = results.find(
        (r) => getProjectName(r.projectId) === projectName && r.timestamp === runTimestamp
      );
      if (!found) {
        return {
          label: metric,
          data: [],
          borderColor: 'rgba(54,162,235,1)',
          backgroundColor: 'rgba(0,0,0,0)',
        };
      }

      // Pobierz dane timeseries
      const timeseries = found.timeseriesFields[tsFieldName];
      if (!timeseries || timeseries.timestamps.length === 0) {
        return {
          label: metric,
          data: [],
          borderColor: 'rgba(54,162,235,1)',
          backgroundColor: 'rgba(0,0,0,0)',
        };
      }
      const { timestamps, values } = timeseries;

      // Standaryzacja - pierwszy punkt = x=0
      const startTime = timestamps[0];
      const dataPoints = timestamps.map((ts, i) => ({
        x: ts - startTime,
        y: values[i] || 0,
      }));

      // Dodaj date/time w labelu na wykresie
      const runDateStr = format(new Date(runTimestamp), 'yyyy-MM-dd HH:mm:ss');
      const datasetLabel = `${tsFieldName} (${runDateStr})`;

      return {
        label: datasetLabel,
        data: dataPoints,
        borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        backgroundColor: 'rgba(0,0,0,0)',
      };
    });

    return { datasets };
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

          {Object.entries(resultsByProject).map(([projectId, projectResults]) => (
            <TreeView
              key={projectId}
              nodeLabel={getProjectName(projectId)}
              defaultCollapsed={false}
            >
              {projectResults.map((result) => {
                // Data w formacie czytelnym
                const dateStr = format(new Date(result.timestamp), 'yyyy-MM-dd HH:mm:ss');

                return (
                  <TreeView
                    key={result.timestamp}
                    nodeLabel={`📅 ${dateStr}`}
                    defaultCollapsed
                  >
                    {/* Metryki statyczne */}
                    <TreeView nodeLabel="📊 Metryki statyczne" defaultCollapsed>
                      {Object.keys(result.fields).map((field) => {
                        // Klucz checkboxa: "NazwaProjektu - 1675946072000 - CPUUsage"
                        const label = `${getProjectName(result.projectId)} - ${result.timestamp} - ${field}`;
                        return (
                          <div key={label} className="tree-item">
                            <input
                              type="checkbox"
                              checked={selectedStaticMetrics.has(label)}
                              onChange={() => handleMetricToggle(label, false)}
                            />
                            {field} ({dateStr})
                          </div>
                        );
                      })}
                    </TreeView>

                    {/* Szeregi czasowe */}
                    <TreeView nodeLabel="📈 Szeregi czasowe" defaultCollapsed>
                      {Object.keys(result.timeseriesFields).map((tsField) => {
                        const label = `${getProjectName(result.projectId)} - ${result.timestamp} - ${tsField}`;
                        return (
                          <div key={label} className="tree-item">
                            <input
                              type="checkbox"
                              checked={selectedTimeseriesMetrics.has(label)}
                              onChange={() => handleMetricToggle(label, true)}
                            />
                            {tsField} ({dateStr})
                          </div>
                        );
                      })}
                    </TreeView>
                  </TreeView>
                );
              })}
            </TreeView>
          ))}
        </div>

        {/* WYKRESY */}
        <div className="charts-container">
          {/* WYKRES SŁUPKOWY (METRYKI STATYCZNE) */}
          <div className="chart-container">
            <h3>Metryki statyczne</h3>
            <Bar
              data={{
                // Nazwy to całe klucze (zawierające timestamp),
                // ale można je wyświetlić w legendzie 1:1, 
                // lub parsować w "ticks.callback" w options. 
                // Tu uprościmy i zostawimy klucze wprost.
                labels: Array.from(selectedStaticMetrics),
                datasets: [
                  {
                    label: 'Wartości',
                    data: Array.from(selectedStaticMetrics).map((metric) => {
                      const parts = metric.split(' - ');
                      if (parts.length < 3) return 0;

                      const [projectName, rawTimestamp, fieldName] = parts;
                      const runTimestamp = Number(rawTimestamp);

                      // Znajdź pasujący result
                      const found = results.find(
                        (r) => getProjectName(r.projectId) === projectName && r.timestamp === runTimestamp
                      );
                      if (!found) return 0;

                      return found.fields[fieldName]?.value || 0;
                    }),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                  },
                ],
              }}
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

          {/* WYKRES LINIOWY (SZEREGI CZASOWE) */}
          <div className="chart-container">
            <h3>Szeregi czasowe</h3>
            <Line
              data={getLineChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    // linear => czas od startu w ms
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
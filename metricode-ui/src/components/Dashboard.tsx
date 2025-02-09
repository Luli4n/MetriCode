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

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.projectName : `Nieznany projekt (${projectId})`;
  };

  // Pogrupuj results wg projectId
  const resultsByProject = results.reduce<Record<string, BenchmarkResult[]>>((acc, res) => {
    if (!acc[res.projectId]) {
      acc[res.projectId] = [];
    }
    acc[res.projectId].push(res);
    return acc;
  }, {});

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

  const getLineChartData = () => {
    const datasets = Array.from(selectedTimeseriesMetrics).map((metric) => {
      const [projectName, tsFieldName] = metric.split(' - ');
      const found = results.find((r) => getProjectName(r.projectId) === projectName);
      if (!found) {
        return {
          label: metric,
          data: [],
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(0, 0, 0, 0)',
        };
      }
      const timeseries = found.timeseriesFields[tsFieldName];
      if (!timeseries) {
        return {
          label: metric,
          data: [],
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(0,0,0,0)',
        };
      }

      const { timestamps, values } = timeseries;
      if (!timestamps.length) {
        return {
          label: metric,
          data: [],
          borderColor: 'rgba(54,162,235,1)',
          backgroundColor: 'rgba(0,0,0,0)',
        };
      }
      const startTime = timestamps[0];

      const dataPoints = timestamps.map((ts, i) => ({
        x: ts - startTime,
        y: values[i] || 0,
      }));

      return {
        label: metric,
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
              {projectResults.map((result) => (
                <TreeView
                  key={result.timestamp}
                  nodeLabel={`📅 ${format(new Date(result.timestamp), 'yyyy-MM-dd HH:mm:ss')}`}
                  defaultCollapsed
                >
                  <TreeView nodeLabel="📊 Metryki statyczne" defaultCollapsed>
                    {Object.keys(result.fields).map((field) => {
                      const label = `${getProjectName(result.projectId)} - ${field}`;
                      return (
                        <div key={label} className="tree-item">
                          <input
                            type="checkbox"
                            checked={selectedStaticMetrics.has(label)}
                            onChange={() => handleMetricToggle(label, false)}
                          />
                          {field}
                        </div>
                      );
                    })}
                  </TreeView>

                  <TreeView nodeLabel="📈 Szeregi czasowe" defaultCollapsed>
                    {Object.keys(result.timeseriesFields).map((tsField) => {
                      const label = `${getProjectName(result.projectId)} - ${tsField}`;
                      return (
                        <div key={label} className="tree-item">
                          <input
                            type="checkbox"
                            checked={selectedTimeseriesMetrics.has(label)}
                            onChange={() => handleMetricToggle(label, true)}
                          />
                          {tsField}
                        </div>
                      );
                    })}
                  </TreeView>
                </TreeView>
              ))}
            </TreeView>
          ))}
        </div>

        {/* WYKRESY */}
        <div className="charts-container">
          <div className="chart-container">
            <h3>Metryki statyczne</h3>
            <Bar
              data={{
                labels: Array.from(selectedStaticMetrics),
                datasets: [
                  {
                    label: 'Wartości',
                    data: Array.from(selectedStaticMetrics).map((metric) => {
                      const [projectName, fieldName] = metric.split(' - ');
                      const dataset = results.find(
                        (r) => getProjectName(r.projectId) === projectName
                      );
                      return dataset?.fields[fieldName]?.value || 0;
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
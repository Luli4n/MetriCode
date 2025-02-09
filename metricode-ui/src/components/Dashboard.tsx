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
    const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set());
    const [standardizeTime, setStandardizeTime] = useState<boolean>(true);

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

    const handleMetricToggle = (metric: string) => {
        setSelectedMetrics(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(metric)) {
                newSelection.delete(metric);
            } else {
                newSelection.add(metric);
            }
            return newSelection;
        });
    };

    const normalizeTimestamps = (timestamps: number[], startTime?: number) => {
        if (standardizeTime && startTime) {
            return timestamps.map(ts => ts - startTime);
        }
        return timestamps.map(ts => new Date(ts));
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <label>
                    <input
                        type="checkbox"
                        checked={standardizeTime}
                        onChange={() => setStandardizeTime(!standardizeTime)}
                    />
                    Standaryzuj czas
                </label>
            </header>

            <div className="dashboard-content">
                {/* 📌 TREE VIEW */}
                <div className="metrics-container">
                    <h3>Wybierz metryki</h3>
                    {results.map((result) => (
                        <TreeView
                            key={result.projectId}
                            nodeLabel={getProjectName(result.projectId)}
                            defaultCollapsed={false}
                        >
                            <TreeView 
                                nodeLabel={`📅 ${format(new Date(result.timestamp), 'yyyy-MM-dd HH:mm:ss')}`} 
                                defaultCollapsed={false}
                            >
                                <TreeView nodeLabel="📊 Metryki statyczne" defaultCollapsed={true}>
                                    {Object.keys(result.fields).map((field) => {
                                        const label = `${getProjectName(result.projectId)} - ${result.timestamp} - ${field}`;
                                        return (
                                            <div key={label} className="tree-item">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMetrics.has(label)}
                                                    onChange={() => handleMetricToggle(label)}
                                                />
                                                {field}
                                            </div>
                                        );
                                    })}
                                </TreeView>

                                <TreeView nodeLabel="📈 Szeregi czasowe" defaultCollapsed={true}>
                                    {Object.keys(result.timeseriesFields).map((tsField) => {
                                        const label = `${getProjectName(result.projectId)} - ${result.timestamp} - ${tsField}`;
                                        return (
                                            <div key={label} className="tree-item">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMetrics.has(label)}
                                                    onChange={() => handleMetricToggle(label)}
                                                />
                                                {tsField}
                                            </div>
                                        );
                                    })}
                                </TreeView>
                            </TreeView>
                        </TreeView>
                    ))}
                </div>

                {/* 📌 CHARTS */}
                <div className="charts-container">
                    <div className="chart-container">
                        <h3>Metryki statyczne</h3>
                        <Bar
                            data={{
                                labels: Array.from(selectedMetrics).filter(metric =>
                                    results.some(r => r.fields[metric.split(' - ')[2]])
                                ),
                                datasets: [{
                                    label: 'Wartości',
                                    data: Array.from(selectedMetrics).map(metric => {
                                        const [projectName, timestamp, fieldName] = metric.split(' - ');
                                        const dataset = results.find(r => 
                                            getProjectName(r.projectId) === projectName &&
                                            r.timestamp.toString() === timestamp
                                        );
                                        return dataset?.fields[fieldName]?.value || 0;
                                    }),
                                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                }],
                            }}
                        />
                    </div>

                    <div className="chart-container">
                        <h3>Szeregi czasowe</h3>
                        <Line
                            data={{
                                labels: Array.from(selectedMetrics).map(metric => {
                                    const [projectName, timestamp, tsFieldName] = metric.split(' - ');
                                    const dataset = results.find(r => 
                                        getProjectName(r.projectId) === projectName &&
                                        r.timestamp.toString() === timestamp
                                    );
                                    if (!dataset) return [];
                                    const timestamps = dataset.timeseriesFields[tsFieldName]?.timestamps || [];
                                    return normalizeTimestamps(timestamps, standardizeTime ? timestamps[0] : undefined);
                                }).flat(),
                                datasets: Array.from(selectedMetrics)
                                    .filter(metric => results.some(r => r.timeseriesFields[metric.split(' - ')[2]]))
                                    .map((metric, index) => {
                                        const [projectName, timestamp, tsFieldName] = metric.split(' - ');
                                        const dataset = results.find(r => 
                                            getProjectName(r.projectId) === projectName &&
                                            r.timestamp.toString() === timestamp
                                        );
                                        const tsData = dataset?.timeseriesFields[tsFieldName];
                                        if (!tsData) return null;

                                        return {
                                            label: `${projectName} - ${tsFieldName}`,
                                            data: tsData.values,
                                            borderColor: ['red', 'blue', 'green', 'purple'][index % 4],
                                            fill: false,
                                            tension: 0,
                                        };
                                    }).filter(Boolean),
                            }}
                            options={{
                                responsive: true,
                                scales: {
                                    x: {
                                        type: standardizeTime ? 'linear' : 'time',
                                        title: { display: true, text: standardizeTime ? 'Czas (ms)' : 'Czas' }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
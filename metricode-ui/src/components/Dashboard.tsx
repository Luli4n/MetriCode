import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import TreeView from 'react-treeview';
import 'react-treeview/react-treeview.css';
import './Dashboard.css';

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

interface Project {
    id: string;
    projectName: string;
}

interface BenchmarkResult {
    _id: string;
    projectId: string;
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

    const normalizeTimestamps = (timestamps?: number[]) => {
        if (!timestamps || timestamps.length === 0) return [];
        if (!standardizeTime) return timestamps;
        const startTime = timestamps[0];
        return timestamps.map(ts => ts - startTime);
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
                            <TreeView nodeLabel="Metryki statyczne" defaultCollapsed={false}>
                                {Object.keys(result.fields).map((field) => {
                                    const label = `${getProjectName(result.projectId)} - ${field}`;
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

                            <TreeView nodeLabel="Szeregi czasowe" defaultCollapsed={false}>
                                {Object.keys(result.timeseriesFields).map((tsField) => {
                                    const label = `${getProjectName(result.projectId)} - ${tsField}`;
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
                    ))}
                </div>

                {/* 📌 CHARTS */}
                <div className="charts-container">
                    <div className="chart-container">
                        <h3>Metryki statyczne</h3>
                        <Bar
                            data={{
                                labels: Array.from(selectedMetrics).filter(metric =>
                                    results.some(r => r.fields[metric.split(' - ')[1]])
                                ),
                                datasets: [{
                                    label: 'Wartości',
                                    data: Array.from(selectedMetrics).map(metric => {
                                        const [projectName, fieldName] = metric.split(' - ');
                                        const dataset = results.find(r => getProjectName(r.projectId) === projectName);
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
                                labels: results.length > 0
                                    ? normalizeTimestamps(
                                        results[0].timeseriesFields[Array.from(selectedMetrics)[0]?.split(' - ')[1]]?.timestamps
                                    )
                                    : [],
                                datasets: Array.from(selectedMetrics)
                                    .filter(metric => results.some(r => r.timeseriesFields[metric.split(' - ')[1]]))
                                    .map((metric, index) => {
                                        const [projectName, tsFieldName] = metric.split(' - ');
                                        const dataset = results.find(r => getProjectName(r.projectId) === projectName);
                                        return {
                                            label: metric,
                                            data: dataset ? dataset.timeseriesFields[tsFieldName].values : [],
                                            borderColor: ['red', 'blue', 'green', 'purple'][index % 4],
                                            fill: false,
                                        };
                                    }),
                            }}
                            options={{
                                responsive: true,
                                scales: {
                                    x: {
                                        type: 'linear',
                                        title: { display: true, text: 'Czas (ms)' }
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
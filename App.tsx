import React, { useState } from 'react';
import { Upload, FileText, BarChart2, Activity } from 'lucide-react';
import { parseCSV, getDemoData } from './utils/csvParser';
import { SensorDataPoint, ViewMode } from './types';
import Dashboard from './components/Dashboard';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.UPLOAD);
  const [data, setData] = useState<SensorDataPoint[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedData = parseCSV(text);
        if (parsedData.length === 0) {
          setError("No valid data found in file. Please check the format.");
          return;
        }
        setData(parsedData);
        setFileName(file.name);
        setViewMode(ViewMode.DASHBOARD);
        setError(null);
      } catch (err) {
        setError("Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv' || file.name.endsWith('.csv') || file.type === 'text/plain') {
      processFile(file);
    } else {
      setError("Please upload a CSV or Text file.");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const loadDemo = () => {
    const demoText = getDemoData();
    const parsedData = parseCSV(demoText);
    setData(parsedData);
    setFileName("demo_sensor_data.csv");
    setViewMode(ViewMode.DASHBOARD);
  };

  if (viewMode === ViewMode.DASHBOARD) {
    return <Dashboard data={data} fileName={fileName} onReset={() => setViewMode(ViewMode.UPLOAD)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-900/50 text-indigo-400 mb-4">
            <Activity size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SensorTrend Pro</h1>
          <p className="text-gray-400">Industrial Time-Series Visualization & Analysis</p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ease-out
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-900/20 scale-105' 
              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }
          `}
        >
          <input
            type="file"
            accept=".csv,.txt"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleFileInput}
          />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`p-4 rounded-full bg-gray-700 text-gray-300`}>
              <Upload size={32} />
            </div>
            <div>
              <p className="text-lg font-medium text-white">Drop your CSV file here</p>
              <p className="text-sm text-gray-500 mt-1">or click to browse</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-4">
          <span className="h-px w-16 bg-gray-800"></span>
          <span className="text-gray-500 text-sm uppercase tracking-wider">Or try demo</span>
          <span className="h-px w-16 bg-gray-800"></span>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={loadDemo}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-all hover:shadow-lg group"
          >
            <BarChart2 size={20} className="text-indigo-400 group-hover:text-indigo-300" />
            <span>Load Demo Data</span>
          </button>
        </div>
        
        <div className="mt-12 text-center">
            <p className="text-xs text-gray-600">
                Supports standard CSV formats with headers for Timestamp, Velocity (X/Y/Z), Temp, Pressure, Acoustics.
            </p>
        </div>
      </div>
    </div>
  );
}

export default App;
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine
} from 'recharts';
import { SensorDataPoint, DataSummary } from '../types';
import ChartCard from './ChartCard';
import AIInsights from './AIInsights';
import { format } from 'date-fns';

interface DashboardProps {
  data: SensorDataPoint[];
  fileName: string;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, fileName, onReset }) => {
  
  const summary: DataSummary = useMemo(() => {
    if (data.length === 0) return { totalPoints: 0, startTime: '', endTime: '', maxVelocity: 0, avgTemp: 0, anomalies: 0 };
    
    const maxVel = Math.max(...data.map(d => Math.max(d.velX, d.velY, d.velZ)));
    const totalTemp = data.reduce((sum, d) => sum + d.ambientTemp, 0);
    // Simple anomaly threshold: > 10mm/s RMS is often considered 'Rough' or 'Very Rough' for ISO 10816 Class I/II
    const anomalies = data.filter(d => Math.max(d.velX, d.velY, d.velZ) > 10).length;

    return {
      totalPoints: data.length,
      startTime: data[0].dateStr,
      endTime: data[data.length - 1].dateStr,
      maxVelocity: maxVel,
      avgTemp: totalTemp / data.length,
      anomalies
    };
  }, [data]);

  const formatXAxis = (tickItem: number) => {
    return format(new Date(tickItem), 'MM/dd HH:mm');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-lg text-xs">
          <p className="font-bold mb-2 text-gray-300">{format(new Date(label), 'MMM dd, yyyy HH:mm:ss')}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-gray-400">{entry.name}:</span>
              <span className="font-mono text-gray-100">{entry.value.toFixed(3)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">SensorTrend Pro</h1>
          <p className="text-xs text-gray-500 mt-1">File: {fileName} | Points: {summary.totalPoints.toLocaleString()}</p>
        </div>
        <div className="flex gap-3">
           <div className="bg-gray-800 px-3 py-1 rounded border border-gray-700 text-xs">
             <span className="text-gray-400 block">Max Velocity</span>
             <span className={`font-bold ${summary.maxVelocity > 10 ? 'text-red-400' : 'text-green-400'}`}>
               {summary.maxVelocity.toFixed(2)} mm/s
             </span>
           </div>
           <button 
             onClick={onReset}
             className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
           >
             Upload New File
           </button>
        </div>
      </header>

      <main className="px-6 py-6 max-w-8xl mx-auto">
        
        <AIInsights summary={summary} data={data} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Vibration Chart */}
          <div className="col-span-1 lg:col-span-2">
            <ChartCard title="Vibration Velocity (RMS)">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} syncId="sensorSync">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    type="number" 
                    domain={['dataMin', 'dataMax']} 
                    tickFormatter={formatXAxis}
                    stroke="#9CA3AF"
                    tick={{fontSize: 11}}
                  />
                  <YAxis stroke="#9CA3AF" label={{ value: 'mm/s', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <ReferenceLine y={10} label="Warning" stroke="red" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="velX" name="X-Axis (Radial)" stroke="#F87171" dot={false} strokeWidth={1.5} />
                  <Line type="monotone" dataKey="velY" name="Y-Axis (Axial)" stroke="#60A5FA" dot={false} strokeWidth={1.5} />
                  <Line type="monotone" dataKey="velZ" name="Z-Axis (Vertical)" stroke="#34D399" dot={false} strokeWidth={1.5} />
                  <Brush dataKey="timestamp" height={30} stroke="#4B5563" fill="#1F2937" tickFormatter={formatXAxis} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Acoustics */}
          <ChartCard title="Acoustics (dB SPL)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} syncId="sensorSync">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  type="number" 
                  domain={['dataMin', 'dataMax']} 
                  tickFormatter={formatXAxis}
                  stroke="#9CA3AF"
                  tick={{fontSize: 11}}
                />
                <YAxis stroke="#9CA3AF" domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="acoustics" name="Noise Level" stroke="#FBBF24" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Temperature */}
          <ChartCard title="Temperature Comparison">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} syncId="sensorSync">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  type="number" 
                  domain={['dataMin', 'dataMax']} 
                  tickFormatter={formatXAxis}
                  stroke="#9CA3AF"
                  tick={{fontSize: 11}}
                />
                <YAxis stroke="#9CA3AF" domain={['auto', 'auto']} unit="°C" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="ambientTemp" name="Ambient" stroke="#A78BFA" dot={false} />
                <Line type="monotone" dataKey="surfaceTemp" name="Surface" stroke="#FB923C" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Pressure & Humidity */}
          <ChartCard title="Pressure & Humidity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} syncId="sensorSync">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  type="number" 
                  domain={['dataMin', 'dataMax']} 
                  tickFormatter={formatXAxis}
                  stroke="#9CA3AF"
                  tick={{fontSize: 11}}
                />
                <YAxis yAxisId="left" stroke="#9CA3AF" label={{ value: 'hPa', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} domain={['auto', 'auto']} />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" label={{ value: '%RH', angle: 90, position: 'insideRight', fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="pressure" name="Pressure" stroke="#2DD4BF" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity" stroke="#38BDF8" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
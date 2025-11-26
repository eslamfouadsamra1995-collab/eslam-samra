import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { DataSummary, SensorDataPoint } from '../types';
import { generateDataInsights } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIInsightsProps {
  summary: DataSummary;
  data: SensorDataPoint[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ summary, data }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    // Find top 5 peaks based on max of X, Y, or Z
    const peaks = [...data]
      .sort((a, b) => Math.max(b.velX, b.velY, b.velZ) - Math.max(a.velX, a.velY, a.velZ))
      .slice(0, 5);
    
    const result = await generateDataInsights(summary, peaks);
    setInsights(result);
    setLoading(false);
  };

  // Generate automatically on mount if detected anomalies are high
  useEffect(() => {
    if (summary.anomalies > 0 && !insights) {
        // We don't auto-call here to save cost, user must click.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-gray-800 border border-indigo-500/30 rounded-xl shadow-lg p-6 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={100} className="text-indigo-400" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-400" />
            <h2 className="text-xl font-bold text-white">AI Trend Analysis</h2>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? <RefreshCw className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {loading ? 'Analyzing...' : insights ? 'Regenerate Insights' : 'Analyze Trends'}
          </button>
        </div>

        {insights ? (
          <div className="prose prose-invert max-w-none prose-sm">
            <ReactMarkdown>{insights}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-gray-400 text-sm">
            <p className="mb-2">Gemini 2.5 Flash can analyze your vibration and environmental data to detect fault patterns.</p>
            {summary.anomalies > 0 && (
                <div className="flex items-center gap-2 text-amber-400 mt-2">
                    <AlertTriangle size={16} />
                    <span>{summary.anomalies} Significant anomalies detected in uploaded data. Analysis recommended.</span>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
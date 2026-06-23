import { useState } from 'react';
import { Activity, ShieldCheck, Loader2 } from 'lucide-react';
import apiClient from '../api/axios';

const AiAnalyzer = () => {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/ai/analyze');
      setAnalysis(res.data.analysis); // { health_score, analysis: text }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze portfolio.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">AI Portfolio Analyzer</h1>
        <p className="text-slate-500">Deep-dive structural analysis of your holdings.</p>
      </div>

      {!analysis && !isLoading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Activity size={48} className="mx-auto mb-4 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to evaluate your portfolio?</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Our AI engine will calculate your Herfindahl-Hirschman Index (HHI) for sector concentration and provide actionable diversification strategies.</p>
          <button onClick={runAnalysis} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition">
            Run Full Analysis
          </button>
          {error && <p className="text-red-500 mt-4 font-medium">{error}</p>}
        </div>
      )}

      {isLoading && (
        <div className="h-64 flex flex-col items-center justify-center text-indigo-600">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Calculating concentration algorithms...</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Health Score</h2>
              <p className="text-sm text-slate-500">Based on sector diversification</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-emerald-600">{analysis.health_score}/100</span>
              <ShieldCheck size={32} className="text-emerald-600" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
             {/* The LLM returns Markdown, so we render it simply using pre-wrap */}
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
              {analysis.analysis}
            </div>
            
            <button onClick={runAnalysis} className="mt-8 text-indigo-600 font-medium hover:underline">
              Recalculate Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAnalyzer;
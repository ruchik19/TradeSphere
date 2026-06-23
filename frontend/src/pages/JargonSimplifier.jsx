import { useState } from 'react';
import { BookOpen, Search, Lightbulb, Target, AlertTriangle, Loader2 } from 'lucide-react';
import apiClient from '../api/axios';

const JargonSimplifier = () => {
  const [term, setTerm] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimplify = async (e) => {
    e.preventDefault();
    if (!term) return;
    setIsLoading(true);
    try {
      const res = await apiClient.post('/ai/simplify', { term });
      setResult(res.data.explanation); // Expecting { definition, analogy, why_it_matters }
    } catch (error) {
      console.error("Simplifier error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Jargon Simplifier</h1>
        <p className="text-slate-500">Wall Street language translated into plain English.</p>
      </div>

      <form onSubmit={handleSimplify} className="relative max-w-2xl mx-auto mb-12">
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="E.g., Quantitative Easing, EBITDA, Bear Market..."
          className="w-full pl-12 pr-32 py-4 rounded-2xl border border-slate-200 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
        <Search size={24} className="absolute left-4 top-4 text-slate-400" />
        <button type="submit" disabled={isLoading} className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-6 rounded-xl font-medium hover:bg-slate-800 transition flex items-center gap-2">
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Simplify'}
        </button>
      </form>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold"><Target size={20} /> Definition</div>
            <p className="text-slate-700 leading-relaxed">{result.definition}</p>
          </div>
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-amber-500 font-bold"><Lightbulb size={20} /> Analogy</div>
            <p className="text-slate-700 leading-relaxed">{result.analogy}</p>
          </div>
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-emerald-600 font-bold"><AlertTriangle size={20} /> Why It Matters</div>
            <p className="text-slate-700 leading-relaxed">{result.why_it_matters}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JargonSimplifier;
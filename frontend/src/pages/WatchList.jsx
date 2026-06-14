// src/pages/Watchlist.jsx
import { useState, useEffect } from 'react';
import { Star, Trash2, Search, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import apiClient from '../api/axios';

const Watchlist = () => {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isToggling, setIsToggling] = useState(false);

  const fetchWatchlistData = async () => {
    try {
      // 1. Get the array of tickers (e.g., ["TCS.NS", "RELIANCE.NS"])
      const res = await apiClient.get('/watchlist');
      const tickers = res.data.watchlist;

      // 2. Fetch live data for each ticker
      const liveData = await Promise.all(
        tickers.map(async (ticker) => {
          const quoteRes = await apiClient.get(`/market/quote/${ticker}`);
          return quoteRes.data.data;
        })
      );
      setQuotes(liveData);
    } catch (error) {
      console.error("Watchlist fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlistData();
  }, []);

  const handleToggle = async (tickerToToggle) => {
    if (!tickerToToggle) return;
    setIsToggling(true);
    try {
      await apiClient.post('/watchlist/toggle', { ticker: tickerToToggle.toUpperCase() });
      setSearch('');
      await fetchWatchlistData(); // Refresh the list
    } catch (error) {
      console.error("Toggle error:", error);
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-indigo-600">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading your watchlist...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Watchlist</h1>
        <p className="text-slate-500">Quick monitoring of your favourite tickers.</p>
      </div>

      {/* Add to Watchlist Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Add a ticker (e.g., INFY.NS)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleToggle(search)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
        </div>
        <button 
          onClick={() => handleToggle(search)}
          disabled={isToggling || !search}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {isToggling ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} />}
          Add
        </button>
      </div>

      {/* Watchlist Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {quotes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Star size={48} className="mx-auto mb-4 opacity-20" />
            <p>Your watchlist is empty. Add a stock to start tracking it.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {quotes.map((asset) => {
              const isUp = asset.dayChange >= 0;
              return (
                <div key={asset.symbol} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{asset.symbol.replace('.NS', '')}</h3>
                    <p className="text-sm text-slate-500">{asset.companyName}</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <h3 className="font-bold text-slate-900 text-lg">
                        ₹{asset.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </h3>
                      <p className={`text-sm font-semibold flex items-center justify-end gap-1 ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {isUp ? '+' : ''}{asset.dayChangePercent?.toFixed(2)}%
                      </p>
                    </div>
                    <button 
                      onClick={() => handleToggle(asset.symbol)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from Watchlist"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
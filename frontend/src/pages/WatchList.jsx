import { useState, useEffect } from 'react';
import { Star, Trash2, Search, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import apiClient from '../api/axio.js';

const Watchlist = () => {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isToggling, setIsToggling] = useState(false);

  const fetchWatchlistData = async () => {
    try {
      const dbRes = await apiClient.get('/watchlist');
      const tickers = dbRes.data.watchlist;

      if (!tickers || tickers.length === 0) {
        setQuotes([]); 
        return;
      }

      const liveDataPromises = tickers.map(async (ticker) => {
        try {
          const res = await apiClient.get(`/market/quote/${ticker}`);
          const actualStockData = res.data.quote || res.data.data || res.data;
          
          // Force the object to remember its original database name!
          return { ...actualStockData, dbTicker: ticker }; 
        } catch (error) {
          console.warn(`Could not fetch data for ${ticker}.`);
          return { 
            symbol: ticker, 
            dbTicker: ticker, // Remember it here too
            companyName: 'Unknown or Invalid Stock',
            currentPrice: 0, 
            dayChange: 0,
            dayChangePercent: 0,
            invalid: true 
          };
        }
      });

      const finalWatchlist = await Promise.all(liveDataPromises);
      setQuotes(finalWatchlist);

    } catch (error) {
      console.error("Watchlist fetch error:", error);
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    fetchWatchlistData();
  }, []);

  const handleAdd = async (tickerToAdd) => {
    if (!tickerToAdd) return;
    setIsToggling(true);
    try {
      await apiClient.post('/watchlist', { ticker: tickerToAdd });
      setSearch('');
      await fetchWatchlistData(); 
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to add ticker";
      alert(errorMsg); 
      console.error("Add error:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleRemove = async (tickerToRemove) => {
    if (!tickerToRemove) return;
    setIsToggling(true);
    try {
      await apiClient.delete(`/watchlist/${tickerToRemove}`);
      await fetchWatchlistData(); 
    } catch (error) {
      try {
        await apiClient.delete('/watchlist', { data: { ticker: tickerToRemove } });
        await fetchWatchlistData();
      } catch (innerError) {
        const errorMsg = innerError.response?.data?.error || "Failed to remove ticker";
        alert(errorMsg); 
        console.error("Remove error:", innerError);
      }
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

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Add a ticker (e.g., INFY.NS)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd(search)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
        </div>
        <button 
          onClick={() => handleAdd(search)}
          disabled={isToggling || !search}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {isToggling ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} />}
          Add
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {quotes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Star size={48} className="mx-auto mb-4 opacity-20" />
            <p>Your watchlist is empty. Add a stock to start tracking it.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {quotes.map((asset, index) => {
              const isUp = (asset.dayChange || 0) >= 0; 
              const displayName = asset.symbol || asset.ticker || 'UNKNOWN';

              return (
                <div key={asset.symbol || index} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {displayName.replace('.NS', '')}
                    </h3>
                    <p className="text-sm text-slate-500">{asset.companyName || 'Unknown Company'}</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <h3 className="font-bold text-slate-900 text-lg">
                        ₹{(asset.currentPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </h3>
                      <p className={`text-sm font-semibold flex items-center justify-end gap-1 ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {isUp ? '+' : ''}{(asset.dayChangePercent || 0).toFixed(2)}%
                      </p>
                    </div>
                    <button 
                      onClick={() => handleRemove(asset.dbTicker)} // Strictly uses dbTicker for deletion
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

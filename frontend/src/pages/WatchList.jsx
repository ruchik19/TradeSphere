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
      // 1. Get the list of tickers from the database
      const dbRes = await apiClient.get('/watchlist');
      const tickers = dbRes.data.watchlist;

      if (!tickers || tickers.length === 0) {
        setQuotes([]); // FIX 1: Changed setWatchlist to setQuotes
        return;
      }

      // 2. Fetch live data for each ticker, but bulletproof it!
      const liveDataPromises = tickers.map(async (ticker) => {
        try {
          const res = await apiClient.get(`/market/quote/${ticker}`);
          
          // 1. THIS WILL REVEAL THE SECRET STRUCTURE IN YOUR CONSOLE
          console.log(`Raw data for ${ticker}:`, res.data); 
          
          // 2. Safely unwrap it! If your backend wraps it in 'quote' or 'data', this grabs it.
          // If it doesn't, it just returns res.data normally.
          const actualStockData = res.data.quote || res.data.data || res.data;
          
          return actualStockData;
        } catch (error) {
          console.warn(`Could not fetch data for ${ticker}. It might be invalid.`);
          
          // FIX 3: Dummy object now perfectly matches your JSX variables!
          return { 
            symbol: ticker, 
            companyName: 'Unknown or Invalid Stock',
            currentPrice: 0, 
            dayChange: 0,
            dayChangePercent: 0,
            invalid: true 
          };
        }
      });

      // 3. Wait for all of them to finish
      const finalWatchlist = await Promise.all(liveDataPromises);
      setQuotes(finalWatchlist); // FIX 1: Changed setWatchlist to setQuotes

    } catch (error) {
      console.error("Watchlist fetch error:", error);
    } finally {
      // FIX 2: This guarantees the loading spinner turns off when fetching is done!
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
      // Look closely at this line: we changed 'tickerInput' to 'tickerToToggle'
      await apiClient.post('/watchlist', { ticker: tickerToToggle });
      
      setSearch('');
      await fetchWatchlistData(); // Refresh the list
    } catch (error) {
      // Extract the error message your Node backend sent, and pop it up on the screen!
      const errorMsg = error.response?.data?.error || "Failed to add ticker";
      alert(errorMsg); 
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
            {quotes.map((asset, index) => {
              // Safety fallback: ensure dayChange has a default value
              const isUp = (asset.dayChange || 0) >= 0; 
              
              // Determine the safest name to display
              const displayName = asset.symbol || asset.ticker || 'UNKNOWN';

              return (
                // Use index as a fallback key if symbol is completely missing
                <div key={asset.symbol || index} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    {/* Safely run .replace() on our guaranteed displayName */}
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
                      onClick={() => handleToggle(asset.symbol || asset.ticker)}
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
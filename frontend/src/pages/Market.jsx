// src/pages/Market.jsx
import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, ExternalLink, Loader2, Wallet } from 'lucide-react';
import apiClient from '../api/axios.js';

// Indian market tickers for the quick-select grid
const trendingStocks = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
  { symbol: 'INFY.NS', name: 'Infosys' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
  { symbol: 'ITC.NS', name: 'ITC Ltd' },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance' }
];

const Market = () => {
  const [balance, setBalance] = useState(100000);
  const [searchTicker, setSearchTicker] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState(null);

  // Fetch the user's available balance on load
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await apiClient.get('/paper-trade');
        setBalance(res.data.virtualBalance);
      } catch (err) {
        console.error("Failed to fetch balance", err);
      }
    };
    fetchBalance();
  }, []);

  // Fetch live quote from Yahoo Finance via our backend
  const fetchQuote = async (ticker) => {
    if (!ticker) return;
    setIsQuoting(true);
    setTradeMessage(null);
    try {
      const res = await apiClient.get(`/market/quote/${ticker}`);
      setSelectedAsset(res.data.data);
      setSearchTicker(''); // clear search bar
    } catch (err) {
      setTradeMessage({ type: 'error', text: 'Stock not found or market offline.' });
      setSelectedAsset(null);
    } finally {
      setIsQuoting(false);
    }
  };

  // Execute Buy or Sell
  const handleTrade = async (action) => {
    if (!selectedAsset || quantity <= 0) return;
    setIsTrading(true);
    setTradeMessage(null);
    try {
      const res = await apiClient.post('/paper-trade/execute', {
        ticker: selectedAsset.symbol,
        quantity: quantity,
        action: action
      });
      setTradeMessage({ type: 'success', text: res.data.message });
      setBalance(res.data.virtualBalance); // Update UI balance instantly
      setQuantity(1); // Reset form
    } catch (err) {
      setTradeMessage({ type: 'error', text: err.response?.data?.error || 'Trade failed.' });
    } finally {
      setIsTrading(false);
    }
  };

  const estimatedTotal = selectedAsset ? (selectedAsset.currentPrice * quantity) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header & Balance */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Market & Trade</h1>
          <p className="text-slate-500">Paper trading with virtual cash.</p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
          <Wallet size={20} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-500">Available Cash:</span>
          <span className="font-bold text-slate-900">
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Trending Stocks & Search */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Trending Stocks</h2>
            
            {/* Search Bar */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search ticker (e.g., WIPRO.NS)"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTicker}
                onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && fetchQuote(searchTicker)}
              />
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          {/* Trending Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingStocks.map((stock) => (
              <div key={stock.symbol} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{stock.symbol.replace('.NS', '')}</h3>
                    <p className="text-xs text-slate-500">{stock.name}</p>
                  </div>
                  <button 
                    onClick={() => fetchQuote(stock.symbol)}
                    className="text-xs font-medium text-indigo-600 flex items-center gap-1 hover:text-indigo-800"
                  >
                    Select <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Trade Ticket */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Trade Ticket</h2>
          
          {!selectedAsset ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <Search size={32} className="mx-auto mb-3 opacity-50" />
              <p>Search or select a trending stock to load a live quote.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Asset Info */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Selected</p>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedAsset.symbol.replace('.NS', '')}</h3>
                  <p className="text-xs text-slate-500 truncate w-32">{selectedAsset.companyName}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-slate-900 text-lg">
                    ₹{selectedAsset.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h3>
                  <div className={`flex items-center justify-end gap-1 text-xs font-semibold mt-1 ${selectedAsset.dayChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {selectedAsset.dayChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {selectedAsset.dayChangePercent?.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Order Form */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-medium text-slate-500">Estimated Total</span>
                <span className="font-bold text-slate-900">
                  ₹{estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button 
                  onClick={() => handleTrade('BUY')}
                  disabled={isTrading || isQuoting}
                  className="bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-700 transition-colors flex justify-center items-center"
                >
                  {isTrading ? <Loader2 size={18} className="animate-spin" /> : 'Buy'}
                </button>
                <button 
                  onClick={() => handleTrade('SELL')}
                  disabled={isTrading || isQuoting}
                  className="bg-red-500 text-white font-medium py-2.5 rounded-lg hover:bg-red-600 transition-colors flex justify-center items-center"
                >
                  {isTrading ? <Loader2 size={18} className="animate-spin" /> : 'Sell'}
                </button>
              </div>

              {/* Status Message */}
              {tradeMessage && (
                <div className={`p-3 rounded-lg text-sm font-medium text-center ${tradeMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {tradeMessage.text}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Market;

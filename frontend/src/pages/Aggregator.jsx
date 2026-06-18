import { useState, useEffect } from 'react';
import { Wallet, Loader2, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import apiClient from '../api/axios';
// Change your react-router-dom import to include useSearchParams
import { useNavigate, useSearchParams } from 'react-router-dom';

const Aggregator = () => {
  const [liveHoldings, setLiveHoldings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isJustConnected = searchParams.get('connected') === 'upstox';

  useEffect(() => {
    const fetchLiveHoldings = async () => {
      try {
        const response = await apiClient.get('/upstox/holdings');
        setLiveHoldings(response.data.holdings || []);
      } catch (error) {
        console.error("Error fetching live holdings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLiveHoldings();
  }, []);

  const handleConnectUpstox = () => {
    const token = localStorage.getItem("accessToken") || ""; 
    window.location.href = `http://localhost:8000/api/upstox/connect?token=${token}`;
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-indigo-600">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Syncing with Live Brokers...</p>
      </div>
    );
  }

  const totalLiveValuation = liveHoldings.reduce((acc, current) => acc + (current.quantity * current.avgBuyPrice), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-sm font-medium mb-3 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Sandbox
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Unified Net Worth</h1>
          <p className="text-slate-500">Your consolidated live portfolio across all connected brokers.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-500 hover:text-slate-700 transition-all"
            >
              Strategy Sandbox
            </button>
            <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-indigo-600 shadow-sm transition-all">
              Live Aggregator
            </button>
          </div>

          <button 
            onClick={handleConnectUpstox}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 flex items-center gap-2 shadow-sm transition-all"
          >
            <LinkIcon size={16} /> Link Broker
          </button>
        </div>
      </div>

      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="border border-slate-200 p-6 rounded-2xl shadow-sm bg-white">
          <p className="text-sm font-semibold text-slate-500 tracking-wider uppercase mb-2">Aggregated Live Net Worth</p>
          <p className="text-4xl font-bold text-slate-900">₹{totalLiveValuation.toLocaleString('en-IN')}</p>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm font-semibold border-b border-slate-200">
                <th className="p-4">Asset Ticker</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Avg Buy Price</th>
                <th className="p-4">Total Cost Value</th>
                <th className="p-4">Platform Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
              {liveHoldings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Wallet size={32} className={isJustConnected ? "text-emerald-500" : "text-slate-300"} />
                      
                      {isJustConnected ? (
                        <>
                          <p className="text-emerald-600 font-semibold text-lg">Upstox Account Linked Successfully!</p>
                          <p>Your real-world portfolio is currently empty. Once you buy stocks on Upstox, they will appear here.</p>
                        </>
                      ) : (
                        <>
                          <p>No live broker accounts connected yet.</p>
                          <button 
                            onClick={handleConnectUpstox}
                            className="mt-2 text-indigo-600 font-medium hover:underline"
                          >
                            Connect Upstox to fetch holdings
                          </button>
                        </>
                      )}

                    </div>
                  </td>
                </tr>
              ) : (
                liveHoldings.map((asset, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold tracking-wide">{asset.ticker}</td>
                    <td className="p-4">{asset.quantity}</td>
                    <td className="p-4">₹{asset.avgBuyPrice.toLocaleString('en-IN')}</td>
                    <td className="p-4 font-medium">₹{(asset.quantity * asset.avgBuyPrice).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {asset.broker || 'Upstox'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Aggregator;
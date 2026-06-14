import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { PortfolioGrowthChart, AssetAllocationChart } from '../components/PortfolioCharts';
import apiClient from '../api/axios'; // Our secure bridge to Node.js

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch the paper trading data from our backend
        const response = await apiClient.get('/paper-trade');
        setData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Show a spinner while the data is fetching from the backend
  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-indigo-600">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Syncing with live market data...</p>
      </div>
    );
  }

  // Calculate the total portfolio value (Cash + Invested)
  const totalInvested = data?.totalInvested || 0;
  const virtualBalance = data?.virtualBalance || 0;
  const totalPortfolioValue = totalInvested + virtualBalance;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome back, Investor</h1>
        <p className="text-slate-500">Here's how your portfolio is doing today.</p>
      </div>

      {/* AI Insights Banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-indigo-600 p-2 rounded-xl text-white flex-shrink-0 mt-1">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-indigo-900 font-semibold text-sm mb-1 uppercase tracking-wider">AI Market Briefing</h3>
          <p className="text-indigo-800 text-sm leading-relaxed">
            Tech sector is up <span className="font-semibold text-emerald-600">+1.8%</span> today, led by Reliance and Bajaj Finance. 
            Consider reviewing your HDFC Bank position — it's down 1.05%. Markets remain bullish on Q3 earnings.
          </p>
        </div>
      </div>

      {/* Live Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 text-sm font-medium">Total Portfolio Value</p>
            <div className="p-2 bg-slate-900 text-white rounded-lg"><Wallet size={18} /></div>
          </div>
          {/* Formatted live data */}
          <h2 className="text-3xl font-bold text-slate-900">
            ₹{totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 text-sm font-medium">Available Virtual Cash</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={18} /></div>
          </div>
          <h2 className="text-3xl font-bold text-emerald-600">
            ₹{virtualBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 text-sm font-medium">Total Invested</p>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><TrendingUp size={18} /></div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            ₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      {/* Analytical Layout Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* We will pass live data to these charts next! */}
          <PortfolioGrowthChart />
          <AssetAllocationChart />
        </div>

        {/* Top Movers Sidebar Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Top Movers</h2>
          <p className="text-slate-500 text-sm mb-6">Biggest changes today</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <p className="font-bold text-slate-900 text-sm">BAJFINANCE</p>
                <p className="text-xs text-slate-500">Bajaj Finance</p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold">
                <TrendingUp size={12} /> +3.05%
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">ITC</p>
                <p className="text-xs text-slate-500">ITC Ltd</p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold">
                <TrendingUp size={12} /> +2.18%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
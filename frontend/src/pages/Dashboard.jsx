import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { PortfolioGrowthChart, AssetAllocationChart } from '../components/PortfolioCharts';
import apiClient from '../api/axios';

const Dashboard = () => {
  const [sandboxData, setSandboxData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 1. Get the raw database data
        const response = await apiClient.get('/paper-trade');
        const dashboardData = response.data;

        // 2. Fetch live prices for the dashboard holdings!
        if (dashboardData.paperHoldings && dashboardData.paperHoldings.length > 0) {
          const liveHoldingsPromises = dashboardData.paperHoldings.map(async (stock) => {
            try {
              // Fetch the live quote for each ticker
              const quoteRes = await apiClient.get(`/market/quote/${stock.ticker}`);
              const liveData = quoteRes.data.quote || quoteRes.data.data || quoteRes.data;
              
              // Attach the live market price to the stock object
              return { 
                ...stock, 
                currentPrice: liveData.currentPrice || stock.avgBuyPrice 
              };
            } catch (error) {
              console.warn(`Could not fetch live price for ${stock.ticker}`);
              return stock; // Return original database stock if fetch fails
            }
          });

          // Wait for all live prices to finish downloading, then overwrite the old array
          dashboardData.paperHoldings = await Promise.all(liveHoldingsPromises);
        }

        // 3. Save the final data (which now includes live prices) to state
        setSandboxData(dashboardData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-indigo-600">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading Sandbox Data...</p>
      </div>
    );
  }

  const totalInvested = sandboxData?.totalInvested || 0;
  const virtualBalance = sandboxData?.virtualBalance || 0;
  const sandboxHoldings = sandboxData?.paperHoldings || [];

  // 1. Calculate the LIVE value of your holdings (Quantity * Current Price)
  const currentHoldingsValue = sandboxHoldings.reduce((acc, stock) => {
    // Fallback to avgBuyPrice if the live currentPrice hasn't loaded yet
    const priceToUse = stock.currentPrice || stock.avgBuyPrice;
    return acc + (priceToUse * stock.quantity);
  }, 0);

  // 2. Total Net Worth = Available Cash + LIVE Market Value of Holdings
  const totalPortfolioValue = virtualBalance + currentHoldingsValue;
  const sectorData = sandboxHoldings.reduce((acc, stock) => {
    const sectorName = stock.sector || 'Other'; 
    const stockValue = stock.currentPrice ? (stock.currentPrice * stock.quantity) : (stock.avgBuyPrice * stock.quantity);
    if (!acc[sectorName]) acc[sectorName] = 0;
    acc[sectorName] += stockValue;
    return acc;
  }, {});
  const realAllocationData = Object.keys(sectorData).map(sector => ({
    name: sector, value: sectorData[sector]
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome back, Investor</h1>
          <p className="text-slate-500">Track your virtual strategy or aggregate your live net worth.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
            <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-indigo-600 shadow-sm transition-all">
              Strategy Sandbox
            </button>
            <button 
              onClick={() => navigate('/aggregator')}
              className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-500 hover:text-slate-700 transition-all"
            >
              Live Aggregator
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8 animate-in fade-in duration-500">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 text-sm font-medium">Total Portfolio Value</p>
              <div className="p-2 bg-slate-900 text-white rounded-lg"><Wallet size={18} /></div>
            </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PortfolioGrowthChart />
            <AssetAllocationChart data={realAllocationData} />
          </div>
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
    </div>
  );
};

export default Dashboard;
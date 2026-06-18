// src/pages/Portfolio.jsx
import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import apiClient from '../api/axios';

const Portfolio = () => {
  const [holdings, setHoldings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioStats, setPortfolioStats] = useState({ totalValue: 0, totalInvested: 0 });

useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        // 1. Get the raw holdings from the database
        const res = await apiClient.get('/paper-trade');
        const rawHoldings = res.data.paperHoldings || [];
        const totalInvested = res.data.totalInvested || 0;

        // 2. Fetch live prices for EVERY holding concurrently
        const enrichedHoldings = await Promise.all(
          rawHoldings.map(async (asset) => {
            try {
              const quoteRes = await apiClient.get(`/market/quote/${asset.ticker}`);
              
              // BULLETPROOF UNWRAPPING: Catch the data no matter how the API sends it
              const actualStockData = quoteRes.data.quote || quoteRes.data.data || quoteRes.data;
              
              const currentPrice = actualStockData.currentPrice;
              const totalValue = currentPrice * asset.quantity;
              const pnl = totalValue - (asset.avgBuyPrice * asset.quantity);
              const pnlPercent = (pnl / (asset.avgBuyPrice * asset.quantity)) * 100;
              
              return {
                ...asset,
                currentPrice,
                totalValue,
                pnl,
                pnlPercent,
                companyName: actualStockData.companyName || asset.companyName
              };
            } catch (err) {
              console.warn(`Fallback triggered for ${asset.ticker}`);
              // Fallback if the market API drops a specific ticker
              return { 
                ...asset, 
                currentPrice: asset.avgBuyPrice, 
                totalValue: asset.avgBuyPrice * asset.quantity, 
                pnl: 0, 
                pnlPercent: 0 
              };
            }
          })
        );

        // 3. Calculate total live value
        const liveTotalValue = enrichedHoldings.reduce((sum, asset) => sum + asset.totalValue, 0);

        // 4. Calculate Allocation Percentages
        const finalHoldings = enrichedHoldings.map(asset => ({
          ...asset,
          allocation: liveTotalValue > 0 ? ((asset.totalValue / liveTotalValue) * 100).toFixed(1) : 0
        }));

        setHoldings(finalHoldings.sort((a, b) => b.totalValue - a.totalValue)); 
        setPortfolioStats({ totalValue: liveTotalValue, totalInvested });
      } catch (error) {
        console.error("Failed to fetch portfolio data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, []);
  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-indigo-600">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Crunching your live portfolio numbers...</p>
      </div>
    );
  }

  const totalPnl = portfolioStats.totalValue - portfolioStats.totalInvested;
  const isProfit = totalPnl >= 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Portfolio</h1>
        <p className="text-slate-500">
          {holdings.length} holdings · Total value ₹{portfolioStats.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {holdings.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">Your portfolio is empty</h3>
            <p>Head over to Market & Trade to buy your first stock.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <th className="p-4 font-semibold rounded-tl-2xl">Asset</th>
                  <th className="p-4 font-semibold">Qty</th>
                  <th className="p-4 font-semibold">Avg Buy</th>
                  <th className="p-4 font-semibold">Current</th>
                  <th className="p-4 font-semibold">Total Value</th>
                  <th className="p-4 font-semibold">Alloc %</th>
                  <th className="p-4 font-semibold text-right rounded-tr-2xl">P&L</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {holdings.map((asset) => {
                  const assetIsProfit = asset.pnl >= 0;
                  return (
                    <tr key={asset.ticker} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{asset.ticker.replace('.NS', '')}</p>
                        <p className="text-xs text-slate-500 truncate w-32">{asset.companyName || 'Indian Equities'}</p>
                      </td>
                      <td className="p-4 font-medium text-slate-700">{asset.quantity}</td>
                      <td className="p-4 text-slate-600">₹{asset.avgBuyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-4 font-medium text-slate-900">₹{asset.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-4 font-bold text-slate-900">₹{asset.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-800 rounded-full" style={{ width: `${asset.allocation}%` }}></div>
                          </div>
                          <span className="text-xs font-semibold text-slate-600">{asset.allocation}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <p className={`font-bold ${assetIsProfit ? 'text-emerald-600' : 'text-red-500'}`}>
                          {assetIsProfit ? '+' : ''}₹{asset.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        <p className={`text-xs font-semibold ${assetIsProfit ? 'text-emerald-600' : 'text-red-500'}`}>
                          {assetIsProfit ? '+' : ''}{asset.pnlPercent.toFixed(2)}%
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              
              {/* Table Footer / Summary Row */}
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan="4" className="p-4 font-bold text-slate-900">Total</td>
                  <td className="p-4 font-bold text-slate-900">
                    ₹{portfolioStats.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 font-bold text-slate-900">100%</td>
                  <td className="p-4 text-right font-bold">
                     <span className={isProfit ? 'text-emerald-600' : 'text-red-500'}>
                       {isProfit ? '+' : ''}₹{totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                     </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
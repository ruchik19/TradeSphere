// src/pages/SipCalculator.jsx
import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const SipCalculator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [returnRate, setReturnRate] = useState(12);
  const [years, setYears] = useState(10);

  // Math Logic for SIP
  const { totalInvested, estimatedReturns, totalValue, chartData } = useMemo(() => {
    const months = years * 12;
    const monthlyRate = returnRate / 12 / 100;
    
    // SIP Formula: M = P × ({[1 + i]^n - 1} / i) × (1 + i)
    const futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const invested = monthlyInvestment * months;
    const returns = futureValue - invested;

    // Generate year-by-year data for the line chart
    const data = [];
    for (let i = 1; i <= years; i++) {
      const currentMonths = i * 12;
      const currentVal = monthlyInvestment * ((Math.pow(1 + monthlyRate, currentMonths) - 1) / monthlyRate) * (1 + monthlyRate);
      data.push({
        year: `Year ${i}`,
        invested: monthlyInvestment * currentMonths,
        value: Math.round(currentVal)
      });
    }

    return { 
      totalInvested: invested, 
      estimatedReturns: returns, 
      totalValue: futureValue,
      chartData: data
    };
  }, [monthlyInvestment, returnRate, years]);

  const pieData = [
    { name: 'Invested Amount', value: totalInvested, color: '#0ea5e9' }, // Blue
    { name: 'Est. Returns', value: estimatedReturns, color: '#10b981' }  // Emerald
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">SIP Calculator</h1>
        <p className="text-slate-500">Visualize the power of compounding over time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold text-lg">
            <Calculator size={20} className="text-indigo-600" /> Parameters
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <label className="font-medium text-slate-700">Monthly Investment</label>
                <span className="font-bold text-slate-900">₹{monthlyInvestment.toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min="500" max="100000" step="500" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <label className="font-medium text-slate-700">Expected Return Rate</label>
                <span className="font-bold text-slate-900">{returnRate}%</span>
              </div>
              <input type="range" min="1" max="30" step="0.5" value={returnRate} onChange={(e) => setReturnRate(Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <label className="font-medium text-slate-700">Time Period</label>
                <span className="font-bold text-slate-900">{years} Years</span>
              </div>
              <input type="range" min="1" max="40" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Invested Amount</span>
              <span className="font-semibold text-slate-900">₹{Math.round(totalInvested).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Est. Returns</span>
              <span className="font-semibold text-emerald-600">₹{Math.round(estimatedReturns).toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="font-bold text-slate-700">Total Value</span>
              <span className="font-bold text-indigo-600 text-lg">₹{Math.round(totalValue).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Wealth Accumulation Line Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6">Wealth Accumulation</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} dx={-10} />
                  <RechartsTooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Line type="monotone" dataKey="value" name="Total Value" stroke="#4f46e5" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="invested" name="Invested" stroke="#0ea5e9" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Allocation Pie Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-center gap-12">
            <div className="h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `₹${Math.round(value).toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{item.name}</p>
                    <p className="text-lg font-bold text-slate-900">₹{Math.round(item.value).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SipCalculator;
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="font-bold">₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
    );
  }
  return null;
};

// ========================================================
// 1. DYNAMIC PORTFOLIO GROWTH CHART
// ========================================================
export const PortfolioGrowthChart = ({ data }) => {
  // Safe array handling. If there's no data yet, provide a baseline empty state object.
  let chartData = data && data.length > 0 ? [...data] : [];

  // Recharts needs at least 2 points to draw a clean line.
  // If it's a new account with only 1 snapshot point, generate a starting baseline point.
  if (chartData.length === 1) {
    chartData = [
      { date: 'Initial', value: chartData[0].value },
      ...chartData
    ];
  }

  // Calculate dynamic change percentage based on the first and last snapshot points
  let changePercent = 0;
  let isPositive = true;

  if (chartData.length >= 2) {
    const initialVal = chartData[0].value;
    const currentVal = chartData[chartData.length - 1].value;
    
    if (initialVal > 0) {
      changePercent = ((currentVal - initialVal) / initialVal) * 100;
      isPositive = changePercent >= 0;
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Portfolio Growth</h2>
          <p className="text-slate-500 text-sm">Organically updating tracking</p>
        </div>
        {chartData.length > 0 && (
          <p className={`font-semibold px-2 py-1 rounded-md text-sm ${
            isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
          }`}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </p>
        )}
      </div>
      <div className="h-64 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Waiting for first portfolio snapshot calculation...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`} 
                dx={-10} 
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 2. ASSET ALLOCATION CHART
// ========================================================
export const AssetAllocationChart = ({ data }) => {
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

  const rawData = data && data.length > 0 ? data : [{ name: 'Cash', value: 100000 }];
  const totalValue = rawData.reduce((sum, item) => sum + (item.value || 0), 0);

  const chartData = rawData.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length], 
    percent: totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) + '%' : '0%'
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-1">Asset Allocation</h2>
      <p className="text-slate-500 text-sm mb-6">By sector</p>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="h-40 w-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} innerRadius={50} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 w-full space-y-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-slate-700 font-medium">{item.name}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-400">₹{item.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="text-slate-900 font-bold w-10 text-right">{item.percent}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
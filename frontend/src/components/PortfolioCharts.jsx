import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const performanceData = [
  { date: '15 May', value: 460000 },
  { date: '20 May', value: 470000 },
  { date: '25 May', value: 490000 },
  { date: '30 May', value: 485000 },
  { date: '04 Jun', value: 480000 },
  { date: '09 Jun', value: 500000 },
  { date: '14 Jun', value: 515000 },
];

const allocationData = [
  { name: 'IT Services', value: 139125.4, percent: '42.0%', color: '#0ea5e9' },
  { name: 'Energy', value: 72262.5, percent: '21.8%', color: '#10b981' },
  { name: 'Banking', value: 47367.0, percent: '14.3%', color: '#f59e0b' },
  { name: 'FMCG', value: 46230.0, percent: '14.0%', color: '#8b5cf6' },
  { name: 'Consumer', value: 25964.8, percent: '7.8%', color: '#ef4444' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="font-bold">₹{payload[0].value.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export const PortfolioGrowthChart = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Portfolio Growth</h2>
        <p className="text-slate-500 text-sm">Last 30 days</p>
      </div>
      <p className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-md text-sm">+7.57%</p>
    </div>
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={performanceData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} dx={-10} />
          <RechartsTooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const AssetAllocationChart = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
    <h2 className="text-lg font-bold text-slate-900 mb-1">Asset Allocation</h2>
    <p className="text-slate-500 text-sm mb-6">By sector</p>
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="h-40 w-40 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={allocationData} innerRadius={50} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
              {allocationData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 w-full space-y-2">
        {allocationData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-slate-700 font-medium">{item.name}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-slate-400">₹{item.value.toLocaleString('en-IN')}</span>
              <span className="text-slate-900 font-bold w-10 text-right">{item.percent}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
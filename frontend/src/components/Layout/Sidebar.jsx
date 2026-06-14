// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Briefcase, TrendingUp, Star, 
  Trophy, Calculator, Activity, BookOpen, Bot, User 
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Portfolio', path: '/portfolio', icon: <Briefcase size={20} /> },
    { name: 'Market & Trade', path: '/market', icon: <TrendingUp size={20} /> },
    { name: 'Watchlist', path: '/watchlist', icon: <Star size={20} /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
    { name: 'SIP Calculator', path: '/sip-calculator', icon: <Calculator size={20} /> },
    { name: 'AI Analyzer', path: '/ai-analyzer', icon: <Activity size={20} /> },
    { name: 'Jargon Simplifier', path: '/jargon', icon: <BookOpen size={20} /> },
    { name: 'AI Advisor', path: '/advisor', icon: <Bot size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col justify-between fixed left-0 top-0">
      <div>
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">
            <Briefcase size={18} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight">TradeSphere</h1>
            <p className="text-xs text-slate-500">Smart Investing</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 space-y-1 mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Profile & Virtual Cash */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer mb-2">
          <User size={20} />
          Profile
        </div>
        <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg">
          <p className="text-xs text-slate-400 mb-1">Virtual Cash</p>
          <p className="text-xl font-bold">₹1,00,000</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
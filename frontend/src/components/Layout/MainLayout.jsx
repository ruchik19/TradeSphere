import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/axios';
import { 
  LayoutDashboard, Briefcase, TrendingUp, Star, Trophy, 
  Calculator, Activity, BookOpen, Bot, User, Wallet, LogOut 
} from 'lucide-react';

const MainLayout = () => {
  const [liveBalance, setLiveBalance] = useState(100000);
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAggregatorMode = location.pathname === '/aggregator';

  useEffect(() => {
    const fetchSidebarBalance = async () => {
      try {
        const res = await apiClient.get('/paper-trade');
        setLiveBalance(res.data.virtualBalance);
      } catch (error) {
        console.error("Sidebar balance sync failed", error);
      }
    };
    fetchSidebarBalance();
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Portfolio', path: '/portfolio', icon: <Briefcase size={20} /> },
    { name: 'Market & Trade', path: '/market', icon: <TrendingUp size={20} /> },
    { name: 'Watchlist', path: '/watchlist', icon: <Star size={20} /> },
    { name: 'SIP Calculator', path: '/sip-calculator', icon: <Calculator size={20} /> },
    { name: 'AI Analyzer', path: '/ai-analyzer', icon: <Activity size={20} /> },
    { name: 'Jargon Simplifier', path: '/jargon', icon: <BookOpen size={20} /> },
    { name: 'AI Advisor', path: '/advisor', icon: <Bot size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {!isAggregatorMode && (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto">
          <div className="p-6 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Briefcase size={18} />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">TradeSphere</span>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto shrink-0 space-y-2">
            <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1 text-slate-400">
                <Wallet size={14} />
                <p className="text-xs font-medium uppercase tracking-wider">Virtual Cash</p>
              </div>
              <p className="text-xl font-bold">
                ₹{liveBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User size={18} />
                <span>{user?.username || 'Logout'}</span>
              </div>
              <LogOut size={16} className="opacity-50" />
            </button>
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
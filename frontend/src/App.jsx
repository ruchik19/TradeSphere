import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AuthPage from './pages/Auth.jsx';
import { Loader2 } from 'lucide-react';
import Market from './pages/Market.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Watchlist from './pages/Watchlist.jsx';
import SipCalculator from './pages/SipCalculator.jsx';
import AiAdvisor from './pages/AiAdvisor.jsx';
import JargonSimplifier from './pages/JargonSimplifier.jsx';
import AiAnalyzer from './pages/AiAnalyzer.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Aggregator from './pages/Aggregator.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-indigo-600">
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }
  
  return user ? children : <Navigate to="/auth" />;
};

function App() {
  const { user } = useAuth();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route 
          path="/auth" 
          element={user ? <Navigate to="/dashboard" /> : <AuthPage />} 
        />

        <Route element={user ? <MainLayout /> : <Navigate to="/auth" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/aggregator" element={<Aggregator />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/market" element={<Market />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/sip-calculator" element={<SipCalculator />} />
          <Route path="/ai-analyzer" element={<AiAnalyzer />} />
          <Route path="/jargon" element={<JargonSimplifier />} />
          <Route path="/advisor" element={<AiAdvisor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

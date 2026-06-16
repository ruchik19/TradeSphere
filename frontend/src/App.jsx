// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/Auth';
import { Loader2 } from 'lucide-react';
import Market from './pages/Market';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import SipCalculator from './pages/SipCalculator';
import AiAdvisor from './pages/AiAdvisor';
import JargonSimplifier from './pages/JargonSimplifier';
import AiAnalyzer from './pages/AiAnalyzer';
import LandingPage from './pages/LandingPage';

// Bouncer Component: Checks if you are logged in before showing the page
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

const Placeholder = ({ title }) => (
  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
    <h1 className="text-xl font-bold text-slate-800">{title} Page (Coming Soon)</h1>
  </div>
);

function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
       <Route path="/" element={<LandingPage />} />

      {/* 2. THE AUTH PAGE */}
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/dashboard" /> : <AuthPage />} 
      />

        {/* Protected Routes wrapped in our Bouncer */}
        <Route element={user ? <MainLayout /> : <Navigate to="/auth" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="market" element={<Market />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="sip-calculator" element={<SipCalculator />} />
          <Route path="ai-analyzer" element={<AiAnalyzer />} />
          <Route path="jargon" element={<JargonSimplifier />} />
          <Route path="advisor" element={<AiAdvisor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
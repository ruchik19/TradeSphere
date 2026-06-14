// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import { Loader2 } from 'lucide-react';
import Market from './pages/Market';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import SipCalculator from './pages/SipCalculator';

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
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/auth" element={<Auth />} />

        {/* Protected Routes wrapped in our Bouncer */}
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="market" element={<Market />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="sip-calculator" element={<SipCalculator />} />
          <Route path="ai-analyzer" element={<Placeholder title="AI Analyzer" />} />
          <Route path="jargon" element={<Placeholder title="Jargon Simplifier" />} />
          <Route path="advisor" element={<Placeholder title="AI Advisor" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
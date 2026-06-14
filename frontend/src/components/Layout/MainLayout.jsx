// src/components/layout/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      {/* Main content area offset by the 64px sidebar width */}
      <div className="flex-1 ml-64 p-8">
        <Outlet /> {/* This is where the specific page content injects */}
      </div>
    </div>
  );
};

export default MainLayout;
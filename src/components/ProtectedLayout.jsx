import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';

export default function ProtectedLayout({ allowedRoles = [] }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="full-screen-loader">
        <Loader2 size={36} className="spin-loader text-emerald-600 mb-3" />
        <p className="text-sm font-semibold text-slate-600">Initializing LocalMarket Portal...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Redirect to default home based on user's role
    if (currentUser.role === 'System Administrator') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (currentUser.role === 'Store Owner') {
      return <Navigate to="/owner/dashboard" replace />;
    } else {
      return <Navigate to="/stores" replace />;
    }
  }

  return (
    <div className="app-layout-root">
      <Navbar />
      <div className="app-layout-body">
        <Sidebar />
        <main className="app-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

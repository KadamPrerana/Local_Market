import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminStores from './pages/AdminStores';
import AdminUsers from './pages/AdminUsers';
import UserDetails from './pages/UserDetails';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import OwnerReviews from './pages/OwnerReviews';
import ExploreStores from './pages/ExploreStores';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';

import ProtectedLayout from './components/ProtectedLayout';

function IndexRedirect() {
  const { currentUser, loading } = useAuth();

  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;

  if (currentUser.role === 'System Administrator') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (currentUser.role === 'Store Owner') {
    return <Navigate to="/owner/dashboard" replace />;
  } else {
    return <Navigate to="/stores" replace />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route element={<ProtectedLayout allowedRoles={['System Administrator']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/stores" element={<AdminStores />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/users/:id" element={<UserDetails />} />
            </Route>

            {/* Store Owner Routes */}
            <Route element={<ProtectedLayout allowedRoles={['Store Owner']} />}>
              <Route path="/owner/dashboard" element={<StoreOwnerDashboard />} />
              <Route path="/owner/reviews" element={<OwnerReviews />} />
            </Route>

            {/* Normal User Routes */}
            <Route element={<ProtectedLayout allowedRoles={['Normal User', 'System Administrator', 'Store Owner']} />}>
              <Route path="/stores" element={<ExploreStores />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-password" element={<ChangePassword />} />
            </Route>

            {/* Root Redirect */}
            <Route path="/" element={<IndexRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

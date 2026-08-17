import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Store, Users, User, Key, MessageSquare, ShieldCheck, Compass } from 'lucide-react';

export default function Sidebar() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const role = currentUser.role;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-section-header">
          <span>MAIN MENU</span>
        </div>

        <nav className="sidebar-nav-list">
          {/* Admin Navigation */}
          {role === 'System Administrator' && (
            <>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={19} />
                <span>Executive Overview</span>
              </NavLink>

              <NavLink
                to="/admin/stores"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Store size={19} />
                <span>Stores Management</span>
              </NavLink>

              <NavLink
                to="/admin/users"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Users size={19} />
                <span>User Accounts</span>
              </NavLink>
            </>
          )}

          {/* Store Owner Navigation */}
          {role === 'Store Owner' && (
            <>
              <NavLink
                to="/owner/dashboard"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={19} />
                <span>Store Hub</span>
              </NavLink>

              <NavLink
                to="/owner/reviews"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <MessageSquare size={19} />
                <span>Customer Reviews</span>
              </NavLink>
            </>
          )}

          {/* Normal User Navigation */}
          {role === 'Normal User' && (
            <>
              <NavLink
                to="/stores"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Compass size={19} />
                <span>Explore Stores</span>
              </NavLink>
            </>
          )}

          <div className="sidebar-section-header mt-6">
            <span>ACCOUNT SETTINGS</span>
          </div>

          <NavLink
            to="/profile"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <User size={19} />
            <span>My Profile</span>
          </NavLink>

          <NavLink
            to="/change-password"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <Key size={19} />
            <span>Change Password</span>
          </NavLink>
        </nav>

        {/* Footer info box */}
        <div className="sidebar-footer-card">
          <div className="system-status-indicator">
            <span className="status-dot green-pulse" />
            <span>PostgreSQL Active</span>
          </div>
          <p className="system-version">LocalMarket Portal v2.5</p>
        </div>
      </div>
    </aside>
  );
}

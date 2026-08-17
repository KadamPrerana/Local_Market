import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, Key, LogOut, User as UserIcon, Shield, Building2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // User initials avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'System Administrator':
        return 'badge-role-admin';
      case 'Store Owner':
        return 'badge-role-owner';
      default:
        return 'badge-role-user';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'System Administrator':
        return <Shield size={13} />;
      case 'Store Owner':
        return <Building2 size={13} />;
      default:
        return <UserIcon size={13} />;
    }
  };

  return (
    <header className="app-top-navbar">
      <div className="navbar-container">
        {/* Brand Logo & Portal Name */}
        <div className="navbar-brand-section">
          <div className="navbar-brand-icon">
            <Store size={22} color="#ffffff" />
          </div>
          <div className="navbar-brand-text">
            <span className="brand-title">LocalMarket</span>
            <span className="brand-subtitle">Business & Rating Portal</span>
          </div>
        </div>

        {/* User Status & Action Buttons */}
        <div className="navbar-user-section">
          <div className="user-profile-summary">
            <div className="user-avatar-circle">
              {getInitials(currentUser.name)}
            </div>
            <div className="user-details-col">
              <span className="user-display-name">{currentUser.name}</span>
              <span className={`role-badge ${getRoleBadgeClass(currentUser.role)}`}>
                {getRoleIcon(currentUser.role)}
                <span>{currentUser.role}</span>
              </span>
            </div>
          </div>

          <div className="navbar-divider" />

          {/* Quick Actions */}
          <div className="navbar-actions">
            <Link
              to="/change-password"
              className="btn-icon-secondary"
              title="Change Password"
            >
              <Key size={17} />
              <span className="action-label-desktop">Password</span>
            </Link>

            <button
              type="button"
              className="btn-icon-danger"
              onClick={handleLogout}
              title="Sign Out of Portal"
            >
              <LogOut size={17} />
              <span className="action-label-desktop">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

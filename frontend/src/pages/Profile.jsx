import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, MapPin, Shield, Calendar } from 'lucide-react';

export default function Profile() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  return (
    <div className="page-container max-w-3xl">
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-title">My User Profile</h1>
          <p className="page-subtitle">View your account profile and permission credentials</p>
        </div>
      </div>

      <div className="user-profile-hero-card mb-6">
        <div className="hero-avatar">
          {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
        </div>
        <div className="hero-info">
          <div className="flex items-center gap-3">
            <h1 className="hero-name">{currentUser.name}</h1>
            <span className={`role-badge ${currentUser.role === 'System Administrator' ? 'badge-role-admin' : currentUser.role === 'Store Owner' ? 'badge-role-owner' : 'badge-role-user'}`}>
              {currentUser.role}
            </span>
          </div>
          <p className="hero-email">{currentUser.email}</p>
        </div>
      </div>

      <div className="card-box">
        <div className="card-box-header border-b pb-4 mb-4">
          <div className="card-box-title">
            <User size={18} className="text-emerald-600" />
            <h3>Personal Information</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="detail-item-row">
            <div className="detail-icon">
              <User size={16} />
            </div>
            <div>
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{currentUser.name}</span>
            </div>
          </div>

          <div className="detail-item-row">
            <div className="detail-icon">
              <Mail size={16} />
            </div>
            <div>
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{currentUser.email}</span>
            </div>
          </div>

          <div className="detail-item-row">
            <div className="detail-icon">
              <MapPin size={16} />
            </div>
            <div>
              <span className="detail-label">Physical Location / Address</span>
              <span className="detail-value">{currentUser.address || 'N/A'}</span>
            </div>
          </div>

          <div className="detail-item-row">
            <div className="detail-icon">
              <Shield size={16} />
            </div>
            <div>
              <span className="detail-label">Assigned Access Role</span>
              <span className="detail-value font-semibold text-emerald-800">{currentUser.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

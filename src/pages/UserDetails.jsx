import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, User, Mail, MapPin, Shield, Building2, Calendar, Star, Clock } from 'lucide-react';
import StarRating from '../components/StarRating';

export default function UserDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const res = await adminService.getUserDetails(id);
        setData(res.data);
      } catch (err) {
        showToast('Failed to load user account details.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton-card mb-4" style={{ height: '120px' }} />
        <div className="skeleton-card" style={{ height: '240px' }} />
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="page-container text-center py-12">
        <h3 className="text-xl font-bold text-slate-800 mb-2">User Not Found</h3>
        <p className="text-slate-600 mb-6">The requested user account does not exist.</p>
        <Link to="/admin/users" className="btn-emerald">
          Back to User Accounts
        </Link>
      </div>
    );
  }

  const { user, storeInfo } = data;

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="mb-6">
        <Link to="/admin/users" className="btn-header-back mb-4">
          <ArrowLeft size={16} />
          <span>Back to Users Directory</span>
        </Link>

        <div className="user-profile-hero-card">
          <div className="hero-avatar">
            {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="hero-info">
            <div className="flex items-center gap-3">
              <h1 className="hero-name">{user.name}</h1>
              <span className={`role-badge ${user.role === 'System Administrator' ? 'badge-role-admin' : user.role === 'Store Owner' ? 'badge-role-owner' : 'badge-role-user'}`}>
                {user.role}
              </span>
            </div>
            <p className="hero-email">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details Card */}
        <div className="card-box">
          <div className="card-box-header border-b pb-4 mb-4">
            <div className="card-box-title">
              <User size={18} className="text-emerald-600" />
              <h3>Account Profile Information</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="detail-item-row">
              <div className="detail-icon">
                <Mail size={16} />
              </div>
              <div>
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </div>

            <div className="detail-item-row">
              <div className="detail-icon">
                <MapPin size={16} />
              </div>
              <div>
                <span className="detail-label">Physical Address</span>
                <span className="detail-value">{user.address || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-item-row">
              <div className="detail-icon">
                <Calendar size={16} />
              </div>
              <div>
                <span className="detail-label">Date Created</span>
                <span className="detail-value">{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Store Info (If Store Owner) */}
        {user.role === 'Store Owner' && (
          <div className="card-box">
            <div className="card-box-header border-b pb-4 mb-4">
              <div className="card-box-title">
                <Building2 size={18} className="text-emerald-600" />
                <h3>Assigned Store Business</h3>
              </div>
            </div>

            {storeInfo ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{storeInfo.name}</h4>
                  <p className="text-xs text-slate-500 mb-2">{storeInfo.email}</p>
                  <p className="text-sm text-slate-600">{storeInfo.address}</p>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-800 block mb-1">Store Rating Performance</span>
                    <StarRating rating={parseFloat(storeInfo.avg_rating)} readOnly showLabel size={18} />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-slate-800">{storeInfo.total_ratings}</span>
                    <span className="text-xs text-slate-500 block">Total Customer Ratings</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Building2 size={32} className="mx-auto mb-2 opacity-40" />
                <p>No store currently assigned to this Store Owner account.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

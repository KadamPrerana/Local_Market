import React, { useState } from 'react';
import { Store, Star, Users, MapPin, Search, AlertCircle, Mail, Award, CheckCircle2 } from 'lucide-react';
import DataTable from './DataTable';
import StarRating from './StarRating';
import { calculateStoreRating } from '../utils/validators';

export default function StoreOwnerDashboard({ currentUser, stores, ratings }) {
  const [searchUser, setSearchUser] = useState('');

  // Find owned store
  const ownedStore = stores.find((s) => s.ownerId === currentUser.id) || stores.find((s) => s.id === currentUser.storeId);

  if (!ownedStore) {
    return (
      <div className="dashboard-layout">
        <div className="section-card p-6" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <AlertCircle size={48} color="var(--amber-500)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 800 }}>No Store Currently Assigned</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '8px auto 20px' }}>
            Your Store Owner account is active, but you have not been linked to a specific store yet. Please contact the System Administrator to assign your business store.
          </p>
        </div>
      </div>
    );
  }

  // Calculate store rating stats
  const ratingInfo = calculateStoreRating(ownedStore.id, ratings);

  // Ratings for this specific store
  const storeSubmittedRatings = ratings.filter((r) => r.storeId === ownedStore.id);

  // Filter submitted ratings by user name or user email
  const filteredSubmittedRatings = storeSubmittedRatings.filter((r) => {
    const matchName = r.userName.toLowerCase().includes(searchUser.toLowerCase());
    const matchEmail = r.userEmail.toLowerCase().includes(searchUser.toLowerCase());
    return matchName || matchEmail;
  });

  // Calculate Rating Distribution (5-star, 4-star, 3-star, etc)
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  storeSubmittedRatings.forEach((r) => {
    if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++;
  });

  const columns = [
    {
      key: 'userName',
      label: 'Customer / Reviewer Name',
      sortable: true,
      render: (r) => (
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
            {r.userName ? r.userName[0].toUpperCase() : 'U'}
          </div>
          <span>{r.userName}</span>
        </div>
      )
    },
    {
      key: 'userEmail',
      label: 'Verified Email',
      sortable: true,
      render: (r) => (
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mail size={14} color="var(--text-tertiary)" /> {r.userEmail}
        </div>
      )
    },
    {
      key: 'rating',
      label: 'Submitted Score',
      sortable: true,
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarRating rating={r.rating} size={15} />
          <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{r.rating} / 5</strong>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Submission Date',
      sortable: true,
      render: (r) => {
        const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent';
        return <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{dateStr}</span>;
      }
    }
  ];

  return (
    <div className="dashboard-layout">
      {/* Header Banner */}
      <div className="dashboard-hero-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div className="store-logo-avatar" style={{ background: '#ffffff', color: 'var(--emerald-700)' }}>
              <Store size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 800 }}>
                {ownedStore.name}
              </h2>
              <p style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginTop: '2px' }}>
                <MapPin size={15} /> {ownedStore.address} • Contact: {ownedStore.email}
              </p>
            </div>
          </div>
        </div>
        <span className="role-pill owner" style={{ fontSize: '12px', padding: '6px 14px' }}>
          <CheckCircle2 size={13} /> Verified Business Store
        </span>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-container">
        <div className="stat-tile-card">
          <div className="stat-icon-wrapper amber">
            <Star size={26} />
          </div>
          <div className="stat-tile-data">
            <span className="stat-tile-label">Average Store Rating</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
              <span className="stat-tile-number">{ratingInfo.avg > 0 ? ratingInfo.avg : '0.0'}</span>
              <StarRating rating={ratingInfo.avg} size={18} />
            </div>
          </div>
        </div>

        <div className="stat-tile-card">
          <div className="stat-icon-wrapper indigo">
            <Users size={26} />
          </div>
          <div className="stat-tile-data">
            <span className="stat-tile-label">Total Customer Reviews</span>
            <span className="stat-tile-number">{ratingInfo.count}</span>
          </div>
        </div>

        <div className="stat-tile-card">
          <div className="stat-icon-wrapper emerald">
            <Award size={26} />
          </div>
          <div className="stat-tile-data">
            <span className="stat-tile-label">5-Star Excellence Ratio</span>
            <span className="stat-tile-number">
              {ratingInfo.count > 0 ? `${Math.round((ratingCounts[5] / ratingInfo.count) * 100)}%` : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Ratings Section */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">
            <Users size={20} color="var(--emerald-600)" />
            <h3>Customer Reviews & Ratings Breakdown</h3>
          </div>

          <div className="input-wrapper" style={{ width: '280px' }}>
            <Search size={14} className="input-icon-left" />
            <input
              type="text"
              className="custom-input"
              style={{ padding: '8px 12px 8px 36px', fontSize: '13px' }}
              placeholder="Search reviewer name or email..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            />
          </div>
        </div>

        <div className="section-card-body" style={{ padding: 0 }}>
          <DataTable
            columns={columns}
            data={filteredSubmittedRatings}
            emptyMessage="No customer reviews have been submitted for your store yet."
          />
        </div>
      </div>
    </div>
  );
}

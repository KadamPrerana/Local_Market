import React, { useState } from 'react';
import { Users, Store, Star, Plus, Search, Filter, Mail, MapPin, Award, ArrowUpRight } from 'lucide-react';
import DataTable from './DataTable';
import StarRating from './StarRating';
import { calculateStoreRating, getOwnerStoreRating } from '../utils/validators';

export default function AdminDashboard({ users, stores, ratings, onOpenAddUser, onOpenAddStore }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'stores'
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  // Calculate global platform average rating score
  const overallAvgRating = (() => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / ratings.length).toFixed(1);
  })();

  // Clear filters
  const handleClearFilters = () => {
    setSearchName('');
    setSearchEmail('');
    setSearchAddress('');
    setFilterRole('All');
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchName = u.name.toLowerCase().includes(searchName.toLowerCase());
    const matchEmail = u.email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchAddress = u.address.toLowerCase().includes(searchAddress.toLowerCase());
    const matchRole = filterRole === 'All' || u.role === filterRole;
    return matchName && matchEmail && matchAddress && matchRole;
  });

  // Filtered Stores
  const filteredStores = stores.filter((s) => {
    const matchName = s.name.toLowerCase().includes(searchName.toLowerCase());
    const matchEmail = s.email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchAddress = s.address.toLowerCase().includes(searchAddress.toLowerCase());
    return matchName && matchEmail && matchAddress;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Admin Table Columns for Users
  const userColumns = [
    {
      key: 'name',
      label: 'User Account & Name',
      sortable: true,
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="avatar-circle" style={{ width: '36px', height: '36px', fontSize: '13px', background: 'var(--slate-800)' }}>
            {getInitials(u.name)}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>ID: {u.id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email Address',
      sortable: true,
      render: (u) => (
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mail size={14} color="var(--text-tertiary)" /> {u.email}
        </div>
      )
    },
    {
      key: 'address',
      label: 'Location / Address',
      sortable: true,
      render: (u) => (
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={u.address}>
          <MapPin size={14} color="var(--text-tertiary)" /> {u.address}
        </div>
      )
    },
    {
      key: 'role',
      label: 'Assigned Role',
      sortable: true,
      render: (u) => {
        const roleClass = u.role === 'System Administrator' ? 'admin' : u.role === 'Store Owner' ? 'owner' : 'user';
        return <span className={`role-pill ${roleClass}`}>{u.role}</span>;
      }
    },
    {
      key: 'rating',
      label: 'Store Rating (If Owner)',
      sortable: true,
      render: (u) => {
        if (u.role !== 'Store Owner') {
          return <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>—</span>;
        }
        const ratingInfo = getOwnerStoreRating(u.id, stores, ratings);
        if (!ratingInfo || ratingInfo.count === 0) {
          return <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>No ratings yet</span>;
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <StarRating rating={ratingInfo.avg} size={14} />
            <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{ratingInfo.avg}</strong>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>({ratingInfo.count})</span>
          </div>
        );
      }
    }
  ];

  // Admin Table Columns for Stores
  const storeColumns = [
    {
      key: 'name',
      label: 'Store Name',
      sortable: true,
      render: (s) => (
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="persona-icon-avatar owner" style={{ width: '36px', height: '36px' }}>
            <Store size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>{s.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 400 }}>ID: {s.id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Store Email',
      sortable: true,
      render: (s) => (
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mail size={14} color="var(--text-tertiary)" /> {s.email}
        </div>
      )
    },
    {
      key: 'address',
      label: 'Physical Address',
      sortable: true,
      render: (s) => (
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} title={s.address}>
          <MapPin size={14} color="var(--text-tertiary)" /> {s.address}
        </div>
      )
    },
    {
      key: 'rating',
      label: 'Average Customer Rating',
      sortable: true,
      render: (s) => {
        const ratingInfo = calculateStoreRating(s.id, ratings);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StarRating rating={ratingInfo.avg} size={15} />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
              {ratingInfo.avg > 0 ? ratingInfo.avg : 'Unrated'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              ({ratingInfo.count} {ratingInfo.count === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="dashboard-layout">
      {/* Dark Slate Enterprise Banner */}
      <div className="dashboard-hero-banner">
        <div className="dashboard-hero-title">
          <h2>System Administrator Overview</h2>
          <p>Full executive control: Audit platform users, onboard local stores, and monitor customer satisfaction ratings.</p>
        </div>
        <div className="hero-actions-group">
          <button type="button" className="btn-emerald" onClick={onOpenAddUser}>
            <Plus size={16} /> Add New User
          </button>
          <button type="button" className="btn-secondary-light" onClick={onOpenAddStore}>
            <Plus size={16} /> Register Store
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid-container">
        <div className="stat-tile-card">
          <div className="stat-icon-wrapper indigo">
            <Users size={24} />
          </div>
          <div className="stat-tile-data">
            <span className="stat-tile-label">Total Platform Users</span>
            <span className="stat-tile-number">{users.length}</span>
          </div>
        </div>

        <div className="stat-tile-card">
          <div className="stat-icon-wrapper emerald">
            <Store size={24} />
          </div>
          <div className="stat-tile-data">
            <span className="stat-tile-label">Registered Stores</span>
            <span className="stat-tile-number">{stores.length}</span>
          </div>
        </div>

        <div className="stat-tile-card">
          <div className="stat-icon-wrapper amber">
            <Star size={24} />
          </div>
          <div className="stat-tile-data">
            <span className="stat-tile-label">Submitted Reviews</span>
            <span className="stat-tile-number">{ratings.length}</span>
          </div>
        </div>

        <div className="stat-tile-card">
          <div className="stat-icon-wrapper emerald" style={{ background: 'var(--emerald-50)', color: 'var(--emerald-700)', borderColor: 'var(--emerald-200)' }}>
            <Award size={24} />
          </div>
          <div className="stat-tile-data">
            <span className="stat-tile-label">Platform Avg Rating</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span className="stat-tile-number">{overallAvgRating}</span>
              <StarRating rating={Number(overallAvgRating)} size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Data Section */}
      <div className="section-card">
        <div className="section-card-header">
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn-secondary-light ${activeTab === 'users' ? 'btn-emerald' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={16} /> Users ({filteredUsers.length})
            </button>
            <button
              type="button"
              className={`btn-secondary-light ${activeTab === 'stores' ? 'btn-emerald' : ''}`}
              onClick={() => setActiveTab('stores')}
            >
              <Store size={16} /> Stores ({filteredStores.length})
            </button>
          </div>

          {/* Search Toolbar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="input-wrapper" style={{ width: '180px' }}>
              <Search size={14} className="input-icon-left" />
              <input
                type="text"
                className="custom-input"
                style={{ padding: '7px 10px 7px 34px', fontSize: '13px' }}
                placeholder="Filter Name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="input-wrapper" style={{ width: '180px' }}>
              <Search size={14} className="input-icon-left" />
              <input
                type="text"
                className="custom-input"
                style={{ padding: '7px 10px 7px 34px', fontSize: '13px' }}
                placeholder="Filter Email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>

            <div className="input-wrapper" style={{ width: '180px' }}>
              <Search size={14} className="input-icon-left" />
              <input
                type="text"
                className="custom-input"
                style={{ padding: '7px 10px 7px 34px', fontSize: '13px' }}
                placeholder="Filter Address..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
              />
            </div>

            {activeTab === 'users' && (
              <div className="input-wrapper" style={{ width: '160px' }}>
                <Filter size={14} className="input-icon-left" />
                <select
                  className="custom-input"
                  style={{ padding: '7px 10px 7px 34px', fontSize: '13px' }}
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  <option value="Normal User">Normal User</option>
                  <option value="Store Owner">Store Owner</option>
                  <option value="System Administrator">Admin</option>
                </select>
              </div>
            )}

            {(searchName || searchEmail || searchAddress || filterRole !== 'All') && (
              <button
                type="button"
                className="btn-secondary-light"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={handleClearFilters}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="section-card-body" style={{ padding: 0 }}>
          {activeTab === 'users' ? (
            <DataTable
              columns={userColumns}
              data={filteredUsers}
              emptyMessage="No user accounts match your search parameters."
            />
          ) : (
            <DataTable
              columns={storeColumns}
              data={filteredStores}
              emptyMessage="No registered stores match your search parameters."
            />
          )}
        </div>
      </div>
    </div>
  );
}

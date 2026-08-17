import React, { useState } from 'react';
import { Search, Store, MapPin, Star, CheckCircle2, Edit3, X, LayoutGrid, List, Sparkles, Mail } from 'lucide-react';
import StarRating from './StarRating';
import DataTable from './DataTable';
import { calculateStoreRating } from '../utils/validators';

export default function NormalUserDashboard({ currentUser, stores, ratings, onSubmitRating }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [selectedStoreForRating, setSelectedStoreForRating] = useState(null);
  const [tempRating, setTempRating] = useState(5);
  const [toastMessage, setToastMessage] = useState('');

  // Category map helper
  const getStoreCategory = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('organic') || lower.includes('freshmart') || lower.includes('grocery')) return 'Organic Grocery';
    if (lower.includes('tech') || lower.includes('gadgets') || lower.includes('electronics')) return 'Tech & Electronics';
    if (lower.includes('bakery') || lower.includes('bakes') || lower.includes('confectionery')) return 'Artisan Bakery';
    return 'Retail & Apparel';
  };

  // Rating Feedback Label Helper
  const getRatingFeedbackLabel = (val) => {
    switch (val) {
      case 1: return { text: '1 Star - Poor Experience', color: 'var(--danger-600)', bg: 'var(--danger-50)' };
      case 2: return { text: '2 Stars - Below Average', color: 'var(--amber-700)', bg: 'var(--amber-50)' };
      case 3: return { text: '3 Stars - Average Service', color: 'var(--amber-700)', bg: 'var(--amber-50)' };
      case 4: return { text: '4 Stars - Very Good', color: 'var(--emerald-700)', bg: 'var(--emerald-50)' };
      case 5: return { text: '5 Stars - Outstanding & Recommended!', color: 'var(--emerald-700)', bg: 'var(--emerald-50)' };
      default: return { text: '', color: '', bg: '' };
    }
  };

  // Filter stores by Name and Address
  const filteredStores = stores.filter((store) => {
    const matchName = store.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAddress = store.address.toLowerCase().includes(addressQuery.toLowerCase());
    return matchName && matchAddress;
  });

  // Handle rating modal open
  const handleOpenRatingModal = (store, currentRatingVal) => {
    setSelectedStoreForRating(store);
    setTempRating(currentRatingVal || 5);
  };

  const handleSaveRating = (storeId, ratingValue) => {
    if (!currentUser) return;
    onSubmitRating(storeId, ratingValue);
    setSelectedStoreForRating(null);
    setToastMessage(`Your rating of ${ratingValue} stars was submitted successfully!`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Normal User Store Table Columns
  const tableColumns = [
    {
      key: 'name',
      label: 'Store Name & Category',
      sortable: true,
      render: (s) => (
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="store-logo-avatar" style={{ width: '38px', height: '38px' }}>
            <Store size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>{s.name}</div>
            <span className="role-pill owner" style={{ fontSize: '10px', padding: '1px 8px', marginTop: '2px' }}>
              {getStoreCategory(s.name)}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'address',
      label: 'Location / Address',
      sortable: true,
      render: (s) => (
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={14} color="var(--text-tertiary)" />
          <span>{s.address}</span>
        </div>
      )
    },
    {
      key: 'overallRating',
      label: 'Overall Rating',
      sortable: true,
      render: (s) => {
        const ratingInfo = calculateStoreRating(s.id, ratings);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StarRating rating={ratingInfo.avg} size={15} />
            <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
              {ratingInfo.avg > 0 ? ratingInfo.avg : 'Unrated'}
            </strong>
            {ratingInfo.count > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                ({ratingInfo.count})
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'userRating',
      label: "Your Submitted Rating",
      sortable: true,
      render: (s) => {
        if (!currentUser) {
          return <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>Sign in to rate</span>;
        }
        const userRatingObj = ratings.find((r) => r.storeId === s.id && r.userId === currentUser.id);
        if (userRatingObj) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <StarRating rating={userRatingObj.rating} size={14} />
              <span className="role-pill user">
                {userRatingObj.rating} / 5
              </span>
            </div>
          );
        }
        return <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>Not rated yet</span>;
      }
    },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      align: 'right',
      render: (s) => {
        if (!currentUser) return null;
        const userRatingObj = ratings.find((r) => r.storeId === s.id && r.userId === currentUser.id);
        return userRatingObj ? (
          <button
            type="button"
            className="btn-outline-amber"
            onClick={() => handleOpenRatingModal(s, userRatingObj.rating)}
          >
            <Edit3 size={14} /> Modify Rating
          </button>
        ) : (
          <button
            type="button"
            className="btn-amber-action"
            onClick={() => handleOpenRatingModal(s, 5)}
          >
            <Star size={14} /> Rate Store
          </button>
        );
      }
    }
  ];

  return (
    <div className="dashboard-layout">
      {/* Header Banner */}
      <div className="dashboard-hero-banner">
        <div className="dashboard-hero-title">
          <h2>Local Business Directory & Review Portal</h2>
          <p>Discover verified local stores, explore customer reviews, and submit your personal 1 to 5 star ratings.</p>
        </div>
        <div className="hero-actions-group">
          <span className="role-pill user" style={{ padding: '6px 14px', fontSize: '12px' }}>
            <Sparkles size={13} /> {filteredStores.length} Stores Available
          </span>
        </div>
      </div>

      {toastMessage && (
        <div className="alert-box success">
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      {/* Main Container Card */}
      <div className="section-card">
        {/* Search & Filter Header Toolbar */}
        <div className="section-card-header">
          <div className="section-card-title">
            <Store size={20} color="var(--emerald-600)" />
            <h3>Explore Stores</h3>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
            <div className="input-wrapper" style={{ minWidth: '220px' }}>
              <Search size={14} className="input-icon-left" />
              <input
                type="text"
                className="custom-input"
                style={{ padding: '8px 12px 8px 36px', fontSize: '13px' }}
                placeholder="Search store name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="input-wrapper" style={{ minWidth: '220px' }}>
              <MapPin size={14} className="input-icon-left" />
              <input
                type="text"
                className="custom-input"
                style={{ padding: '8px 12px 8px 36px', fontSize: '13px' }}
                placeholder="Filter address / location..."
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
              />
            </div>

            {/* View Mode Toggle Switcher */}
            <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-light)' }}>
              <button
                type="button"
                className={`action-btn-circle ${viewMode === 'grid' ? 'active' : ''}`}
                style={{ borderRadius: 'var(--radius-xs)', width: '32px', height: '32px', border: 'none', background: viewMode === 'grid' ? '#ffffff' : 'transparent', color: viewMode === 'grid' ? 'var(--emerald-600)' : 'var(--text-tertiary)' }}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                className={`action-btn-circle ${viewMode === 'table' ? 'active' : ''}`}
                style={{ borderRadius: 'var(--radius-xs)', width: '32px', height: '32px', border: 'none', background: viewMode === 'table' ? '#ffffff' : 'transparent', color: viewMode === 'table' ? 'var(--emerald-600)' : 'var(--text-tertiary)' }}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Directory Content */}
        <div className="section-card-body">
          {viewMode === 'grid' ? (
            <div className="stores-grid-layout">
              {filteredStores.map((store) => {
                const ratingInfo = calculateStoreRating(store.id, ratings);
                const userRatingObj = ratings.find((r) => r.storeId === store.id && r.userId === currentUser?.id);

                return (
                  <div key={store.id} className="store-card-item">
                    <div>
                      <div className="store-card-top">
                        <div className="store-logo-avatar">
                          <Store size={22} />
                        </div>
                        <div className="store-header-info">
                          <h4>{store.name}</h4>
                          <span>{getStoreCategory(store.name)}</span>
                        </div>
                      </div>

                      <div className="store-card-meta">
                        <div className="store-meta-row">
                          <MapPin size={15} color="var(--text-tertiary)" />
                          <span>{store.address}</span>
                        </div>
                        <div className="store-meta-row">
                          <Mail size={15} color="var(--text-tertiary)" />
                          <span>{store.email}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="store-card-footer">
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                            Overall Score
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <StarRating rating={ratingInfo.avg} size={15} />
                            <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                              {ratingInfo.avg > 0 ? ratingInfo.avg : 'N/A'}
                            </strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                              ({ratingInfo.count})
                            </span>
                          </div>
                        </div>

                        {currentUser && (
                          userRatingObj ? (
                            <button
                              type="button"
                              className="btn-outline-amber"
                              onClick={() => handleOpenRatingModal(store, userRatingObj.rating)}
                            >
                              <Edit3 size={14} /> {userRatingObj.rating}★ Edit
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-amber-action"
                              onClick={() => handleOpenRatingModal(store, 5)}
                            >
                              <Star size={14} /> Rate
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredStores.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
                  No stores match your current filter query.
                </div>
              )}
            </div>
          ) : (
            <DataTable
              columns={tableColumns}
              data={filteredStores}
              emptyMessage="No stores found matching your search criteria."
            />
          )}
        </div>
      </div>

      {/* Rating Submit/Modify Modal */}
      {selectedStoreForRating && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '460px' }}>
            <div className="modal-dialog-header">
              <h3>
                {ratings.some((r) => r.storeId === selectedStoreForRating.id && r.userId === currentUser?.id)
                  ? 'Modify Store Rating'
                  : 'Submit Customer Rating'}
              </h3>
              <button
                type="button"
                className="action-btn-circle"
                onClick={() => setSelectedStoreForRating(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-dialog-body" style={{ textAlign: 'center' }}>
              <div className="store-logo-avatar" style={{ margin: '0 auto 12px', width: '54px', height: '54px' }}>
                <Store size={26} />
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {selectedStoreForRating.name}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '24px' }}>
                {selectedStoreForRating.address}
              </p>

              <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tap stars to set rating:
                </span>
                <StarRating
                  rating={tempRating}
                  interactive={true}
                  onRate={(val) => setTempRating(val)}
                  size={36}
                />
                
                {/* Dynamic Rating Feedback Label */}
                {(() => {
                  const fb = getRatingFeedbackLabel(tempRating);
                  return (
                    <span className="rating-feedback-badge" style={{ color: fb.color, background: fb.bg }}>
                      {fb.text}
                    </span>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button
                  type="button"
                  className="btn-secondary-light"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setSelectedStoreForRating(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-emerald"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => handleSaveRating(selectedStoreForRating.id, tempRating)}
                >
                  Save Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

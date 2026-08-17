import React, { useState, useEffect } from 'react';
import { storeService } from '../services/api';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import { Search, MapPin, Store, LayoutGrid, List, Star, Award, CheckCircle, Loader2 } from 'lucide-react';

export default function ExploreStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Search Filters
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');

  // Rating Modal State
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);

  const { showToast } = useToast();

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await storeService.getStores({
        searchName,
        searchAddress
      });
      setStores(res.data.stores || []);
    } catch (err) {
      showToast('Failed to load stores directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [searchName, searchAddress]);

  const openRatingModal = (store) => {
    setSelectedStore(store);
    setSelectedRating(store.user_rating ? parseInt(store.user_rating, 10) : 5);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;

    setSubmittingRating(true);
    try {
      await storeService.submitRating(selectedStore.id, selectedRating);
      showToast(`Thank you! Your ${selectedRating}-star rating for "${selectedStore.name}" has been recorded.`, 'success');
      setSelectedStore(null);
      fetchStores();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit rating.', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="page-container">
      {/* Top Page Header */}
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-title">Explore Local Merchants</h1>
          <p className="page-subtitle">Browse verified local stores, inspect average consumer ratings, and share your review</p>
        </div>

        {/* View Mode Toggle */}
        <div className="view-mode-toggle-group">
          <button
            type="button"
            className={`toggle-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            type="button"
            className={`toggle-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Search Filters */}
      <div className="filter-card mb-6">
        <div className="filter-grid cols-2">
          <div className="input-wrapper">
            <Search size={16} className="input-icon-left" />
            <input
              type="text"
              className="custom-input sm"
              placeholder="Search by Store Name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          <div className="input-wrapper">
            <MapPin size={16} className="input-icon-left" />
            <input
              type="text"
              className="custom-input sm"
              placeholder="Search by Location / Physical Address..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="store-cards-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="skeleton-card" style={{ height: '240px' }} />
            ))
          ) : stores.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              <Store size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg font-semibold">No stores found</p>
              <p className="text-sm">Try adjusting your name or address search query.</p>
            </div>
          ) : (
            stores.map((store) => (
              <div key={store.id} className="store-grid-card">
                <div className="store-card-header">
                  <div className="store-icon-box">
                    <Store size={22} className="text-emerald-600" />
                  </div>
                  <div className="store-header-info">
                    <h3 className="store-name">{store.name}</h3>
                    <p className="store-email">{store.email}</p>
                  </div>
                </div>

                <div className="store-address-row mb-4">
                  <MapPin size={15} className="text-slate-400 shrink-0" />
                  <span>{store.address}</span>
                </div>

                {/* Rating Banner */}
                <div className="store-rating-banner">
                  <div className="banner-score">
                    <StarRating rating={parseFloat(store.avg_rating)} readOnly showLabel size={16} />
                    <span className="reviews-count">({store.total_reviews} reviews)</span>
                  </div>

                  {store.user_rating ? (
                    <div className="user-rating-chip active">
                      <CheckCircle size={13} />
                      <span>Your Rating: {store.user_rating} ★</span>
                    </div>
                  ) : (
                    <div className="user-rating-chip">
                      <span>Not rated yet</span>
                    </div>
                  )}
                </div>

                {/* Rate Store Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    className="btn-emerald-sm w-full justify-center"
                    onClick={() => openRatingModal(store)}
                  >
                    <Star size={15} />
                    <span>{store.user_rating ? 'Modify Your Rating' : 'Rate Store'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="table-wrapper-card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Location Address</th>
                  <th>Overall Score</th>
                  <th>Total Reviews</th>
                  <th>Your Submitted Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx}>
                      <td colSpan={6}>
                        <div className="skeleton-bar" />
                      </td>
                    </tr>
                  ))
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No stores found matching criteria.
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr key={store.id}>
                      <td>
                        <div className="font-bold text-slate-800">{store.name}</div>
                        <div className="text-xs text-slate-400">{store.email}</div>
                      </td>
                      <td className="text-sm text-slate-600">{store.address}</td>
                      <td>
                        <StarRating rating={parseFloat(store.avg_rating)} readOnly showLabel size={15} />
                      </td>
                      <td>
                        <span className="badge-slate">{store.total_reviews} reviews</span>
                      </td>
                      <td>
                        {store.user_rating ? (
                          <span className="badge-emerald">{store.user_rating} ★ Submitted</span>
                        ) : (
                          <span className="text-xs text-slate-400">Not Rated</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-emerald-sm"
                          onClick={() => openRatingModal(store)}
                        >
                          <Star size={14} />
                          <span>{store.user_rating ? 'Modify' : 'Rate'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rating Modal Dialog */}
      <Modal
        isOpen={!!selectedStore}
        onClose={() => setSelectedStore(null)}
        title={`Rate ${selectedStore?.name || 'Store'}`}
        maxWidth="480px"
      >
        <form onSubmit={handleRatingSubmit} className="text-center py-2">
          <p className="text-sm text-slate-600 mb-6">
            Tap a star to select your overall customer experience rating (1 = Poor, 5 = Excellent).
          </p>

          {/* Interactive Stars */}
          <div className="flex justify-center mb-6">
            <StarRating
              rating={selectedRating}
              onChange={(newRating) => setSelectedRating(newRating)}
              size={32}
              readOnly={false}
            />
          </div>

          <div className="text-lg font-bold text-emerald-800 mb-6">
            {selectedRating === 5 && '★★★★★ Excellent Experience'}
            {selectedRating === 4 && '★★★★☆ Very Good'}
            {selectedRating === 3 && '★★★☆☆ Average Service'}
            {selectedRating === 2 && '★★☆☆☆ Below Average'}
            {selectedRating === 1 && '★☆☆☆☆ Poor Service'}
          </div>

          <div className="modal-actions-row justify-center">
            <button
              type="button"
              className="btn-secondary-light"
              onClick={() => setSelectedStore(null)}
              disabled={submittingRating}
            >
              Cancel
            </button>
            <button type="submit" className="btn-emerald" disabled={submittingRating}>
              {submittingRating ? (
                <>
                  <Loader2 size={16} className="spin-loader" /> Submitting...
                </>
              ) : (
                'Submit Store Rating'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

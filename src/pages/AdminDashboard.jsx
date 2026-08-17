import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Users, Store, Star, Award, Plus, ArrowRight, Building2, UserPlus } from 'lucide-react';
import RatingDistributionChart from '../components/RatingDistributionChart';
import AddStoreModal from '../components/AddStoreModal';
import AddUserModal from '../components/AddUserModal';
import StarRating from '../components/StarRating';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeOwners, setStoreOwners] = useState([]);

  // Modal States
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const { showToast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      setData(res.data);

      // Fetch store owners for the store creation dropdown
      const usersRes = await adminService.getUsers({ role: 'Store Owner' });
      setStoreOwners(usersRes.data.users || []);
    } catch (err) {
      showToast('Failed to load admin dashboard statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateStore = async (storeData) => {
    await adminService.createStore(storeData);
    showToast('Store created successfully!', 'success');
    fetchDashboardData();
  };

  const handleCreateUser = async (userData) => {
    await adminService.createUser(userData);
    showToast('User created successfully!', 'success');
    fetchDashboardData();
  };

  const stats = data?.stats || { totalUsers: 0, totalStores: 0, totalRatings: 0, avgStoreRating: 0 };
  const ratingDistribution = data?.ratingDistribution || {};
  const recentStores = data?.recentStores || [];

  return (
    <div className="page-container">
      {/* Top Header Bar */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Platform metrics, merchant listings, and database management</p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn-secondary-light"
            onClick={() => setIsUserModalOpen(true)}
          >
            <UserPlus size={16} />
            <span>Add User Account</span>
          </button>
          <button
            type="button"
            className="btn-emerald"
            onClick={() => setIsStoreModalOpen(true)}
          >
            <Plus size={18} />
            <span>Register Store</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper users">
            <Users size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Users</span>
            <span className="kpi-value">{loading ? '...' : stats.totalUsers}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper stores">
            <Store size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Registered Stores</span>
            <span className="kpi-value">{loading ? '...' : stats.totalStores}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper ratings">
            <Star size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Ratings</span>
            <span className="kpi-value">{loading ? '...' : stats.totalRatings}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper avg">
            <Award size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Platform Avg Rating</span>
            <span className="kpi-value">{loading ? '...' : `${stats.avgStoreRating} ★`}</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="dashboard-content-grid">
        {/* Rating Breakdown Chart */}
        <div className="grid-col-left">
          <RatingDistributionChart distribution={ratingDistribution} />
        </div>

        {/* Recent Registered Stores Table */}
        <div className="grid-col-right">
          <div className="card-box">
            <div className="card-box-header">
              <div className="card-box-title">
                <Building2 size={18} className="text-emerald-500" />
                <h3>Recent Registered Stores</h3>
              </div>
              <Link to="/admin/stores" className="card-header-link">
                View All Stores <ArrowRight size={14} />
              </Link>
            </div>

            <div className="table-responsive">
              <table className="custom-table compact">
                <thead>
                  <tr>
                    <th>Store Name</th>
                    <th>Average Rating</th>
                    <th>Reviews</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx}>
                        <td colSpan={4}>
                          <div className="skeleton-bar" />
                        </td>
                      </tr>
                    ))
                  ) : recentStores.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-400">
                        No stores registered yet.
                      </td>
                    </tr>
                  ) : (
                    recentStores.map((store) => (
                      <tr key={store.id}>
                        <td>
                          <div className="font-semibold text-slate-800">{store.name}</div>
                          <div className="text-xs text-slate-500">{store.address}</div>
                        </td>
                        <td>
                          <StarRating rating={parseFloat(store.avg_rating)} readOnly showLabel size={14} />
                        </td>
                        <td>
                          <span className="badge-slate">{store.reviews_count} reviews</span>
                        </td>
                        <td>
                          {store.owner_name ? (
                            <span className="text-sm text-slate-700">{store.owner_name}</span>
                          ) : (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddStoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onSubmitSuccess={handleCreateStore}
        storeOwners={storeOwners}
      />

      <AddUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmitSuccess={handleCreateUser}
      />
    </div>
  );
}

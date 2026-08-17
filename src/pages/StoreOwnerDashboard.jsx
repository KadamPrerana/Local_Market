import React, { useState, useEffect } from 'react';
import { ownerService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Building2, Star, MessageSquare, Award, ArrowRight, MapPin, Mail, AlertCircle } from 'lucide-react';
import RatingDistributionChart from '../components/RatingDistributionChart';
import StarRating from '../components/StarRating';
import { Link } from 'react-router-dom';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadOwnerData() {
      try {
        setLoading(true);
        const res = await ownerService.getDashboard();
        setData(res.data);

        if (res.data.hasStore) {
          const reviewsRes = await ownerService.getReviews({ sortBy: 'date', sortOrder: 'desc' });
          setReviews(reviewsRes.data.reviews || []);
        }
      } catch (err) {
        showToast('Failed to load store owner metrics.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadOwnerData();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton-card mb-6" style={{ height: '140px' }} />
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="skeleton-card" style={{ height: '100px' }} />
          <div className="skeleton-card" style={{ height: '100px' }} />
          <div className="skeleton-card" style={{ height: '100px' }} />
        </div>
      </div>
    );
  }

  if (!data?.hasStore) {
    return (
      <div className="page-container text-center py-16">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Store Assigned Yet</h2>
        <p className="text-slate-600 max-w-md mx-auto mb-6">
          Your Store Owner account is currently not assigned to any merchant listing. Please contact a System Administrator to link your account to your store.
        </p>
      </div>
    );
  }

  const { store, stats, ratingDistribution } = data;

  return (
    <div className="page-container">
      {/* Merchant Banner */}
      <div className="owner-store-banner mb-6">
        <div className="banner-icon-box">
          <Building2 size={28} className="text-emerald-600" />
        </div>
        <div className="banner-info">
          <h1 className="banner-title">{store.name}</h1>
          <div className="banner-meta-row">
            <span className="meta-item">
              <Mail size={14} /> {store.email}
            </span>
            <span className="meta-item">
              <MapPin size={14} /> {store.address}
            </span>
          </div>
        </div>
      </div>

      {/* 3 KPI Metric Cards */}
      <div className="kpi-grid cols-3 mb-6">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper avg">
            <Star size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Average Store Rating</span>
            <span className="kpi-value">{stats.avgRating} ★</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper ratings">
            <MessageSquare size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Customer Reviews</span>
            <span className="kpi-value">{stats.totalReviews}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper stores">
            <Award size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">5-Star Excellence Ratio</span>
            <span className="kpi-value">{stats.fiveStarRatio}%</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="dashboard-content-grid">
        <div className="grid-col-left">
          <RatingDistributionChart distribution={ratingDistribution} />
        </div>

        <div className="grid-col-right">
          <div className="card-box">
            <div className="card-box-header">
              <div className="card-box-title">
                <MessageSquare size={18} className="text-emerald-600" />
                <h3>Recent Customer Reviews</h3>
              </div>
              <Link to="/owner/reviews" className="card-header-link">
                View All Reviews <ArrowRight size={14} />
              </Link>
            </div>

            <div className="table-responsive">
              <table className="custom-table compact">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Submitted Rating</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-6 text-slate-500">
                        No customer reviews received yet.
                      </td>
                    </tr>
                  ) : (
                    reviews.slice(0, 5).map((rev) => (
                      <tr key={rev.id}>
                        <td>
                          <div className="font-bold text-slate-800">{rev.customer_name}</div>
                          <div className="text-xs text-slate-400">{rev.customer_email}</div>
                        </td>
                        <td>
                          <StarRating rating={rev.rating} readOnly showLabel size={14} />
                        </td>
                        <td className="text-xs text-slate-500">
                          {new Date(rev.created_at).toLocaleDateString()}
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
    </div>
  );
}

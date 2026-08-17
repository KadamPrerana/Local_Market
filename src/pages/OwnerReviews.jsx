import React, { useState, useEffect } from 'react';
import { ownerService } from '../services/api';
import { useToast } from '../context/ToastContext';
import DataTable from '../components/DataTable';
import StarRating from '../components/StarRating';
import { MessageSquare, Search, Filter } from 'lucide-react';

export default function OwnerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCustomer, setSearchCustomer] = useState('');
  const { showToast } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await ownerService.getReviews({
        searchCustomer,
        sortBy: 'date',
        sortOrder: 'desc'
      });
      setReviews(res.data.reviews || []);
    } catch (err) {
      showToast('Failed to retrieve customer reviews.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [searchCustomer]);

  const columns = [
    {
      header: 'Customer Details',
      key: 'customer_name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-800">{row.customer_name}</div>
          <div className="text-xs text-slate-500">{row.customer_email}</div>
        </div>
      )
    },
    {
      header: 'Submitted Rating',
      key: 'rating',
      sortable: true,
      render: (row) => (
        <StarRating rating={row.rating} readOnly showLabel size={16} />
      )
    },
    {
      header: 'Date & Time',
      key: 'created_at',
      sortable: true,
      sortField: 'date',
      render: (row) => (
        <span className="text-sm text-slate-600">
          {new Date(row.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-title">Customer Feedback Audit</h1>
          <p className="page-subtitle">Inspect customer reviews and rating scores submitted for your business</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-card mb-6">
        <div className="filter-card-header">
          <Filter size={16} className="text-emerald-600" />
          <span>Filter Customer Feedback</span>
        </div>
        <div className="filter-grid cols-1">
          <div className="input-wrapper">
            <Search size={16} className="input-icon-left" />
            <input
              type="text"
              className="custom-input sm"
              placeholder="Search by Customer Name or Email..."
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        pageSize={8}
        emptyMessage="No customer reviews found matching your search."
      />
    </div>
  );
}

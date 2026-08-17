import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { useToast } from '../context/ToastContext';
import DataTable from '../components/DataTable';
import AddUserModal from '../components/AddUserModal';
import { UserPlus, Search, Filter, Eye, Shield, Building2, User, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        searchName,
        searchEmail,
        searchAddress,
        role: roleFilter
      });
      setUsers(res.data.users || []);
    } catch (err) {
      showToast('Failed to retrieve user accounts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchName, searchEmail, searchAddress, roleFilter]);

  const handleCreateUser = async (userData) => {
    await adminService.createUser(userData);
    showToast('User account created successfully!', 'success');
    fetchUsers();
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'System Administrator':
        return (
          <span className="badge-role-admin inline-flex items-center gap-1">
            <Shield size={12} /> Admin
          </span>
        );
      case 'Store Owner':
        return (
          <span className="badge-role-owner inline-flex items-center gap-1">
            <Building2 size={12} /> Store Owner
          </span>
        );
      default:
        return (
          <span className="badge-role-user inline-flex items-center gap-1">
            <User size={12} /> Normal User
          </span>
        );
    }
  };

  const columns = [
    {
      header: 'Full Name',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-800">{row.name}</div>
          <div className="text-xs text-slate-400">ID: #{row.id}</div>
        </div>
      )
    },
    {
      header: 'Email Address',
      key: 'email',
      sortable: true,
      render: (row) => <span className="text-sm text-slate-700">{row.email}</span>
    },
    {
      header: 'Physical Address',
      key: 'address',
      sortable: true,
      render: (row) => <span className="text-sm text-slate-600">{row.address}</span>
    },
    {
      header: 'Role',
      key: 'role',
      sortable: true,
      render: (row) => getRoleBadge(row.role)
    },
    {
      header: 'Assigned Store Rating',
      key: 'store_avg_rating',
      sortable: true,
      render: (row) => (
        row.role === 'Store Owner' ? (
          row.store_name ? (
            <div>
              <div className="text-xs font-semibold text-slate-800">{row.store_name}</div>
              <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Star size={12} fill="#f59e0b" color="#f59e0b" />
                <span>{row.store_avg_rating} ★ ({row.store_ratings_count} reviews)</span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">No Store Assigned</span>
          )
        ) : (
          <span className="text-xs text-slate-400">N/A</span>
        )
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <Link
          to={`/admin/users/${row.id}`}
          className="btn-secondary-sm"
          title="View Full Profile Details"
        >
          <Eye size={14} />
          <span>View Details</span>
        </Link>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-title">User Accounts Directory</h1>
          <p className="page-subtitle">Manage system administrators, merchant operators, and registered consumers</p>
        </div>
        <button
          type="button"
          className="btn-emerald"
          onClick={() => setIsAddUserOpen(true)}
        >
          <UserPlus size={18} />
          <span>Add New User Account</span>
        </button>
      </div>

      {/* Multi-Filter Bar */}
      <div className="filter-card mb-6">
        <div className="filter-card-header">
          <Filter size={16} className="text-emerald-600" />
          <span>Filter User Accounts</span>
        </div>
        <div className="filter-grid cols-4">
          <div className="input-wrapper">
            <Search size={16} className="input-icon-left" />
            <input
              type="text"
              className="custom-input sm"
              placeholder="Search by Name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          <div className="input-wrapper">
            <Search size={16} className="input-icon-left" />
            <input
              type="text"
              className="custom-input sm"
              placeholder="Search by Email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </div>

          <div className="input-wrapper">
            <Search size={16} className="input-icon-left" />
            <input
              type="text"
              className="custom-input sm"
              placeholder="Search by Address..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
            />
          </div>

          <div className="input-wrapper">
            <select
              className="custom-input sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="System Administrator">System Administrator</option>
              <option value="Store Owner">Store Owner</option>
              <option value="Normal User">Normal User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        pageSize={8}
        emptyMessage="No user accounts match your search filters."
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSubmitSuccess={handleCreateUser}
      />
    </div>
  );
}

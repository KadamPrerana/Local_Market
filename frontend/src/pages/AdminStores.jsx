import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { useToast } from '../context/ToastContext';
import DataTable from '../components/DataTable';
import StarRating from '../components/StarRating';
import AddStoreModal from '../components/AddStoreModal';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Store, Search, Filter, AlertCircle, Building2 } from 'lucide-react';
import { validateName, validateEmail, validateAddress } from '../utils/validators';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeOwners, setStoreOwners] = useState([]);

  // Search & Filter state
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchAddress, setSearchAddress] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editStoreData, setEditStoreData] = useState(null); // When editing
  const [deleteStoreId, setDeleteStoreId] = useState(null); // When deleting

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editOwnerId, setEditOwnerId] = useState('');
  const [editErrors, setEditErrors] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStores({
        searchName,
        searchEmail,
        searchAddress
      });
      setStores(res.data.stores || []);

      const ownersRes = await adminService.getUsers({ role: 'Store Owner' });
      setStoreOwners(ownersRes.data.users || []);
    } catch (err) {
      showToast('Failed to retrieve stores directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [searchName, searchEmail, searchAddress]);

  const handleAddStore = async (storeData) => {
    await adminService.createStore(storeData);
    showToast('Store registered successfully!', 'success');
    fetchStores();
  };

  const openEditModal = (store) => {
    setEditStoreData(store);
    setEditName(store.name);
    setEditEmail(store.email);
    setEditAddress(store.address);
    setEditOwnerId(store.owner_id ? store.owner_id.toString() : '');
    setEditErrors({});
  };

  const handleUpdateStoreSubmit = async (e) => {
    e.preventDefault();

    const nameErr = validateName(editName);
    const emailErr = validateEmail(editEmail);
    const addressErr = validateAddress(editAddress);

    const errs = {};
    if (nameErr) errs.name = nameErr;
    if (emailErr) errs.email = emailErr;
    if (addressErr) errs.address = addressErr;

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    setEditSubmitting(true);
    try {
      await adminService.updateStore(editStoreData.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        address: editAddress.trim(),
        ownerId: editOwnerId || null
      });
      showToast('Store updated successfully!', 'success');
      setEditStoreData(null);
      fetchStores();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update store.', 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteStoreConfirm = async () => {
    try {
      await adminService.deleteStore(deleteStoreId);
      showToast('Store deleted successfully!', 'success');
      setDeleteStoreId(null);
      fetchStores();
    } catch (err) {
      showToast('Failed to delete store.', 'error');
    }
  };

  const columns = [
    {
      header: 'Store Details',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <Building2 size={16} className="text-emerald-600" />
            <span>{row.name}</span>
          </div>
          <div className="text-xs text-slate-500">{row.email}</div>
        </div>
      )
    },
    {
      header: 'Address',
      key: 'address',
      sortable: true,
      render: (row) => <span className="text-sm text-slate-600">{row.address}</span>
    },
    {
      header: 'Rating Score',
      key: 'avg_rating',
      sortable: true,
      sortField: 'rating',
      render: (row) => (
        <StarRating rating={parseFloat(row.avg_rating)} readOnly showLabel size={15} />
      )
    },
    {
      header: 'Reviews',
      key: 'total_reviews',
      sortable: true,
      sortField: 'reviews',
      render: (row) => (
        <span className="badge-slate font-semibold">{row.total_reviews} reviews</span>
      )
    },
    {
      header: 'Assigned Owner',
      key: 'owner_name',
      sortable: true,
      render: (row) => (
        row.owner_name ? (
          <div>
            <div className="text-sm font-medium text-slate-800">{row.owner_name}</div>
            <div className="text-xs text-slate-400">{row.owner_email}</div>
          </div>
        ) : (
          <span className="badge-warning">Unassigned</span>
        )
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="table-actions-row">
          <button
            type="button"
            className="action-btn-secondary"
            onClick={() => openEditModal(row)}
            title="Edit Store"
          >
            <Edit size={15} />
          </button>
          <button
            type="button"
            className="action-btn-danger"
            onClick={() => setDeleteStoreId(row.id)}
            title="Delete Store"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-title">Stores Management</h1>
          <p className="page-subtitle">Manage registered stores, address details, and store owner assignments</p>
        </div>
        <button
          type="button"
          className="btn-emerald"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} />
          <span>Add New Store</span>
        </button>
      </div>

      {/* Multi-Filter Search Bar */}
      <div className="filter-card mb-6">
        <div className="filter-card-header">
          <Filter size={16} className="text-emerald-600" />
          <span>Search & Filter Stores</span>
        </div>
        <div className="filter-grid">
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
            <Search size={16} className="input-icon-left" />
            <input
              type="text"
              className="custom-input sm"
              placeholder="Search by Email Address..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </div>

          <div className="input-wrapper">
            <Search size={16} className="input-icon-left" />
            <input
              type="text"
              className="custom-input sm"
              placeholder="Search by Physical Address..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={stores}
        loading={loading}
        pageSize={8}
        emptyMessage="No store records match your current search criteria."
      />

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmitSuccess={handleAddStore}
        storeOwners={storeOwners}
      />

      {/* Edit Store Modal */}
      <Modal
        isOpen={!!editStoreData}
        onClose={() => setEditStoreData(null)}
        title="Edit Store Details"
      >
        <form onSubmit={handleUpdateStoreSubmit}>
          <div className="form-group mb-4">
            <div className="form-label-row">
              <label className="custom-label">Store Name</label>
              <span className={`char-counter ${editName.trim().length < 20 || editName.trim().length > 60 ? 'invalid' : 'valid'}`}>
                {editName.trim().length}/60 chars (min 20)
              </span>
            </div>
            <input
              type="text"
              className={`custom-input ${editErrors.name ? 'input-error' : ''}`}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            {editErrors.name && <span className="field-error-text">{editErrors.name}</span>}
          </div>

          <div className="form-group mb-4">
            <label className="custom-label">Store Email</label>
            <input
              type="email"
              className={`custom-input ${editErrors.email ? 'input-error' : ''}`}
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
            {editErrors.email && <span className="field-error-text">{editErrors.email}</span>}
          </div>

          <div className="form-group mb-4">
            <div className="form-label-row">
              <label className="custom-label">Store Address</label>
              <span className={`char-counter ${editAddress.trim().length > 400 ? 'invalid' : ''}`}>
                {editAddress.trim().length}/400 chars
              </span>
            </div>
            <textarea
              className={`custom-input textarea ${editErrors.address ? 'input-error' : ''}`}
              rows={3}
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
            />
            {editErrors.address && <span className="field-error-text">{editErrors.address}</span>}
          </div>

          <div className="form-group mb-5">
            <label className="custom-label">Assign Store Owner</label>
            <select
              className="custom-input"
              value={editOwnerId}
              onChange={(e) => setEditOwnerId(e.target.value)}
            >
              <option value="">-- Unassigned --</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions-row">
            <button
              type="button"
              className="btn-secondary-light"
              onClick={() => setEditStoreData(null)}
              disabled={editSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-emerald" disabled={editSubmitting}>
              {editSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteStoreId}
        onClose={() => setDeleteStoreId(null)}
        title="Confirm Store Deletion"
        maxWidth="440px"
      >
        <div className="text-center py-4">
          <div className="delete-warning-icon">
            <AlertCircle size={36} color="#ef4444" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-2">Are you sure?</h4>
          <p className="text-sm text-slate-600 mb-6">
            Deleting this store will remove its record and associated customer ratings. This action cannot be undone.
          </p>
          <div className="modal-actions-row justify-center">
            <button
              type="button"
              className="btn-secondary-light"
              onClick={() => setDeleteStoreId(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={handleDeleteStoreConfirm}
            >
              Delete Store
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

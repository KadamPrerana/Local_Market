import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Store, Mail, MapPin, User, AlertCircle, Loader2 } from 'lucide-react';
import { validateName, validateEmail, validateAddress } from '../utils/validators';

export default function AddStoreModal({ isOpen, onClose, onSubmitSuccess, storeOwners = [] }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setAddress('');
      setOwnerId('');
      setErrors({});
      setServerError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const addressErr = validateAddress(address);

    const newErrors = {};
    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (addressErr) newErrors.address = addressErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitSuccess({
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        ownerId: ownerId || null
      });
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to create store. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Store" maxWidth="580px">
      <form onSubmit={handleSubmit}>
        {serverError && (
          <div className="alert-box danger mb-4">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Store Name Field */}
        <div className="form-group mb-4">
          <div className="form-label-row">
            <label className="custom-label">Store Name</label>
            <span className={`char-counter ${name.trim().length < 20 || name.trim().length > 60 ? 'invalid' : 'valid'}`}>
              {name.trim().length}/60 characters (min 20)
            </span>
          </div>
          <div className="input-wrapper">
            <Store size={18} className="input-icon-left" />
            <input
              type="text"
              className={`custom-input ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g. FreshMart Organic Supermarket"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
            />
          </div>
          {errors.name && <span className="field-error-text">{errors.name}</span>}
        </div>

        {/* Store Contact Email */}
        <div className="form-group mb-4">
          <label className="custom-label">Store Contact Email</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon-left" />
            <input
              type="email"
              className={`custom-input ${errors.email ? 'input-error' : ''}`}
              placeholder="e.g. contact@freshmartorganic.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
            />
          </div>
          {errors.email && <span className="field-error-text">{errors.email}</span>}
        </div>

        {/* Store Address */}
        <div className="form-group mb-4">
          <div className="form-label-row">
            <label className="custom-label">Store Address</label>
            <span className={`char-counter ${address.trim().length > 400 ? 'invalid' : ''}`}>
              {address.trim().length}/400 characters
            </span>
          </div>
          <div className="input-wrapper">
            <MapPin size={18} className="input-icon-left textarea-icon" />
            <textarea
              className={`custom-input textarea ${errors.address ? 'input-error' : ''}`}
              rows={3}
              placeholder="e.g. 100 Mahatma Gandhi Road, Camp, Pune, MH 411001"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) setErrors((prev) => ({ ...prev, address: null }));
              }}
            />
          </div>
          {errors.address && <span className="field-error-text">{errors.address}</span>}
        </div>

        {/* Assign Store Owner */}
        <div className="form-group mb-5">
          <label className="custom-label">Assign Store Owner (Optional)</label>
          <div className="input-wrapper">
            <User size={18} className="input-icon-left" />
            <select
              className="custom-input"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
            >
              <option value="">-- Select Store Owner --</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-actions-row">
          <button type="button" className="btn-secondary-light" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn-emerald" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="spin-loader" /> Creating Store...
              </>
            ) : (
              'Create Store'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

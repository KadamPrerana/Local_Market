import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { User, Mail, Lock, MapPin, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { validateName, validateEmail, validateAddress, validatePassword } from '../utils/validators';

export default function AddUserModal({ isOpen, onClose, onSubmitSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('Normal User');

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setAddress('');
      setRole('Normal User');
      setErrors({});
      setServerError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const addressErr = validateAddress(address);

    const newErrors = {};
    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (passErr) newErrors.password = passErr;
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
        password,
        address: address.trim(),
        role
      });
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to create user account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New User Account" maxWidth="580px">
      <form onSubmit={handleSubmit}>
        {serverError && (
          <div className="alert-box danger mb-4">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Full Name */}
        <div className="form-group mb-4">
          <div className="form-label-row">
            <label className="custom-label">Full Name</label>
            <span className={`char-counter ${name.trim().length < 20 || name.trim().length > 60 ? 'invalid' : 'valid'}`}>
              {name.trim().length}/60 characters (min 20)
            </span>
          </div>
          <div className="input-wrapper">
            <User size={18} className="input-icon-left" />
            <input
              type="text"
              className={`custom-input ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g. Aarav Sharma Verified Customer"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
            />
          </div>
          {errors.name && <span className="field-error-text">{errors.name}</span>}
        </div>

        {/* Email Address */}
        <div className="form-group mb-4">
          <label className="custom-label">Email Address</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon-left" />
            <input
              type="email"
              className={`custom-input ${errors.email ? 'input-error' : ''}`}
              placeholder="e.g. aarav.sharma@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
            />
          </div>
          {errors.email && <span className="field-error-text">{errors.email}</span>}
        </div>

        {/* Password */}
        <div className="form-group mb-4">
          <label className="custom-label">Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon-left" />
            <input
              type="password"
              className={`custom-input ${errors.password ? 'input-error' : ''}`}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
            />
          </div>
          <span className="field-hint">Must be 8–16 characters with 1 uppercase & 1 special character (e.g. UserPass123!)</span>
          {errors.password && <span className="field-error-text">{errors.password}</span>}
        </div>

        {/* Physical Address */}
        <div className="form-group mb-4">
          <div className="form-label-row">
            <label className="custom-label">Address / Location</label>
            <span className={`char-counter ${address.trim().length > 400 ? 'invalid' : ''}`}>
              {address.trim().length}/400 characters
            </span>
          </div>
          <div className="input-wrapper">
            <MapPin size={18} className="input-icon-left textarea-icon" />
            <textarea
              className={`custom-input textarea ${errors.address ? 'input-error' : ''}`}
              rows={2}
              placeholder="e.g. 1428 Elm Street, Apartment 4B, Chicago, IL 60601"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) setErrors((prev) => ({ ...prev, address: null }));
              }}
            />
          </div>
          {errors.address && <span className="field-error-text">{errors.address}</span>}
        </div>

        {/* Role Selection */}
        <div className="form-group mb-5">
          <label className="custom-label">Assign Account Role</label>
          <div className="input-wrapper">
            <ShieldCheck size={18} className="input-icon-left" />
            <select
              className="custom-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Normal User">Normal User (Customer)</option>
              <option value="Store Owner">Store Owner (Business Operator)</option>
              <option value="System Administrator">System Administrator (Full Access)</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions-row">
          <button type="button" className="btn-secondary-light" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn-emerald" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="spin-loader" /> Creating User...
              </>
            ) : (
              'Create User'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

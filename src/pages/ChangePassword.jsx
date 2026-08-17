import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Key, Lock, Eye, EyeOff, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { validatePassword } from '../utils/validators';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { changePassword } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!currentPassword) {
      setErrors({ currentPassword: 'Current password is required.' });
      return;
    }

    const passErr = validatePassword(newPassword);
    const newErrors = {};
    if (passErr) newErrors.newPassword = passErr;
    if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = 'New password and confirmation do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword
      });
      showToast('Your password has been changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setErrors({});
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="page-header-row mb-6">
        <div>
          <h1 className="page-title">Change Account Password</h1>
          <p className="page-subtitle">Update your login credentials to maintain corporate portal security</p>
        </div>
      </div>

      <div className="card-box">
        {serverError && (
          <div className="alert-box danger mb-6">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="form-group mb-5">
            <label className="custom-label">Current Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon-left" />
              <input
                type={showPass ? 'text' : 'password'}
                className={`custom-input pr-10 ${errors.currentPassword ? 'input-error' : ''}`}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errors.currentPassword) setErrors((prev) => ({ ...prev, currentPassword: null }));
                }}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.currentPassword && <span className="field-error-text">{errors.currentPassword}</span>}
          </div>

          {/* New Password */}
          <div className="form-group mb-5">
            <label className="custom-label">New Password</label>
            <div className="input-wrapper">
              <Key size={18} className="input-icon-left" />
              <input
                type={showPass ? 'text' : 'password'}
                className={`custom-input ${errors.newPassword ? 'input-error' : ''}`}
                placeholder="8-16 chars, 1 uppercase, 1 special char"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: null }));
                }}
              />
            </div>
            <span className="field-hint">Must be 8–16 characters with 1 uppercase & 1 special character (e.g. NewPass123!)</span>
            {errors.newPassword && <span className="field-error-text">{errors.newPassword}</span>}
          </div>

          {/* Confirm New Password */}
          <div className="form-group mb-6">
            <label className="custom-label">Confirm New Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon-left" />
              <input
                type={showPass ? 'text' : 'password'}
                className={`custom-input ${errors.confirmNewPassword ? 'input-error' : ''}`}
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  if (errors.confirmNewPassword) setErrors((prev) => ({ ...prev, confirmNewPassword: null }));
                }}
              />
            </div>
            {errors.confirmNewPassword && <span className="field-error-text">{errors.confirmNewPassword}</span>}
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-emerald" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="spin-loader" /> Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Store, User, Mail, Lock, MapPin, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { validateName, validateEmail, validateAddress, validatePassword } from '../utils/validators';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const addressErr = validateAddress(address);
    const passErr = validatePassword(password);

    const newErrors = {};
    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (addressErr) newErrors.address = addressErr;
    if (passErr) newErrors.password = passErr;
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        password,
        confirmPassword
      });
      showToast(`Account registered successfully! Welcome ${user.name}.`, 'success');
      navigate('/stores');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="register-card">
        <div className="register-header">
          <div className="brand-badge mb-4">
            <Store size={20} className="brand-badge-icon" />
            <span>LocalMarket Portal</span>
          </div>
          <h2 className="panel-title">Create Normal User Account</h2>
          <p className="panel-subtitle">Sign up to discover and rate local merchants</p>
        </div>

        {serverError && (
          <div className="alert-box danger mb-6">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit}>
          {/* Full Name */}
          <div className="form-group mb-4">
            <div className="form-label-row">
              <label className="custom-label">Full Name</label>
              <span className={`char-counter ${name.trim().length < 20 || name.trim().length > 60 ? 'invalid' : 'valid'}`}>
                {name.trim().length}/60 chars (min 20)
              </span>
            </div>
            <div className="input-wrapper">
              <User size={18} className="input-icon-left" />
              <input
                type="text"
                className={`custom-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Jonathan Smith Customer Account"
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
                placeholder="e.g. jonathan.smith@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
              />
            </div>
            {errors.email && <span className="field-error-text">{errors.email}</span>}
          </div>

          {/* Address */}
          <div className="form-group mb-4">
            <div className="form-label-row">
              <label className="custom-label">Physical Address</label>
              <span className={`char-counter ${address.trim().length > 400 ? 'invalid' : ''}`}>
                {address.trim().length}/400 chars
              </span>
            </div>
            <div className="input-wrapper">
              <MapPin size={18} className="input-icon-left textarea-icon" />
              <textarea
                className={`custom-input textarea ${errors.address ? 'input-error' : ''}`}
                rows={2}
                placeholder="e.g. 742 Evergreen Terrace, Springfield, OR 97477"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors((prev) => ({ ...prev, address: null }));
                }}
              />
            </div>
            {errors.address && <span className="field-error-text">{errors.address}</span>}
          </div>

          {/* Password */}
          <div className="form-group mb-4">
            <label className="custom-label">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon-left" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`custom-input pr-10 ${errors.password ? 'input-error' : ''}`}
                placeholder="8-16 chars, 1 uppercase, 1 special char"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <span className="field-hint">Must be 8–16 characters with 1 uppercase & 1 special character (e.g. Pass1234!)</span>
            {errors.password && <span className="field-error-text">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group mb-6">
            <label className="custom-label">Confirm Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon-left" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`custom-input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                }}
              />
            </div>
            {errors.confirmPassword && <span className="field-error-text">{errors.confirmPassword}</span>}
          </div>

          {/* Submit */}
          <button type="submit" className="btn-emerald-lg w-full mb-6" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spin-loader" /> Creating Account...
              </>
            ) : (
              <>
                Complete Registration <ArrowRight size={18} />
              </>
            ) }
          </button>

          <div className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
